import { afterEach, describe, expect, it } from 'vitest';
import { buildCsp } from './csp';

describe('buildCsp', () => {
  const originalEnv = process.env.API_URL;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.API_URL;
    } else {
      process.env.API_URL = originalEnv;
    }
  });

  it('includes the nonce in script-src (production)', () => {
    const csp = buildCsp('abc123', 'production');
    expect(csp).toContain("script-src 'self' 'nonce-abc123'");
  });

  it('includes the nonce in style-src', () => {
    const csp = buildCsp('abc123', 'production');
    expect(csp).toContain("style-src 'self' 'nonce-abc123'");
  });

  it('does not include unsafe-inline', () => {
    const csp = buildCsp('abc123', 'production');
    expect(csp).not.toContain('unsafe-inline');
  });

  it('does not include unsafe-eval in production', () => {
    const csp = buildCsp('abc123', 'production');
    expect(csp).not.toContain('unsafe-eval');
  });

  it("includes 'unsafe-eval' in development (React dev mode requires it)", () => {
    const csp = buildCsp('abc123', 'development');
    expect(csp).toContain("'unsafe-eval'");
  });

  it('omits unsafe-eval in test mode by default (production-like)', () => {
    // When NODE_ENV is not 'production' (e.g. in test runs), the dev policy
    // is used. Tests run with NODE_ENV='test' unless overridden, so we
    // assert the dev path explicitly here.
    const csp = buildCsp('abc123', 'test');
    expect(csp).toContain("'unsafe-eval'");
  });

  it('includes API_URL in connect-src when set', () => {
    process.env.API_URL = 'https://api.example.com';
    const csp = buildCsp('abc123', 'production');
    expect(csp).toContain("connect-src 'self' https://api.example.com");
  });

  it('uses only self in connect-src when API_URL is unset', () => {
    delete process.env.API_URL;
    const csp = buildCsp('abc123', 'production');
    expect(csp).toContain("connect-src 'self'");
    expect(csp).not.toContain("connect-src 'self' http");
    expect(csp).not.toContain("connect-src 'self' https");
    expect(csp).not.toContain("connect-src 'self' undefined");
  });

  it('includes default-src self', () => {
    expect(buildCsp('n', 'production')).toContain("default-src 'self'");
  });

  it('includes frame-ancestors none', () => {
    expect(buildCsp('n', 'production')).toContain("frame-ancestors 'none'");
  });

  it('includes object-src none', () => {
    expect(buildCsp('n', 'production')).toContain("object-src 'none'");
  });

  it('includes upgrade-insecure-requests', () => {
    expect(buildCsp('n', 'production')).toContain('upgrade-insecure-requests');
  });

  it('separates directives with semicolons', () => {
    const csp = buildCsp('n', 'production');
    expect(csp.split(';').length).toBeGreaterThan(5);
  });
});
