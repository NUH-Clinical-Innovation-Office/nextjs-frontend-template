/** biome-ignore-all lint/style/useNamingConvention: Next.js route handlers must be named after the HTTP verb, and HTTP header names are not camelCase */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/lib/env';

/**
 * Server-side proxy to common-service.
 *
 * common-service has no ingress, so the browser cannot reach it directly. The
 * browser posts here (same origin) and this handler forwards the call over the
 * cluster-internal address.
 *
 * Two credentials are supported, matching the two security schemes in
 * common-service's openapi.yaml:
 *
 *   - X-API-Key (preferred). This app is a Consumer Backend: it presents its
 *     developer API key and common-service exchanges it at auth-service for a
 *     short-lived, audience-bound JWT. The key stays server-side and the
 *     browser never sees or supplies a credential.
 *   - Authorization: Bearer. Used only when no API key is configured, for
 *     local development against a pre-issued token.
 *
 * Note that a token minted directly by auth-service's /oauth2/token
 * (client_credentials) will NOT work: auth-service leaves `aud` defaulted to
 * the requesting client_id, which never matches this service's audience, so
 * common-service rejects it with 401. The API-key path is the supported one.
 *
 * No credential is ever logged, stored, or echoed back.
 */

export const runtime = 'nodejs';

/**
 * Mirrors CreateTodoRequest in common-service's openapi.yaml.
 *
 * `token` is optional: it is only required when this deployment has no API key
 * of its own, which is enforced below rather than in the schema so the error
 * can explain which credential is missing.
 */
const requestSchema = z.object({
  token: z.string().min(1, 'token is required').optional(),
  text: z
    .string({ error: 'text is required' })
    .min(1, 'text is required')
    .max(500, 'text must be 500 characters or fewer'),
});

/** Shape of a successful common-service response. */
const upstreamSchema = z.object({
  message: z.string(),
  text: z.string(),
  subject: z.string(),
});

/**
 * common-service's error contract: every JSON error body is `{ detail }`.
 *
 * The rate-limit middleware is the one exception - it responds via http.Error,
 * so a 429 body is text/plain rather than JSON. Parsing is therefore best
 * effort and callers must tolerate a miss.
 */
const upstreamErrorSchema = z.object({ detail: z.string().min(1) });

/**
 * Extracts the upstream `detail` message, or null when the body is not the
 * documented JSON error shape.
 */
async function readUpstreamDetail(response: Response): Promise<string | null> {
  const body = await response.json().catch(() => null);
  const parsed = upstreamErrorSchema.safeParse(body);
  return parsed.success ? parsed.data.detail : null;
}

/**
 * Resolves the API key at request time rather than module load.
 *
 * `env` is validated once when the module is first imported, which is the right
 * behaviour in production but makes the key impossible to vary in tests without
 * defeating the module cache. Reading process.env first keeps the validated
 * value as the fallback while leaving the variable overridable.
 */
function resolveApiKey(): string | undefined {
  const raw = process.env.COMMON_SERVICE_API_KEY;
  if (raw !== undefined) {
    return raw.trim() === '' ? undefined : raw;
  }
  return env.COMMON_SERVICE_API_KEY;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { token, text } = parsed.data;
  const apiKey = resolveApiKey();

  // The API key is the supported credential and takes precedence, mirroring
  // common-service's own resolution order. A browser-supplied token is only
  // consulted when this deployment has no key of its own.
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  } else if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    return NextResponse.json(
      { error: 'token is required when no API key is configured' },
      { status: 400 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${env.COMMON_SERVICE_URL}/api/v1/todos`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(env.API_TIMEOUT),
    });
  } catch (error) {
    // Distinguish a timeout from an unreachable service: the first is worth
    // retrying, the second usually means misconfiguration.
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Common service timed out' }, { status: 504 });
    }
    // The internal URL is deliberately kept out of the response body.
    return NextResponse.json({ error: 'Could not reach common service' }, { status: 502 });
  }

  return mapUpstreamResponse(upstream);
}

/**
 * Translates a common-service response into the proxy's own response.
 *
 * Statuses the caller can act on (401, 400, 413, 429, 503) keep their meaning
 * and carry the upstream `detail` through. Anything else collapses to 502,
 * which reports an upstream fault without leaking its internals.
 */
async function mapUpstreamResponse(upstream: Response): Promise<NextResponse> {
  /*
   * Statuses forwarded verbatim, with the fallback message used when the body
   * is not the documented `{ detail }` shape:
   *
   *   401 - a rejected credential must stay distinct from an outage.
   *   400 - the caller's input was bad; remapping to 502 would misattribute it.
   *   413 - as above, the body exceeded common-service's cap.
   *   503 - the API-key exchange is unconfigured or auth-service is down,
   *         which is a configuration signal rather than a generic fault.
   */
  const passthrough: Record<number, string> = {
    401: 'Token rejected by common service',
    400: 'Common service rejected the request',
    413: 'Common service rejected the request',
    503: 'Common service is unavailable',
  };

  // common-service rate-limits per client IP. Every browser call arrives
  // through this proxy, so the upstream sees a single IP for all users and a
  // 429 is realistic. Retry-After is propagated so the caller can back off
  // rather than hammer a limiter that is already saturated.
  if (upstream.status === 429) {
    const detail = await readUpstreamDetail(upstream);
    const retryAfter = upstream.headers.get('Retry-After');
    return NextResponse.json(
      { error: detail ?? 'Common service rate limit exceeded' },
      {
        status: 429,
        headers: retryAfter ? { 'Retry-After': retryAfter } : undefined,
      },
    );
  }

  const fallback = passthrough[upstream.status];
  if (fallback) {
    const detail = await readUpstreamDetail(upstream);
    return NextResponse.json({ error: detail ?? fallback }, { status: upstream.status });
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Common service returned ${upstream.status}` },
      { status: 502 },
    );
  }

  const data = upstreamSchema.safeParse(await upstream.json().catch(() => null));
  if (!data.success) {
    return NextResponse.json({ error: 'Unexpected response from common service' }, { status: 502 });
  }

  return NextResponse.json(data.data, { status: 200 });
}
