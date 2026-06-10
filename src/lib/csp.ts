/**
 * Builds a Content Security Policy header string with a per-request nonce.
 *
 * The CSP is read at request time so values from `process.env` (e.g. API_URL
 * injected by Kubernetes at pod startup) are picked up without rebuilding the
 * Docker image.
 *
 * In development, `'unsafe-eval'` is appended to `script-src` because React
 * dev mode uses `eval()` to reconstruct callstacks. Production builds never
 * use `eval()`, so the directive is omitted there to keep the policy tight.
 */
export function buildCsp(nonce: string, nodeEnv: string = process.env.NODE_ENV ?? ''): string {
  const apiUrl = process.env.API_URL?.trim();
  const connectSrc = apiUrl ? `connect-src 'self' ${apiUrl}` : "connect-src 'self'";
  const isDev = nodeEnv !== 'production';
  const scriptSrc = isDev
    ? `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`
    : `script-src 'self' 'nonce-${nonce}'`;

  return [
    "default-src 'self'",
    scriptSrc,
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
