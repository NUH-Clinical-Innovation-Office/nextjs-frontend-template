import { describe, expect, it } from 'bun:test';
import { buildSecurityHeaders, type SecurityHeadersContext } from './security-headers';

const ctx = (overrides: Partial<SecurityHeadersContext> = {}): SecurityHeadersContext => ({
  nodeEnv: 'production',
  ...overrides,
});

describe('buildSecurityHeaders', () => {
  it('returns a Headers instance', () => {
    const headers = buildSecurityHeaders({ nonce: 'n', ctx: ctx() });
    expect(headers).toBeInstanceOf(Headers);
  });

  it('attaches Content-Security-Policy header', () => {
    const csp = buildSecurityHeaders({ nonce: 'n', ctx: ctx() }).get('Content-Security-Policy');
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src 'self'");
  });

  it('embeds the nonce in the CSP', () => {
    const headers = buildSecurityHeaders({ nonce: 'abc123', ctx: ctx() });
    expect(headers.get('Content-Security-Policy')).toContain("'nonce-abc123'");
  });

  it('attaches X-Frame-Options DENY', () => {
    expect(buildSecurityHeaders({ nonce: 'n', ctx: ctx() }).get('X-Frame-Options')).toBe('DENY');
  });

  it('attaches X-Content-Type-Options nosniff', () => {
    expect(buildSecurityHeaders({ nonce: 'n', ctx: ctx() }).get('X-Content-Type-Options')).toBe(
      'nosniff',
    );
  });

  it('attaches Referrer-Policy', () => {
    expect(buildSecurityHeaders({ nonce: 'n', ctx: ctx() }).get('Referrer-Policy')).toBe(
      'origin-when-cross-origin',
    );
  });

  it('attaches X-DNS-Prefetch-Control', () => {
    expect(buildSecurityHeaders({ nonce: 'n', ctx: ctx() }).get('X-DNS-Prefetch-Control')).toBe(
      'on',
    );
  });

  it('attaches Strict-Transport-Security with preload', () => {
    expect(buildSecurityHeaders({ nonce: 'n', ctx: ctx() }).get('Strict-Transport-Security')).toBe(
      'max-age=31536000; includeSubDomains; preload',
    );
  });

  it('attaches Permissions-Policy blocking camera, microphone, geolocation', () => {
    const pp = buildSecurityHeaders({ nonce: 'n', ctx: ctx() }).get('Permissions-Policy');
    expect(pp).toContain('camera=()');
    expect(pp).toContain('microphone=()');
    expect(pp).toContain('geolocation=()');
  });

  it('attaches X-Permitted-Cross-Domain-Policies none', () => {
    expect(
      buildSecurityHeaders({ nonce: 'n', ctx: ctx() }).get('X-Permitted-Cross-Domain-Policies'),
    ).toBe('none');
  });

  it('honours the nonce passed in', () => {
    const headers = buildSecurityHeaders({ nonce: 'one', ctx: ctx() });
    const other = buildSecurityHeaders({ nonce: 'two', ctx: ctx() });
    expect(headers.get('Content-Security-Policy')).toContain("'nonce-one'");
    expect(other.get('Content-Security-Policy')).toContain("'nonce-two'");
  });

  it('passes apiUrl through to the CSP', () => {
    const headers = buildSecurityHeaders({
      nonce: 'n',
      ctx: ctx({ apiUrl: 'https://api.example.com' }),
    });
    expect(headers.get('Content-Security-Policy')).toContain(
      "connect-src 'self' https://api.example.com",
    );
  });

  it('passes nodeEnv through to the CSP (dev adds unsafe-eval)', () => {
    const prod = buildSecurityHeaders({ nonce: 'n', ctx: ctx({ nodeEnv: 'production' }) });
    const dev = buildSecurityHeaders({ nonce: 'n', ctx: ctx({ nodeEnv: 'development' }) });
    expect(prod.get('Content-Security-Policy')).not.toContain('unsafe-eval');
    expect(dev.get('Content-Security-Policy')).toContain('unsafe-eval');
  });

  it('produces an independent Headers instance per call', () => {
    const a = buildSecurityHeaders({ nonce: 'a', ctx: ctx() });
    const b = buildSecurityHeaders({ nonce: 'b', ctx: ctx() });
    a.set('X-Test', '1');
    expect(b.get('X-Test')).toBeNull();
  });
});
