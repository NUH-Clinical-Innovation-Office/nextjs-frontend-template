/**
 * Constants for the browser-facing telemetry proxy.
 *
 * The `/telemetry/*` routes are the only browser-reachable path to the OTLP
 * collector, so the limits here are the app-side half of the abuse protection
 * (the collector enforces its own quotas independently).
 */

/**
 * OTLP content types the proxy accepts. Anything else is rejected before the
 * body is read. JSON is preferred because it is the only form where
 * `enforceJsonResourceAttributes` can rewrite spoofed identity attributes.
 */
export const ALLOWED_TELEMETRY_CONTENT_TYPES = [
  'application/json',
  'application/x-protobuf',
] as const;

/** Largest OTLP request body accepted by the proxy. */
export const MAX_TELEMETRY_BODY_BYTES = 1_000_000;

/** Requests allowed per client in one rate-limit window. */
export const TELEMETRY_RATE_LIMIT_MAX = 120;

/** Rate limit window length in milliseconds. */
export const TELEMETRY_RATE_LIMIT_WINDOW_MS = 60_000;

/** How long to wait on the collector before giving up and returning 504. */
export const TELEMETRY_PROXY_TIMEOUT_MS = 10_000;
