/** biome-ignore-all lint/style/useNamingConvention: Next.js route handlers must be named after the HTTP verb, and HTTP header names are not camelCase */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/lib/env';

/**
 * Server-side proxy to common-service.
 *
 * common-service has no ingress, so the browser cannot reach it directly. The
 * browser posts here (same origin) and this handler forwards the call over the
 * cluster-internal address. The caller supplies their own auth-service bearer
 * token, which is forwarded verbatim and never logged, stored, or echoed back.
 */

export const runtime = 'nodejs';

/** Mirrors CreateTodoRequest in common-service's openapi.yaml. */
const requestSchema = z.object({
  token: z.string({ error: 'token is required' }).min(1, 'token is required'),
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

  let upstream: Response;
  try {
    upstream = await fetch(`${env.COMMON_SERVICE_URL}/api/v1/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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

  // Surface auth failures as-is. Collapsing them into a generic error would
  // make a rejected token indistinguishable from an outage.
  if (upstream.status === 401) {
    return NextResponse.json({ error: 'Token rejected by common service' }, { status: 401 });
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
