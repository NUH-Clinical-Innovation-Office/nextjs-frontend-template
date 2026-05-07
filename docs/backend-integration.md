# Backend Integration Guide

This document describes how the Next.js 16 frontend integrates with backend services.

## Framework

- **Next.js**: 16.x (App Router)
- **React**: 19.x
- **TypeScript**: 6.x
- **Runtime validation**: Zod 4.x

## Environment Variables

Environment variables are validated at runtime using Zod schemas in `src/lib/env.ts`. All variables are type-safe with TypeScript autocomplete.

### Client-Side Variables (Browser)

These variables are prefixed with `NEXT_PUBLIC_` and exposed to the browser.

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Base URL of the application (used for absolute URLs, SEO) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api` | Public API endpoint accessible from the browser |

### Server-Side Variables (Not Exposed to Browser)

These variables are only available on the server and contain sensitive data.

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Application environment (`development`, `test`, `production`) |
| `API_URL` | `http://localhost:4000` | Backend API endpoint (server-side only) |
| `API_SECRET` | (none) | API authentication token (min 32 characters) |
| `API_TIMEOUT` | `10000` | API timeout in milliseconds |

## API Configuration

### Default Endpoints

```typescript
// Client-side API calls (browser)
NEXT_PUBLIC_API_URL = http://localhost:3000/api

// Server-side API calls (backend)
API_URL = http://localhost:4000
```

### Usage in Code

```typescript
import { env } from '@/lib/env';

// Type-safe access to environment variables
const apiUrl = env.NEXT_PUBLIC_API_URL;    // Client: browser-safe URL
const serverUrl = env.API_URL;             // Server: backend URL
const apiSecret = env.API_SECRET;          // Server: auth token
const timeout = env.API_TIMEOUT;           // Server: 10000ms default
```

### Validation

Environment variables are validated on application startup. If validation fails, the application will throw an error with detailed messages:

```
Invalid environment variables:
{
  "API_SECRET": {
    "_errors": ["API_SECRET must be at least 32 characters for security"]
  }
}
```

## Proxy Configuration

This frontend does **not** configure Next.js rewrites for proxying backend requests. Backend communication relies on direct URLs configured via environment variables.

The `next.config.ts` includes security headers but no proxy rules.

## Security Headers

The following security headers are configured in `next.config.ts` for all routes:

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: origin-when-cross-origin` - Controls referrer information
- `X-DNS-Prefetch-Control: on` - Enables DNS prefetching
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` - Enforces HTTPS
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()` - Blocks browser APIs
- `X-Permitted-Cross-Domain-Policies: none` - Blocks Adobe Flash/PDF cross-domain content
- `Content-Security-Policy` - Controls resource loading (see note below)

**CSP Note**: The current CSP allows `unsafe-inline` and `unsafe-eval` for development compatibility (Next.js HMR, Tailwind critical CSS). For production hardening, implement nonce-based CSP via middleware.

## Backend Communication Pattern

### Client to API (Browser)

Client-side code uses `NEXT_PUBLIC_API_URL` for API calls:

```typescript
// Browser/Client component
const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/users`);
```

### Server to API (Backend)

Server-side code (API routes, server components) uses `API_URL` for backend communication:

```typescript
// Server-only code
const response = await fetch(`${env.API_URL}/internal/data`, {
  headers: {
    'Authorization': `Bearer ${env.API_SECRET}`,
    'X-Request-Timeout': String(env.API_TIMEOUT),
  },
  signal: AbortSignal.timeout(env.API_TIMEOUT),
});
```

## Example API Route

This frontend includes example API routes in `src/app/api/`. See `src/app/api/example/route.ts` for the pattern.

## Required Setup

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Configure required values:

   ```env
   # Required for server-side API calls
   API_URL=http://localhost:4000
   API_SECRET=your-secure-api-secret-at-least-32-chars

   # Optional overrides
   API_TIMEOUT=10000
   ```

3. Restart the development server after changing environment variables.

## Next.js Configuration

Key settings in `next.config.ts`:

- `output: 'standalone'` - Optimized for Docker deployments
- `experimental.optimizePackageImports: ['lucide-react']` - Faster builds, smaller bundles
- Security headers applied to all routes

## See Also

- `src/lib/env.ts` - Environment variable validation schema
- `.env.example` - Full list of configurable variables
- `docs/vault-setup-and-deployment.md` - HashiCorp Vault for secrets management