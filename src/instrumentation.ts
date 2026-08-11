import type { Server } from 'node:http';

/**
 * Next.js server startup hook.
 *
 * The metrics server is parked on `globalThis` because `register` runs again on
 * every hot reload in development, and a second `listen` on the same port would
 * throw `EADDRINUSE`.
 */
const metricsState = globalThis as typeof globalThis & {
  clientSampleMetricsServer?: Server;
};

export const register = async (): Promise<void> => {
  // The metrics server requires Node's HTTP runtime.
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.METRICS_ENABLED !== 'true') {
    return;
  }

  if (metricsState.clientSampleMetricsServer) {
    return;
  }

  const { startMetricsServer } = await import('@/telemetry/metrics-server');
  const configuredPort = Number.parseInt(process.env.METRICS_PORT ?? '', 10);

  metricsState.clientSampleMetricsServer = startMetricsServer({
    port: Number.isSafeInteger(configuredPort) && configuredPort > 0 ? configuredPort : undefined,
    path: process.env.METRICS_PATH || undefined,
  });
};
