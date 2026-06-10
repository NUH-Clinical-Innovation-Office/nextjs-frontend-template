import { type NextRequest, NextResponse } from 'next/server';
import { buildCsp } from '@/lib/csp';

export function proxy(_request: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(_request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('x-nonce', nonce);
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  );
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

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
