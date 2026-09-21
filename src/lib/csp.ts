/**
 * Builds a Content Security Policy header string with a per-request nonce.
 *
 * Reads no environment variables: the caller passes `ctx` so this module
 * stays pure and the tests do not need to mutate `process.env`.
 *
 * In development, `'unsafe-eval'` is appended to `script-src` because React
 * dev mode uses `eval()` to reconstruct callstacks. Production builds never
 * use `eval()`, so the directive is omitted there to keep the policy tight.
 */
export type CspContext = {
  apiUrl?: string;
  nodeEnv: string;
};

export function buildCsp(nonce: string, ctx: CspContext): string {
  const apiUrl = ctx.apiUrl?.trim();
  const connectSrc = apiUrl ? `connect-src 'self' ${apiUrl}` : "connect-src 'self'";
  const isDev = ctx.nodeEnv !== 'production';
  const scriptSrc = isDev
    ? `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`
    : `script-src 'self' 'nonce-${nonce}'`;
  // style-src uses 'unsafe-inline' in both dev and prod:
  //   - Dev: Turbopack's HMR/dev-overlay injects <style> tags without our nonce.
  //   - Prod: runtime-styling libraries (e.g. sonner) inject <style> tags and
  //     inline style attributes without a nonce; a nonce-only policy blocks them.
  // Browsers ignore 'unsafe-inline' when a nonce is present, so the nonce is
  // omitted from style-src to keep 'unsafe-inline' effective.
  const styleSrc = "style-src 'self' 'unsafe-inline'";

  return [
    "default-src 'self'",
    scriptSrc,
    styleSrc,
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
