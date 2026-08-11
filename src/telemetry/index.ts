/**
 * Browser telemetry entrypoint. Importing this module boots the SDK as a side
 * effect, so it is loaded via dynamic `import()` from `TelemetryProvider` to
 * keep the OpenTelemetry bundle out of the initial page payload.
 */

if (typeof window !== 'undefined') {
  import('@/telemetry/otel').then(({ initializeOpenTelemetry }) => {
    initializeOpenTelemetry();
  });
}

export { SERVICE_NAME, SERVICE_VERSION } from '@/telemetry/constants';
export { getSessionId } from '@/telemetry/identity';
export { logDebug, logError, logInfo, logWarning } from '@/telemetry/logger';
