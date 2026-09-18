import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { buildSecurityHeaders } from '@/lib/security-headers';

export function proxy(request: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const headers = buildSecurityHeaders({
    nonce,
    ctx: { apiUrl: env.API_URL, nodeEnv: env.NODE_ENV },
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  for (const [key, value] of headers) {
    response.headers.set(key, value);
  }
  response.headers.set('x-nonce', nonce);

  return response;
}

// Exclude static assets, image optimisation routes, and Next.js dev-server
// internals (HMR websockets, the dev redirect/header-suggestion overlay, and
// the Turbopack chunk paths that overlay references).
//
// Why this matters: the Next.js 16 dev server injects a suggestion overlay on
// HTML responses whose assets live under `__nextjs_original-stack-frame`,
// `__nextjs_source-map`, and similar internal paths. Without excluding them,
// our proxy re-runs on each one, sets a fresh `x-nonce` header, and the dev
// server's overlay then references Turbopack chunks at `/docs/-_XXXX.js` and
// `/docs/vendors-...-autocomplete-...js` that Turbopack never compiles —
// surfacing 404s in the dev console that have nothing to do with app code.
export const config = {
  matcher: ['/((?!_next/static|_next/image|_next/data|favicon.ico|__nextjs).*)'],
};
