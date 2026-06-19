import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { collectDefaultMetrics, Registry } from 'prom-client';

/**
 * Tiny HTTP server exposing /metrics on a dedicated port for the
 * kube-prometheus-stack ServiceMonitor to scrape. Kept separate from
 * the Next.js server (PORT 3000) so the public ingress never carries
 * metrics traffic and the scraper can hit a stable target.
 *
 * Why not /api/metrics: ingress routing + middleware overhead would
 * couple scrape health to app request handling.
 */
export type MetricsServerHandle = {
  readonly port: number;
  readonly host: string;
  readonly registry: Registry;
  close: () => Promise<void>;
};

const DEFAULT_PORT = 9464;
const DEFAULT_HOST = '0.0.0.0';

export const createMetricsServer = (options?: {
  port?: number;
  host?: string;
  path?: string;
  registry?: Registry;
}) => {
  const requestedPort = options?.port ?? DEFAULT_PORT;
  const host = options?.host ?? DEFAULT_HOST;
  const metricsPath = options?.path ?? '/metrics';
  const registry = options?.registry ?? new Registry();

  // Collect default Node.js process metrics (heap, GC, event loop lag, etc.).
  collectDefaultMetrics({ register: registry });

  const server = http.createServer(async (req, res) => {
    if (req.url === metricsPath && req.method === 'GET') {
      try {
        const body = await registry.metrics();
        res.writeHead(200, { 'Content-Type': registry.contentType });
        res.end(body);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`metrics collection failed: ${(err as Error).message}`);
      }
      return;
    }

    if (req.url === '/healthz' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('ok');
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
  });

  const close = () =>
    new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });

  const listen = () =>
    new Promise<MetricsServerHandle>((resolve, reject) => {
      const onError = (err: Error) => reject(err);
      server.once('error', onError);
      server.listen(requestedPort, host, () => {
        server.off('error', onError);
        // When port=0, the OS assigns one. Read the real value back so
        // callers (and tests) know where to connect.
        const addr = server.address() as AddressInfo | null;
        const boundPort = addr?.port ?? requestedPort;
        const boundHost = addr?.address ?? host;
        resolve({ port: boundPort, host: boundHost, registry, close });
      });
    });

  return { listen, server, close };
};
