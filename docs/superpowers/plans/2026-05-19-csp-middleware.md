# CSP Middleware Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all security headers (including CSP) from `next.config.ts` to a new Next.js middleware that generates per-request nonces and resolves env values at runtime.

**Architecture:** A new `src/middleware.ts` intercepts every non-static request, generates a base64 nonce, builds a nonce-based CSP string via a pure helper in `src/lib/csp.ts`, attaches all security headers + `x-nonce` to the response. The root layout reads `x-nonce` from request headers for `<Script>` injection. The `headers()` function in `next.config.ts` is removed.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Vitest, Biome.

**Spec:** `docs/superpowers/specs/2026-05-19-csp-middleware-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/lib/csp.ts` | Pure function `buildCsp(nonce)` — builds CSP string from a nonce + `process.env.API_URL` |
| `src/lib/csp.test.ts` | Unit tests for `buildCsp` |
| `src/middleware.ts` | Per-request nonce generation, attach all security headers, expose nonce via `x-nonce` |
| `src/middleware.test.ts` | Tests for middleware header attachment |
| `next.config.ts` | Modified — remove `headers()` function |
| `src/app/layout.tsx` | Modified — read `x-nonce` from `headers()` (no-op until `<Script>` is added; ensures wiring works) |

---

## Task 1: CSP Builder — Failing Tests

**Files:**
- Create: `src/lib/csp.test.ts`

- [ ] **Step 1: Write the failing test file**

Create `src/lib/csp.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
    delete process.env.API_URL;
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/lib/csp.test.ts`
Expected: FAIL — module `./csp` not found.

---

## Task 2: CSP Builder — Implementation

**Files:**
- Create: `src/lib/csp.ts`

- [ ] **Step 1: Create the CSP builder**

Create `src/lib/csp.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npm run test -- src/lib/csp.test.ts`
Expected: PASS — all 11 tests pass.

- [ ] **Step 3: Run lint and type-check**

Run: `npm run lint && npm run type-check`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/csp.ts src/lib/csp.test.ts
git commit -m "feat: add csp builder helper with nonce support"
```

---

## Task 3: Middleware — Failing Tests

**Files:**
- Create: `src/middleware.test.ts`

- [ ] **Step 1: Write the failing test file**

Create `src/middleware.test.ts`:

```ts
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { middleware } from './middleware';

function makeRequest(path = '/'): NextRequest {
  return new NextRequest(new URL(path, 'http://localhost:3000'));
}

