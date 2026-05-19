import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { proxy } from './proxy';

function makeRequest(path = '/'): NextRequest {
  return new NextRequest(new URL(path, 'http://localhost:3000'));
}

describe('proxy', () => {
  it('attaches Content-Security-Policy header', () => {
    const res = proxy(makeRequest());
    const csp = res.headers.get('Content-Security-Policy');
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src 'self'");
  });

  it('attaches x-nonce header', () => {
    const res = proxy(makeRequest());
    const nonce = res.headers.get('x-nonce');
    expect(nonce).toBeTruthy();
    expect(nonce?.length).toBeGreaterThan(0);
  });

  it('embeds the same nonce in CSP and x-nonce', () => {
    const res = proxy(makeRequest());
    const nonce = res.headers.get('x-nonce');
    const csp = res.headers.get('Content-Security-Policy');
    expect(csp).toContain(`'nonce-${nonce}'`);
  });

  it('generates a unique nonce per request', () => {
    const a = proxy(makeRequest()).headers.get('x-nonce');
    const b = proxy(makeRequest()).headers.get('x-nonce');
    expect(a).not.toBe(b);
  });

  it('attaches X-Frame-Options DENY', () => {
    const res = proxy(makeRequest());
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('attaches X-Content-Type-Options nosniff', () => {
    const res = proxy(makeRequest());
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('attaches Referrer-Policy', () => {
    const res = proxy(makeRequest());
    expect(res.headers.get('Referrer-Policy')).toBe('origin-when-cross-origin');
  });

  it('attaches X-DNS-Prefetch-Control', () => {
    const res = proxy(makeRequest());
    expect(res.headers.get('X-DNS-Prefetch-Control')).toBe('on');
  });

  it('attaches Strict-Transport-Security with preload', () => {
    const res = proxy(makeRequest());
    expect(res.headers.get('Strict-Transport-Security')).toBe(
      'max-age=31536000; includeSubDomains; preload',
    );
  });

  it('attaches Permissions-Policy', () => {
    const res = proxy(makeRequest());
    const pp = res.headers.get('Permissions-Policy');
    expect(pp).toContain('camera=()');
    expect(pp).toContain('microphone=()');
    expect(pp).toContain('geolocation=()');
  });

  it('attaches X-Permitted-Cross-Domain-Policies none', () => {
    const res = proxy(makeRequest());
    expect(res.headers.get('X-Permitted-Cross-Domain-Policies')).toBe('none');
  });
});
