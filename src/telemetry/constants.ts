/**
 * OpenTelemetry service identity for the browser SDK.
 *
 * These are advisory: the `/telemetry/*` proxy overwrites `service.name` and
 * friends server-side (see `src/lib/telemetry/otlp-attributes.ts`), so a
 * tampered client cannot masquerade as another service. The `-client` suffix
 * distinguishes browser-originated signals from the Next.js server process.
 */

export const SERVICE_NAME = 'client-sample-client';

export const SERVICE_VERSION = '0.1.0';

/** Same-origin proxy base. Not `/api/telemetry` — `/api` proxies to common-service. */
export const TELEMETRY_BASE_URL = '/telemetry';
