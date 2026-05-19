# CSP Middleware Migration Design

**Date:** 2026-05-19
**Status:** Approved

## Problem

All security headers including Content Security Policy (CSP) are currently set as static strings in `next.config.ts`. This has three limitations:

1. No per-request nonce generation — forces `unsafe-inline` and `unsafe-eval` in CSP
2. No runtime env resolution — `connect-src` values are baked at image build time, not injectable via Kubernetes at pod startup
3. `NEXT_PUBLIC_*` vars in CSP create drift risk — client bundle has build-time value, CSP has runtime value

## Goal

- Eliminate `unsafe-inline` and `unsafe-eval` via nonce-based CSP
- Resolve `connect-src` URLs from `process.env` at request time (K8s runtime injection)
- Centralise all security headers in one place

## Approach: Middleware-Only Security Headers

Move all security headers (including non-CSP ones) from `next.config.ts` into `src/middleware.ts`. Generate a cryptographic nonce per request and pass it to the layout via the `x-nonce` response header.

### Why not keep `next.config.ts` headers?

`headers()` in `next.config.ts` runs once at server startup, not per request — nonces are impossible. The only reason to keep static headers there would be to avoid middleware overhead on static assets, but with a correct `matcher` config that overhead is eliminated.

### NEXT_PUBLIC_API_URL note

`NEXT_PUBLIC_API_URL` is currently unused (defined in `env.ts` only). When it gets used for client-side fetch calls, its value in `connect-src` must come from the server-side `API_URL` env var — that is what K8s injects at runtime. `NEXT_PUBLIC_*` vars are baked at build time by Next.js and cannot be overridden at runtime.

## Architecture

### Request Flow

```
Request → middleware.ts (matcher excludes static assets)
  → crypto nonce generated (base64 UUID)
  → csp.ts builds CSP string (reads process.env.API_URL at this moment)
  → all security headers set on NextResponse
  → x-nonce header set on response
  → layout.tsx reads x-nonce via headers()
  → nonce passed to <Script nonce={nonce} />
```

### Files

| File | Action | Purpose |
|------|--------|---------|
| `src/middleware.ts` | Create | All security headers + nonce generation |
| `src/lib/csp.ts` | Create | Pure CSP string builder (testable) |
| `src/lib/csp.test.ts` | Create | Unit tests for CSP builder |
| `src/middleware.test.ts` | Create | Integration tests for middleware headers |
| `next.config.ts` | Modify | Remove `headers()` function entirely |
| `src/app/layout.tsx` | Modify | Read nonce, pass to `<Script>` |

## Implementation Details

### `src/lib/csp.ts`

Pure function — no side effects, fully testable:

```ts
export function buildCsp(nonce: string): string {
  const apiUrl = process.env.API_URL ?? '';
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    `connect-src 'self' ${apiUrl}`.trim(),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}
```

Key: `unsafe-inline` and `unsafe-eval` are absent. Nonce replaces them.

### `src/middleware.ts`

```ts
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

Nonce attachment:

```ts
const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
response.headers.set('x-nonce', nonce);
response.headers.set('Content-Security-Policy', buildCsp(nonce));
```

All other security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `X-DNS-Prefetch-Control`, `Strict-Transport-Security`, `Permissions-Policy`, `X-Permitted-Cross-Domain-Policies`) set on the same response object.

### `src/app/layout.tsx`

```ts
import { headers } from 'next/headers';
const nonce = (await headers()).get('x-nonce') ?? '';
```

Pass nonce to any `<Script>` components. Layout remains a server component (already is, no `'use client'`).

### `next.config.ts`

Remove the entire `async headers()` function. Keep `output`, `experimental.optimizePackageImports`, and `withBundleAnalyzer`.

## Testing Strategy

### `src/lib/csp.test.ts` — unit tests

- CSP string contains `nonce-${nonce}` in `script-src` and `style-src`
- `unsafe-inline` absent from output
- `unsafe-eval` absent from output
- `connect-src` includes `API_URL` when env var is set
- `connect-src` falls back to `'self'` only when `API_URL` is unset

### `src/middleware.test.ts` — integration tests

- Response includes `Content-Security-Policy` header
- Response includes `x-nonce` header
- Static asset paths (`/_next/static/*`) do not trigger middleware (matcher exclusion)
- All non-CSP security headers present on response

## Known Constraints

- `NEXT_PUBLIC_*` vars remain baked at build time in the client JS bundle — this is a Next.js limitation, not addressed here
- Middleware adds per-request overhead on non-static routes — acceptable given the matcher excludes static assets
- Layout must remain a server component to call `headers()` — already the case
