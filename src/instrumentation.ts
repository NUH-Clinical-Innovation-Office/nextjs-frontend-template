/**
 * Next.js instrumentation entrypoint. Runs once per process at startup.
 *
 * Boots the metrics server on METRICS_PORT (default 9464) so the
 * kube-prometheus-stack ServiceMonitor can scrape /metrics without
 * touching the public Next.js port (3000).
 */
export const register = async () => {
  // Only start the metrics server in the Node.js runtime. The edge runtime
  // (middleware) never imports this file, but the guard makes intent explicit
  // and protects against accidental future bundling.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Dynamic import keeps prom-client + node:http out of the edge bundle.
  const { createMetricsServer } = await import('@/lib/metrics-server');

  const port = Number.parseInt(process.env.METRICS_PORT ?? '9464', 10);
  const { listen } = createMetricsServer({ port });

  try {
    const handle = await listen();
    // eslint-disable-next-line no-console -- intentional startup signal
    console.log(`[metrics] listening on :${handle.port}/metrics`);
  } catch (err) {
    // eslint-disable-next-line no-console -- intentional startup failure signal
    console.error(`[metrics] failed to bind :${port}:`, (err as Error).message);
  }
};
