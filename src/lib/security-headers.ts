import { buildCsp, type CspContext } from '@/lib/csp';

/**
 * The single seam for the HTTP response-header policy. Returns a fresh
 * `Headers` instance so callers can either spread it onto a `NextResponse`
 * or extend it.
 *
 * CSP is per-request (nonce-bound), so the caller must supply the nonce. All
 * other inputs come from validated env vars passed through `ctx`; this
 * module reads no globals.
 */
export type SecurityHeadersContext = {
  apiUrl?: string;
  nodeEnv: CspContext['nodeEnv'];
};

export type SecurityHeadersOptions = {
  nonce: string;
  ctx: SecurityHeadersContext;
};

export function buildSecurityHeaders(opts: SecurityHeadersOptions): Headers {
  const { nonce, ctx } = opts;
  const headers = new Headers();

  headers.set('Content-Security-Policy', buildCsp(nonce, ctx));
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'origin-when-cross-origin');
  headers.set('X-DNS-Prefetch-Control', 'on');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  return headers;
}
