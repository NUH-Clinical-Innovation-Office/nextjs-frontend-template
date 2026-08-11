import { describe, expect, it } from 'bun:test';
import { handleMetricsRequest, type MetricsRegistry } from '@/telemetry/metrics-server';

const registry: MetricsRegistry = {
  contentType: 'text/plain; version=0.0.4; charset=utf-8',
  metrics: () => Promise.resolve('client_sample_process_cpu_seconds_total 1.5'),
};

describe('handleMetricsRequest', () => {
  it('serves the registry payload on a GET to the metrics path', async () => {
    const result = await handleMetricsRequest('GET', '/metrics', '/metrics', registry);

    expect(result.status).toBe(200);
    expect(result.body).toContain('client_sample_process_cpu_seconds_total');
    expect(result.headers?.['Content-Type']).toBe(registry.contentType);
  });

  it('marks the response uncacheable', async () => {
    const result = await handleMetricsRequest('GET', '/metrics', '/metrics', registry);

    expect(result.headers?.['Cache-Control']).toBe('no-store');
  });

  it('ignores a query string when matching the path', async () => {
    const result = await handleMetricsRequest('GET', '/metrics?foo=bar', '/metrics', registry);

    expect(result.status).toBe(200);
  });

  it('404s on a different path', async () => {
    const result = await handleMetricsRequest('GET', '/healthz', '/metrics', registry);

    expect(result.status).toBe(404);
  });

  it('404s on a non-GET method', async () => {
    const result = await handleMetricsRequest('POST', '/metrics', '/metrics', registry);

    expect(result.status).toBe(404);
  });

  it('500s when the registry fails to collect', async () => {
    const failing: MetricsRegistry = {
      contentType: registry.contentType,
      metrics: () => Promise.reject(new Error('collection failed')),
    };

    const result = await handleMetricsRequest('GET', '/metrics', '/metrics', failing);

    expect(result.status).toBe(500);
  });
});
