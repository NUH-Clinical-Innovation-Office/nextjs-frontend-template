/**
 * Per-client fixed-window rate limiter for the telemetry proxy.
 *
 * In-memory and per-process: with `replicaCount: 2` each pod enforces its own
 * window, so the effective limit is `TELEMETRY_RATE_LIMIT_MAX * replicas`. That
 * is acceptable for coarse abuse protection on a public OTLP ingestion route,
 * and keeps the proxy free of any external store dependency.
 */

import {
  TELEMETRY_RATE_LIMIT_MAX,
  TELEMETRY_RATE_LIMIT_WINDOW_MS,
} from '@/lib/telemetry/constants';

type RateLimitWindow = {
  count: number;
  resetAt: number;
};

const windows = new Map<string, RateLimitWindow>();

/**
 * Records a hit for the given client key and reports whether it is allowed.
 *
 * @param key - Stable per-client identifier (e.g. source IP).
 * @param now - Current epoch millis (injectable for tests).
 * @returns `true` when the request is within the limit, `false` when throttled.
 */
export const checkRateLimit = (key: string, now: number = Date.now()): boolean => {
  const existing = windows.get(key);

  if (!existing || now >= existing.resetAt) {
    windows.set(key, { count: 1, resetAt: now + TELEMETRY_RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (existing.count >= TELEMETRY_RATE_LIMIT_MAX) {
    return false;
  }

  existing.count += 1;
  return true;
};

/** Clears all windows. Test-only helper. */
export const resetRateLimit = (): void => {
  windows.clear();
};
