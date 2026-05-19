/**
 * Builds a Content Security Policy header string with a per-request nonce.
 *
 * The CSP is read at request time so values from `process.env` (e.g. API_URL
 * injected by Kubernetes at pod startup) are picked up without rebuilding the
 * Docker image.
 */
export function buildCsp(nonce: string): string {
  const apiUrl = process.env.API_URL?.trim();
  const connectSrc = apiUrl ? `connect-src 'self' ${apiUrl}` : "connect-src 'self'";

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    connectSrc,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}
