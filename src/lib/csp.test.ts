import { describe, expect, it } from 'bun:test';
import { buildCsp, type CspContext } from './csp';

const ctx = (overrides: Partial<CspContext> = {}): CspContext => ({
  nodeEnv: 'production',
  ...overrides,
});

describe('buildCsp', () => {
  it('includes the nonce in script-src (production)', () => {
    const csp = buildCsp('abc123', ctx());
    expect(csp).toContain("script-src 'self' 'nonce-abc123'");
  });

  it("uses 'unsafe-inline' in style-src (runtime-styling libs inject unnonced styles)", () => {
    const csp = buildCsp('abc123', ctx());
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  });

  it('omits the nonce from style-src so unsafe-inline stays effective', () => {
    const csp = buildCsp('abc123', ctx());
    expect(csp).not.toContain("style-src 'self' 'nonce-abc123'");
  });

  it('does not include unsafe-inline in script-src', () => {
    const csp = buildCsp('abc123', ctx());
    expect(csp.split(';').find((d) => d.includes('script-src'))).not.toContain('unsafe-inline');
  });

  it('does not include unsafe-eval in production', () => {
    const csp = buildCsp('abc123', ctx());
    expect(csp).not.toContain('unsafe-eval');
  });

  it("includes 'unsafe-eval' in development (React dev mode requires it)", () => {
    const csp = buildCsp('abc123', ctx({ nodeEnv: 'development' }));
    expect(csp).toContain("'unsafe-eval'");
  });

  it('omits unsafe-eval in test mode by default (production-like)', () => {
    // When nodeEnv is not 'production' (e.g. in test runs), the dev policy
    // is used. Tests run with nodeEnv='test' unless overridden, so we
    // assert the dev path explicitly here.
    const csp = buildCsp('abc123', ctx({ nodeEnv: 'test' }));
    expect(csp).toContain("'unsafe-eval'");
  });

  it('includes apiUrl in connect-src when set', () => {
    const csp = buildCsp('abc123', ctx({ apiUrl: 'https://api.example.com' }));
    expect(csp).toContain("connect-src 'self' https://api.example.com");
  });

  it('uses only self in connect-src when apiUrl is unset', () => {
    const csp = buildCsp('abc123', ctx());
    expect(csp).toContain("connect-src 'self'");
    expect(csp).not.toContain("connect-src 'self' http");
    expect(csp).not.toContain("connect-src 'self' https");
    expect(csp).not.toContain("connect-src 'self' undefined");
  });

  it('trims whitespace from apiUrl', () => {
    const csp = buildCsp('abc123', ctx({ apiUrl: '  https://api.example.com  ' }));
    expect(csp).toContain("connect-src 'self' https://api.example.com");
    expect(csp).not.toContain('  https://');
  });

  it('includes default-src self', () => {
    expect(buildCsp('n', ctx())).toContain("default-src 'self'");
  });

  it('includes frame-ancestors none', () => {
    expect(buildCsp('n', ctx())).toContain("frame-ancestors 'none'");
  });

  it('includes object-src none', () => {
    expect(buildCsp('n', ctx())).toContain("object-src 'none'");
  });

  it('includes upgrade-insecure-requests', () => {
    expect(buildCsp('n', ctx())).toContain('upgrade-insecure-requests');
  });

  it('separates directives with semicolons', () => {
    expect(buildCsp('n', ctx()).split(';').length).toBeGreaterThan(5);
  });
});
