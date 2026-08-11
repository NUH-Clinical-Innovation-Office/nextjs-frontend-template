/**
 * Forwards browser OTLP to the configured collector. The public routes enforce
 * content type, size, rate, origin, and server-owned resource attributes before
 * forwarding; collector credentials never reach the client or the logs.
 *
 * These routes stay outside `/api` because that prefix is reserved for the
 * common-service proxy.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import {
  ALLOWED_TELEMETRY_CONTENT_TYPES,
  MAX_TELEMETRY_BODY_BYTES,
  TELEMETRY_PROXY_TIMEOUT_MS,
} from '@/lib/telemetry/constants';
import { enforceJsonResourceAttributes } from '@/lib/telemetry/otlp-attributes';
import { checkRateLimit } from '@/lib/telemetry/rate-limit';

export type TelemetryType = 'logs' | 'metrics' | 'traces';

const jsonError = (status: number, error: string): NextResponse => {
  return NextResponse.json({ error }, { status });
};

/**
 * Returns a rate-limit key from the trusted proxy hop, or `unknown` when absent.
 *
 * The ALB is the sole public ingress and appends the client IP to
 * `X-Forwarded-For`; the second-from-right entry is therefore the trusted one.
 *
 * One-hop chains are accepted as-is. Adding another proxy requires revisiting
 * this trust boundary.
 */
const clientKey = (request: NextRequest): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const hops = forwarded
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const trusted = hops.length >= 2 ? hops.at(-2) : hops[0];
    if (trusted) {
      return trusted;
    }
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
};

/**
 * Rejects cross-site browser requests. Modern browsers send `Sec-Fetch-Site`;
 * we allow same-origin/same-site and reject `cross-site`. When the header is
 * absent (non-browser client) we fall back to an Origin check against the
 * app's own origin.
 */
const isCrossSite = (request: NextRequest): boolean => {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite) {
    return fetchSite === 'cross-site';
  }
  const origin = request.headers.get('origin');
  if (!origin) {
    // Without Origin there is no cross-site browser request to identify.
    return false;
  }
  try {
    return new URL(origin).origin !== new URL(env.NEXT_PUBLIC_APP_URL).origin;
  } catch {
    return true;
  }
};

/**
 * Runs the cheap pre-flight guards (cross-site, content-type allowlist, rate
 * limit, advertised body size) that reject a request before we read its body.
 *
 * @returns A rejection response, or the normalized base content type to use.
 */
const preflight = (
  request: NextRequest,
  type: TelemetryType,
): { error: NextResponse } | { baseContentType: string } => {
  if (isCrossSite(request)) {
    console.warn('Rejected cross-site telemetry request', { type });
    return { error: jsonError(403, 'Cross-site requests are not allowed') };
  }

  const baseContentType =
    (request.headers.get('content-type') ?? '').split(';')[0]?.trim().toLowerCase() ?? '';
  if (!ALLOWED_TELEMETRY_CONTENT_TYPES.includes(baseContentType as never)) {
    console.warn('Rejected telemetry with unsupported content type', { type, baseContentType });
    return { error: jsonError(415, 'Unsupported content type') };
  }

  if (!checkRateLimit(clientKey(request))) {
    console.warn('Telemetry rate limit exceeded', { type });
    return { error: jsonError(429, 'Too many requests') };
  }

  const advertisedLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(advertisedLength) && advertisedLength > MAX_TELEMETRY_BODY_BYTES) {
    console.warn('Rejected oversized telemetry body', { type, advertisedLength });
    return { error: jsonError(413, 'Payload too large') };
  }

  return { baseContentType };
};

const readBoundedBody = async (
  request: NextRequest,
  type: TelemetryType,
): Promise<{ error: NextResponse } | { rawBody: ArrayBuffer }> => {
  const rawBody = await request.arrayBuffer();
  if (rawBody.byteLength > MAX_TELEMETRY_BODY_BYTES) {
    console.warn('Rejected oversized telemetry body', { type, byteLength: rawBody.byteLength });
    return { error: jsonError(413, 'Payload too large') };
  }
  return { rawBody };
};

const prepareCollectorBody = (rawBody: ArrayBuffer, baseContentType: string): BodyInit => {
  if (baseContentType !== 'application/json') return rawBody;

  const rewritten = enforceJsonResourceAttributes(rawBody, {
    serviceName: env.OTEL_SERVICE_NAME,
    environment: env.OTEL_DEPLOYMENT_ENVIRONMENT,
    tenant: env.OTEL_TENANT,
  });
  // The DOM lib types lag behind fetch's runtime support for Uint8Array.
  return rewritten ? (rewritten as unknown as BodyInit) : rawBody;
};

const sendToCollector = async ({
  collectorUrl,
  type,
  baseContentType,
  body,
}: {
  collectorUrl: string;
  type: TelemetryType;
  baseContentType: string;
  body: BodyInit;
}): Promise<NextResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TELEMETRY_PROXY_TIMEOUT_MS);
  const headers: Record<string, string> = { 'Content-Type': baseContentType };
  if (env.OTEL_API_KEY) headers.Authorization = `Bearer ${env.OTEL_API_KEY}`;

  try {
    const response = await fetch(`${collectorUrl}/v1/${type}`, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });
    if (!response.ok) {
      console.error('Failed to forward telemetry to OTLP collector', {
        type,
        status: response.status,
        statusText: response.statusText,
      });
      return jsonError(response.status, `Failed to forward ${type}`);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('OTLP collector timeout', { type });
      return jsonError(504, 'Gateway timeout');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Forwards telemetry data to the OTLP collector.
 *
 * @param request - Incoming Next.js request carrying an OTLP batch.
 * @param type - Telemetry signal to forward.
 */
export const forwardTelemetryData = async (
  request: NextRequest,
  type: TelemetryType,
): Promise<NextResponse> => {
  const collectorUrl = env.OTLP_COLLECTOR_URL;

  if (!collectorUrl) {
    return NextResponse.json({ disabled: true });
  }

  const checked = preflight(request, type);
  if ('error' in checked) {
    return checked.error;
  }
  const { baseContentType } = checked;

  try {
    // Content-Length can be absent or dishonest.
    const boundedBody = await readBoundedBody(request, type);
    if ('error' in boundedBody) return boundedBody.error;
    const body = prepareCollectorBody(boundedBody.rawBody, baseContentType);
    return await sendToCollector({ collectorUrl, type, baseContentType, body });
  } catch (error) {
    console.error('Error forwarding telemetry', { type, error });
    return jsonError(500, 'Internal server error');
  }
};
