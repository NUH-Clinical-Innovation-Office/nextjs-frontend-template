/**
 * Prometheus scrape endpoint for the Next.js server process.
 *
 * Runs on its own port rather than as a Next.js route so it is reachable by
 * in-cluster scrapers without being exposed through the public ingress, and so
 * it stays clear of the `/api/*` routes that proxy to common-service.
 */

import { createServer, type Server } from 'node:http';
import { collectDefaultMetrics, Registry } from 'prom-client';

const DEFAULT_METRICS_PORT = 9464;

/** Must match `metrics.path` in the Helm values. */
const DEFAULT_METRICS_PATH = '/metrics';

export type MetricsRegistry = {
  contentType: string;
  metrics: () => Promise<string>;
};

export type MetricsResponse = {
  status: number;
  headers?: Record<string, string>;
  body: string;
};

export type MetricsServerOptions = {
  port?: number;
  path?: string;
  registry?: MetricsRegistry;
};

/**
 * Resolves a scrape request. Extracted from the server so the routing and
 * error handling are testable without binding a port.
 */
export const handleMetricsRequest = async (
  method: string | undefined,
  url: string | undefined,
  path: string,
  registry: MetricsRegistry,
): Promise<MetricsResponse> => {
  const requestPath = url?.split('?', 1)[0];

  if (method !== 'GET' || requestPath !== path) {
    return { status: 404, body: 'Not Found' };
  }

  try {
    return {
      status: 200,
      headers: {
        'Content-Type': registry.contentType,
        'Cache-Control': 'no-store',
      },
      body: await registry.metrics(),
    };
  } catch (error) {
    console.error('Failed to collect Prometheus metrics', error);
    return { status: 500, body: 'Internal Server Error' };
  }
};

const createRegistry = (): Registry => {
  const registry = new Registry();
  collectDefaultMetrics({ register: registry, prefix: 'client_sample_' });
  return registry;
};

const createMetricsServer = ({
  path = DEFAULT_METRICS_PATH,
  registry = createRegistry(),
}: MetricsServerOptions = {}): Server => {
  return createServer(async (request, response) => {
    const result = await handleMetricsRequest(request.method, request.url, path, registry);
    response.writeHead(result.status, result.headers).end(result.body);
  });
};

/**
 * Starts the metrics server.
 *
 * Listen failures are logged rather than thrown: a missing metrics endpoint
 * must never take down the app serving traffic.
 */
export const startMetricsServer = ({
  port = DEFAULT_METRICS_PORT,
  path = DEFAULT_METRICS_PATH,
}: MetricsServerOptions = {}): Server => {
  const server = createMetricsServer({ path });

  server.on('error', (error) => {
    console.error(`Prometheus metrics server failed on port ${port}`, error);
  });
  server.listen(port, '0.0.0.0', () => {
    console.log(`Prometheus metrics available at http://0.0.0.0:${port}${path}`);
  });

  return server;
};
