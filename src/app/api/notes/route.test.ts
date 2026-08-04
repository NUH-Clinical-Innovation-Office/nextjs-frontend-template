import { afterEach, describe, expect, it, mock } from 'bun:test';
import { POST } from './route';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

/** Stubs the upstream common-service call with a fixed response. */
function mockUpstream(response: Response | Error) {
  globalThis.fetch = mock(() =>
    response instanceof Error ? Promise.reject(response) : Promise.resolve(response),
  ) as unknown as typeof fetch;
}

function postRequest(body: unknown) {
  return new Request('http://localhost:3000/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/notes', () => {
  it('returns the upstream payload on success', async () => {
    mockUpstream(
      jsonResponse({ message: 'todo accepted', text: 'buy milk', subject: 'user-123' }, 200),
    );

    const response = await POST(postRequest({ token: 'jwt-token', text: 'buy milk' }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: 'todo accepted',
      text: 'buy milk',
      subject: 'user-123',
    });
  });

  it('forwards the token as a bearer header and does not forward it in the body', async () => {
    const fetchMock = mock(() =>
      Promise.resolve(jsonResponse({ message: 'ok', text: 'hi', subject: 'sub' }, 200)),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await POST(postRequest({ token: 'secret-jwt', text: 'hi' }));

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer secret-jwt');
    expect(init.body).toBe(JSON.stringify({ text: 'hi' }));
  });

  it('rejects a missing token', async () => {
    const response = await POST(postRequest({ text: 'buy milk' }));

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('token is required');
  });

  it('rejects empty text', async () => {
    const response = await POST(postRequest({ token: 'jwt-token', text: '' }));

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('text is required');
  });

  it('rejects text longer than 500 characters', async () => {
    const response = await POST(postRequest({ token: 'jwt-token', text: 'a'.repeat(501) }));

    expect(response.status).toBe(400);
  });

  it('rejects a malformed JSON body', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/notes', { method: 'POST', body: 'not json' }),
    );

    expect(response.status).toBe(400);
  });

  it('passes an upstream 401 through as 401', async () => {
    mockUpstream(jsonResponse({ detail: 'unauthorized' }, 401));

    const response = await POST(postRequest({ token: 'bad-token', text: 'buy milk' }));

    expect(response.status).toBe(401);
    expect((await response.json()).error).toBe('Token rejected by common service');
  });

  it('maps an upstream 5xx to 502', async () => {
    mockUpstream(jsonResponse({ detail: 'boom' }, 503));

    const response = await POST(postRequest({ token: 'jwt-token', text: 'buy milk' }));

    expect(response.status).toBe(502);
  });

  it('maps a timeout to 504', async () => {
    mockUpstream(new DOMException('The operation timed out.', 'TimeoutError'));

    const response = await POST(postRequest({ token: 'jwt-token', text: 'buy milk' }));

    expect(response.status).toBe(504);
  });

  it('maps an unreachable service to 502', async () => {
    mockUpstream(new TypeError('fetch failed'));

    const response = await POST(postRequest({ token: 'jwt-token', text: 'buy milk' }));

    expect(response.status).toBe(502);
  });

  it('rejects an unexpected upstream payload', async () => {
    mockUpstream(jsonResponse({ unexpected: true }, 200));

    const response = await POST(postRequest({ token: 'jwt-token', text: 'buy milk' }));

    expect(response.status).toBe(502);
  });

  it('never echoes the token back to the caller', async () => {
    mockUpstream(jsonResponse({ detail: 'unauthorized' }, 401));

    const response = await POST(postRequest({ token: 'super-secret-jwt', text: 'buy milk' }));

    expect(await response.text()).not.toContain('super-secret-jwt');
  });

  it('does not leak the internal service URL when unreachable', async () => {
    mockUpstream(new TypeError('fetch failed'));

    const response = await POST(postRequest({ token: 'jwt-token', text: 'buy milk' }));

    expect(await response.text()).not.toContain('svc.cluster.local');
  });
});
