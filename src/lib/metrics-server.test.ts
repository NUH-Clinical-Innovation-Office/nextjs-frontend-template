import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import http from 'node:http';
import { createMetricsServer, type MetricsServerHandle } from './metrics-server';

// happy-dom hijacks global `fetch` with a same-origin policy that blocks
// requests to non-app ports. Use node's http module directly so we talk
// to the real metrics listener.
type FetchResult = {
  status: number;
  body: string;
  contentType: string | null;
};

const request = (port: number, path: string, method = 'GET') =>
  new Promise<FetchResult>((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path, method }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () =>
        resolve({
          status: res.statusCode ?? 0,
          body,
          contentType: res.headers['content-type'] ?? null,
        }),
      );
    });
    req.on('error', reject);
    req.end();
  });

describe('metrics-server', () => {
  let handle: MetricsServerHandle | undefined;

  beforeEach(async () => {
    // Port 0 → OS picks a free port, so parallel test runs don't collide.
    const { listen } = createMetricsServer({ port: 0 });
    handle = await listen();
  });

  afterEach(async () => {
    await handle?.close();
    handle = undefined;
  });

  const boundPort = () => {
    if (!handle) throw new Error('metrics server not started');
    return handle.port;
  };

  it('serves /metrics in prometheus text format', async () => {
    const { status, body, contentType } = await request(boundPort(), '/metrics');

    expect(status).toBe(200);
    // prom-client returns this content type for the text format.
    expect(contentType).toContain('text/plain');
    // Default Node.js process metrics include process_cpu_seconds_total.
    expect(body).toContain('process_cpu_seconds_total');
  });

  it('responds ok on /healthz', async () => {
    const { status, body } = await request(boundPort(), '/healthz');
    expect(status).toBe(200);
    expect(body).toBe('ok');
  });

  it('returns 404 for unknown paths', async () => {
    const { status } = await request(boundPort(), '/nope');
    expect(status).toBe(404);
  });

  it('rejects non-GET /metrics', async () => {
    const res = await request(boundPort(), '/metrics', 'POST');
    expect(res.status).toBe(404);
  });
});
