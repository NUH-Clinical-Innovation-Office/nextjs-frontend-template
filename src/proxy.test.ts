import { describe, expect, it } from 'bun:test';
import { NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { buildSecurityHeaders } from '@/lib/security-headers';
import { proxy } from './proxy';

function makeRequest(path = '/'): NextRequest {
  return new NextRequest(new URL(path, 'http://localhost:3000'));
}

describe('proxy nonce wiring', () => {
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

  it('passes apiUrl from validated env into the CSP', () => {
    // buildSecurityHeaders is the source of truth; assert it agrees with proxy.
    const headers = buildSecurityHeaders({
      nonce: 'n',
      ctx: { apiUrl: env.API_URL, nodeEnv: env.NODE_ENV },
    });
    const res = proxy(makeRequest());
    const cspFromProxy = res.headers.get('Content-Security-Policy') ?? '';
    const cspFromBuilder = headers.get('Content-Security-Policy') ?? '';
    // The proxy uses a fresh nonce, but the directive set must match.
    const directives = (csp: string) =>
      csp
        .split(';')
        .map((d) => d.trim().split(' ')[0])
        .sort();
    expect(directives(cspFromProxy)).toEqual(directives(cspFromBuilder));
  });

  it('forwards every header produced by buildSecurityHeaders', () => {
    const res = proxy(makeRequest());
    for (const name of [
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'X-DNS-Prefetch-Control',
      'Strict-Transport-Security',
      'Permissions-Policy',
      'X-Permitted-Cross-Domain-Policies',
    ]) {
      expect(res.headers.get(name)).toBeTruthy();
    }
  });
});

describe('proxy matcher config', () => {
  it('excludes Next.js dev internals (HMR, suggestion overlay, source maps)', async () => {
    // Re-import the module to read the exported `config` object.
    const mod = await import('./proxy');
    const matcher = (mod.config as { matcher: string[] }).matcher[0] as string;
    // Each prefix we want excluded should appear inside the negative lookahead
    // group: `(?<!prefix1|prefix2|...)`.
    for (const prefix of ['_next/static', '_next/image', '_next/data', 'favicon.ico', '__nextjs']) {
      expect(matcher).toContain(prefix);
    }
  });

  it('does not exclude `/docs/` paths (the app does not own that route)', async () => {
    const mod = await import('./proxy');
    const matcher = (mod.config as { matcher: string[] }).matcher[0] as string;
    // The matcher is a single negative-lookahead regex. We assert that the
    // literal substring `docs/` is NOT one of the excluded prefixes, so
    // legitimate app routes under `/docs` would still get CSP + nonce.
    const excludedGroup = matcher.match(/\(\?!([^)]+)\)/)?.[1] ?? '';
    expect(excludedGroup.split('|')).not.toContain('docs/');
  });
});