describe('middleware', () => {
  it('attaches Content-Security-Policy header', () => {
    const res = middleware(makeRequest());
    const csp = res.headers.get('Content-Security-Policy');
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src 'self'");
  });

  it('attaches x-nonce header', () => {
    const res = middleware(makeRequest());
    const nonce = res.headers.get('x-nonce');
    expect(nonce).toBeTruthy();
    expect(nonce?.length).toBeGreaterThan(0);
  });

  it('embeds the same nonce in CSP and x-nonce', () => {
    const res = middleware(makeRequest());
    const nonce = res.headers.get('x-nonce');
    const csp = res.headers.get('Content-Security-Policy');
    expect(csp).toContain(`'nonce-${nonce}'`);
  });

  it('generates a unique nonce per request', () => {
    const a = middleware(makeRequest()).headers.get('x-nonce');
    const b = middleware(makeRequest()).headers.get('x-nonce');
    expect(a).not.toBe(b);
  });

  it('attaches X-Frame-Options DENY', () => {
    const res = middleware(makeRequest());
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('attaches X-Content-Type-Options nosniff', () => {
    const res = middleware(makeRequest());
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('attaches Referrer-Policy', () => {
    const res = middleware(makeRequest());
    expect(res.headers.get('Referrer-Policy')).toBe('origin-when-cross-origin');
  });

  it('attaches X-DNS-Prefetch-Control', () => {
    const res = middleware(makeRequest());
    expect(res.headers.get('X-DNS-Prefetch-Control')).toBe('on');
  });

  it('attaches Strict-Transport-Security with preload', () => {
    const res = middleware(makeRequest());
    expect(res.headers.get('Strict-Transport-Security')).toBe(
      'max-age=31536000; includeSubDomains; preload',
    );
  });

  it('attaches Permissions-Policy', () => {
    const res = middleware(makeRequest());
    const pp = res.headers.get('Permissions-Policy');
    expect(pp).toContain('camera=()');
    expect(pp).toContain('microphone=()');
    expect(pp).toContain('geolocation=()');
  });

  it('attaches X-Permitted-Cross-Domain-Policies none', () => {
    const res = middleware(makeRequest());
    expect(res.headers.get('X-Permitted-Cross-Domain-Policies')).toBe('none');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/middleware.test.ts`
Expected: FAIL — module `./middleware` not found.

---

## Task 4: Middleware — Implementation

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create the middleware**

Create `src/middleware.ts`:

```ts
import { type NextRequest, NextResponse } from 'next/server';
import { buildCsp } from '@/lib/csp';

export function middleware(_request: NextRequest): NextResponse {
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
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload',
  );
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
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npm run test -- src/middleware.test.ts`
Expected: PASS — all 11 tests pass.

- [ ] **Step 3: Run lint and type-check**

Run: `npm run lint && npm run type-check`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts src/middleware.test.ts
git commit -m "feat: add middleware for csp and security headers"
```

---

## Task 5: Remove Headers from next.config.ts

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Replace the file**

Replace the entire contents of `next.config.ts` with:

```ts
import type { NextConfig } from 'next';

// Bundle analyzer plugin
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Optimize package imports for faster builds and smaller bundles
    optimizePackageImports: ['lucide-react'],
  },
  // Security headers (including CSP with per-request nonces) are set in
  // `src/middleware.ts`. Middleware enables runtime env resolution (e.g.
  // API_URL from Kubernetes) and per-request nonces to eliminate
  // `unsafe-inline` / `unsafe-eval` in the CSP.
};

export default withBundleAnalyzer(nextConfig);
```

- [ ] **Step 2: Run lint and type-check**

Run: `npm run lint && npm run type-check`
Expected: No errors.

- [ ] **Step 3: Run all tests**

Run: `npm run test`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "refactor: remove headers from next config in favor of middleware"
```

---

## Task 6: Layout — Read Nonce From Headers

**Files:**
- Modify: `src/app/layout.tsx`

Note: there are no `<Script>` components in the layout today. We still wire the nonce read so future scripts can use it. This makes the layout `async` and confirms the middleware → layout handoff works end-to-end.

- [ ] **Step 1: Replace the file**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
// Import env to validate environment variables on application startup
import '@/lib/env';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NUH | National University Hospital',
  description: 'National University Hospital - Singapore leading university hospital',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read per-request nonce attached by `src/middleware.ts`. Pass to any
  // `<Script nonce={nonce} />` components added in the future so they are
  // permitted by the nonce-based CSP.
  const nonce = (await headers()).get('x-nonce') ?? '';
  // Suppress unused warning until a Script consumes the nonce. Keeping the
  // read here documents the wiring and ensures middleware → layout works.
  void nonce;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Run lint, type-check, and tests**

Run: `npm run lint && npm run type-check && npm run test`
Expected: All pass.

- [ ] **Step 3: Build the project**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: read nonce from request headers in root layout"
```

---

## Task 7: Manual Smoke Test

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: Server starts on `http://localhost:3000` without errors.

- [ ] **Step 2: Verify headers in browser**

Open `http://localhost:3000` in a browser. Open DevTools → Network → click the document request → Response Headers.

Verify each of the following is present:
- `Content-Security-Policy` — contains `nonce-<some-base64>` in `script-src` and `style-src`, no `unsafe-inline`, no `unsafe-eval`
- `x-nonce` — a base64 string matching the nonce in the CSP
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Permissions-Policy` — includes `camera=()`, `microphone=()`, `geolocation=()`
- `X-Permitted-Cross-Domain-Policies: none`

- [ ] **Step 3: Verify nonce changes per request**

Reload the page. The `x-nonce` value should be different on every reload.

- [ ] **Step 4: Verify static assets bypass middleware**

In DevTools → Network, click a request to `/_next/static/*`. It should NOT have an `x-nonce` header (matcher excludes it).

- [ ] **Step 5: Verify runtime API_URL injection**

Stop the dev server. Start with: `API_URL=https://api.example.com npm run dev`. Reload `http://localhost:3000`. The `Content-Security-Policy` header's `connect-src` directive should now include `https://api.example.com`.

- [ ] **Step 6: Stop dev server**

If all manual checks pass, stop the dev server (Ctrl+C). Nothing to commit.

---

## Self-Review Checklist

After all tasks complete:

1. **Spec coverage:** all 6 files listed in spec "Files" table are accounted for (csp.ts, csp.test.ts, middleware.ts, middleware.test.ts, next.config.ts, layout.tsx).
2. **CSP requirements:** no `unsafe-inline`, no `unsafe-eval`, nonce in script-src + style-src, `API_URL` runtime-resolved in `connect-src`.
3. **No placeholders:** every step has concrete code or a concrete command.
4. **Type consistency:** `buildCsp(nonce: string)` signature used identically in Task 2 (impl), Task 1 (tests), and Task 4 (middleware).
