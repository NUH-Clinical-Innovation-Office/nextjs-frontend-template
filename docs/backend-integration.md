# Backend Integration Guide

## Framework and Version

- **Framework**: Next.js
- **Version**: 16.2.2 (from `package.json`)
- **React Version**: 19.2.4
- **Runtime Environment**: Node.js >=24.14.1

## Current Backend Integration Status

This frontend template does not currently include any backend API routes or external API integrations. The infrastructure for backend communication is in place and can be extended as needed.

## Proxy Configuration

**Status**: No proxy or rewrites configuration is currently set up in `next.config.ts`.

The Next.js configuration includes security headers but no proxy rules. To add backend proxying:

```typescript
// next.config.ts
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:4000/api/:path*',
    },
  ];
}
```

## Environment Variables

### Client-Side Variables (Browser-Accessible)

These variables are prefixed with `NEXT_PUBLIC_` and are exposed to the browser.

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Base URL of the application (used for absolute URLs, SEO) | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Public API endpoint accessible from the browser | `http://localhost:3000/api` |

### Server-Side Variables (Server-Only)

These variables are not exposed to the browser and are validated at runtime via Zod in `src/lib/env.ts`.

| Variable | Description | Default |
|----------|-------------|---------|
| `API_URL` | Backend API endpoint (server-side only, not exposed to browser) | Undefined |
| `API_SECRET` | API authentication token or key (server-side only) | Undefined |
| `API_TIMEOUT` | API timeout in milliseconds | `10000` |
| `NODE_ENV` | Application environment | `development` |

### Optional Server-Side Variables (Commented Out)

The following variables are defined in `src/lib/env.ts` but are commented out. Uncomment to enable:

#### Authentication (NextAuth.js)

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_URL` | NextAuth.js callback URL |
| `NEXTAUTH_SECRET` | NextAuth.js secret (min 32 characters) |

#### OAuth Providers

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |

#### Third-Party Services

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN (browser) |
| `SENTRY_AUTH_TOKEN` | Sentry authentication token (server) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics measurement ID |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog analytics key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host URL |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Email service configuration |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET` | AWS S3 configuration |

## Auth Pattern

**Current Status**: No authentication is currently implemented.

The template uses NextAuth.js patterns with environment variables ready for OAuth integration. To enable authentication:

1. Uncomment NextAuth variables in `src/lib/env.ts`
2. Install NextAuth: `npm install next-auth`
3. Create API route at `src/app/api/auth/[...nextauth]/route.ts`

## API Endpoints

**Current Status**: No API endpoints are currently defined in this template.

There are no API routes in `src/app/api/` and no fetch/axios/HTTP calls to any backend services.

### Adding Backend API Calls

To add backend API integration, use the validated environment variables:

```typescript
import { env } from '@/lib/env';

// Server-side API call
const response = await fetch(`${env.API_URL}/endpoint`, {
  headers: {
    'Authorization': `Bearer ${env.API_SECRET}`,
    'Content-Type': 'application/json',
  },
  signal: AbortSignal.timeout(env.API_TIMEOUT),
});

// Client-side API call
const clientResponse = await fetch(`${env.NEXT_PUBLIC_API_URL}/endpoint`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
```

## Adding API Routes

To create backend API routes within this Next.js frontend:

1. Create route files in `src/app/api/` following Next.js App Router conventions:

```
src/app/api/
├── users/
│   └── route.ts        # GET, POST /api/users
├── users/[id]/
│   └── route.ts        # GET, PUT, DELETE /api/users/:id
└── example/
    └── route.ts        # Example endpoint
```

2. Example API route handler:

```typescript
// src/app/api/example/route.ts
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET() {
  try {
    const response = await fetch(`${env.API_URL}/example`, {
      headers: {
        'Authorization': `Bearer ${env.API_SECRET}`,
      },
      signal: AbortSignal.timeout(env.API_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
```

## Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. For production, set actual values for:
   - `API_URL` - Your backend API base URL
   - `API_SECRET` - Secure token (min 32 characters)

3. Restart the development server after updating environment variables.

## Security Notes

- Never commit `.env.local` or files containing actual secrets
- `API_SECRET` is server-only and never exposed to the browser
- All environment variables are validated at runtime via Zod
- Security headers are configured in `next.config.ts` (CSP, X-Frame-Options, etc.)
