# Backend Integration Guide

This is a **frontend-only** Next.js application. No API routes are defined in this repository (`src/app/api/` is empty). The frontend integrates with external backend services via environment-variable-driven configuration.

## Framework Versions

| Package | Version |
|---------|---------|
| Next.js | 16.2.2 |
| React | 19.2.4 |
| Node.js | 24.15.0 (engine requirement) |

## API Configuration

### Environment Variables

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Client + Server | `http://localhost:3000/api` | Public API endpoint accessible from the browser. Used for client-side API calls. |
| `API_URL` | Server only | `http://localhost:4000` | Backend API endpoint for server-side operations (not exposed to the browser). |
| `API_SECRET` | Server only | (none) | Server-side authentication token/key. Must be at least 32 characters when set. |
| `API_TIMEOUT` | Server only | `10000` | API request timeout in milliseconds. |

### Client-Side vs Server-Side Variables

- **Variables prefixed with `NEXT_PUBLIC_`** are exposed to the browser. Use these only for non-sensitive configuration.
- **Variables without the prefix** are server-side only and are not included in the client bundle.

### Validation

Environment variables are validated at startup using Zod schemas defined in `src/lib/env.ts`. If validation fails, the application will throw an error with detailed messages. This ensures misconfiguration is caught early.

## Backend Communication

### Client-Side API Calls

Use the validated `NEXT_PUBLIC_API_URL` for browser-based API requests:

```typescript
import { env } from '@/lib/env';

const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/your-endpoint`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // for cookie-based auth if needed
});
```

### Server-Side API Calls

Use `API_URL` and `API_SECRET` for server-side operations (API routes, server components, server actions):

```typescript
import { env } from '@/lib/env';

const response = await fetch(`${env.API_URL}/your-endpoint`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${env.API_SECRET}`,
  },
  signal: AbortSignal.timeout(env.API_TIMEOUT),
});
```

### Authentication Patterns

This template does not enforce a specific auth pattern. Based on your backend requirements, you may implement:

- **Cookie-based auth**: Use `credentials: 'include'` in fetch calls; configure `NEXTAUTH_URL` and `NEXTAUTH_SECRET` (NextAuth.js)
- **Bearer tokens**: Pass `Authorization: Bearer <token>` header
- **API key headers**: Pass custom headers like `X-API-Key: <secret>`

## Next.js Configuration

### Proxy / Rewrites

**No rewrite rules are configured.** This template does not proxy requests through Next.js. Backend endpoints are called directly using the URL from environment variables.

If you need proxying (e.g., to hide backend URLs, avoid CORS issues), add `rewrites` to `next.config.ts`:

```typescript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: `${process.env.API_URL}/:path*`,
    },
  ];
},
```

### Security Headers

The `next.config.ts` configures security headers for all routes:

- `X-Frame-Options: DENY` — Prevents clickjacking
- `X-Content-Type-Options: nosniff` — Prevents MIME sniffing
- `Referrer-Policy: origin-when-cross-origin` — Controls referrer info
- `Strict-Transport-Security` — Enforces HTTPS (1 year, includes subdomains)
- `Permissions-Policy` — Disables unused browser APIs
- `Content-Security-Policy` — Restricts resource loading (includes `'unsafe-inline'` required for Next.js)

### Standalone Output

The `output: 'standalone'` option is enabled, producing a single-deployment Docker image containing only the necessary files.

## Optional Backend Integrations

The following integrations are documented in `.env.example` but commented out. Uncomment and configure as needed.

### Database

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

### Authentication (NextAuth.js)

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here-min-32-chars
```

### OAuth Providers

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Error Tracking (Sentry)

```env
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

### Analytics

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Email (SMTP)

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@example.com
```

### File Storage (S3)

```env
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## Adding API Routes

To create backend API endpoints within this frontend, add route handlers in `src/app/api/`. For example:

```
src/app/api/users/route.ts  →  POST /api/users
src/app/api/users/[id]/route.ts  →  GET /api/users/:id
```

Example:

```typescript
// src/app/api/example/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Example endpoint' });
}
```

## Checklist for Backend Integration

1. Copy `.env.example` to `.env.local` for local development
2. Set `NEXT_PUBLIC_API_URL` to your public API base URL
3. Set `API_URL` to your server-side backend URL (if different)
4. Set `API_SECRET` to your backend authentication secret
5. Adjust `API_TIMEOUT` if your backend is slow
6. Validate the configuration by starting the dev server: `npm run dev`
7. Add fetch calls in client components or API route handlers as needed
