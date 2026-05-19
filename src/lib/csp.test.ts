import { afterEach, describe, expect, it } from 'vitest';
import { buildCsp } from './csp';

describe('buildCsp', () => {
  const originalEnv = process.env.API_URL;

  afterEach(() => {
    if (originalEnv === undefined) {
      process.env.API_URL = undefined;
    } else {
      process.env.API_URL = originalEnv;
    }
  });

  it('includes the nonce in script-src', () => {
    const csp = buildCsp('abc123');
    expect(csp).toContain("script-src 'self' 'nonce-abc123'");
  });

  it('includes the nonce in style-src', () => {
    const csp = buildCsp('abc123');
    expect(csp).toContain("style-src 'self' 'nonce-abc123'");
  });

  it('does not include unsafe-inline', () => {
    const csp = buildCsp('abc123');
    expect(csp).not.toContain('unsafe-inline');
  });

  it('does not include unsafe-eval', () => {
    const csp = buildCsp('abc123');
    expect(csp).not.toContain('unsafe-eval');
  });

  it('includes API_URL in connect-src when set', () => {
    process.env.API_URL = 'https://api.example.com';
    const csp = buildCsp('abc123');
    expect(csp).toContain("connect-src 'self' https://api.example.com");
  });

  it('uses only self in connect-src when API_URL is unset', () => {
    process.env.API_URL = undefined;
    const csp = buildCsp('abc123');
    expect(csp).toContain("connect-src 'self'");
    expect(csp).not.toContain("connect-src 'self' http");
    expect(csp).not.toContain("connect-src 'self' https");
  });

  it('includes default-src self', () => {
    expect(buildCsp('n')).toContain("default-src 'self'");
  });

  it('includes frame-ancestors none', () => {
    expect(buildCsp('n')).toContain("frame-ancestors 'none'");
  });

  it('includes object-src none', () => {
    expect(buildCsp('n')).toContain("object-src 'none'");
  });

  it('includes upgrade-insecure-requests', () => {
    expect(buildCsp('n')).toContain('upgrade-insecure-requests');
  });

  it('separates directives with semicolons', () => {
    const csp = buildCsp('n');
    expect(csp.split(';').length).toBeGreaterThan(5);
  });
});
