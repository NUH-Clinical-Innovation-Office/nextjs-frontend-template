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

// Exclude static assets and image optimisation routes — nonce generation
// for them is wasted work and they don't render HTML that needs CSP.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
