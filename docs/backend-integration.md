# Backend Integration Guide

This document describes how this frontend template integrates with backend services.

## Framework

- **Framework**: Next.js 16.2.2
- **Runtime**: Node.js 24.15.0
- **Rendering**: App Router with Server and Client Components

## API Configuration

The template uses two API URL environment variables to support different backend architectures:

### Client-Side API URL

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

- Prefixed with `NEXT_PUBLIC_`, making it safe to expose to the browser
- Intended for public API endpoints that do not require authentication secrets
- Used for browser-accessible API routes

### Server-Side API URL

```env
API_URL=http://localhost:4000
API_SECRET=your-api-secret-key-here-min-32-chars
API_TIMEOUT=10000
```

- Server-side only (not exposed to browser)
- `API_SECRET` must be at least 32 characters
- `API_TIMEOUT` defaults to 10000ms (10 seconds)

## Environment Variables

Environment variables are defined in `src/lib/env.ts` and validated at runtime using Zod.

### Client Variables (Browser-Exposed)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | string | `http://localhost:3000` | Application base URL |
| `NEXT_PUBLIC_API_URL` | string | `http://localhost:3000/api` | Public API endpoint |

### Server Variables (Not Exposed to Browser)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | enum | `development` | Runtime environment |
| `API_URL` | string | - | Backend API base URL |
| `API_SECRET` | string | - | API authentication secret (min 32 chars) |
| `API_TIMEOUT` | number | `10000` | API timeout in milliseconds |

### Optional Server Variables (Commented)

The following variables are defined in the schema but commented out by default. Uncomment to enable:

**Database**
- `DATABASE_URL` - PostgreSQL connection string
- `DATABASE_POOL_MIN` / `DATABASE_POOL_MAX` - Connection pool settings

**Authentication (NextAuth.js)**
- `NEXTAUTH_URL` - NextAuth callback URL
- `NEXTAUTH_SECRET` - NextAuth secret (min 32 chars)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub OAuth

**Third-Party Services**
- `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_AUTH_TOKEN` - Error tracking
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics
- `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` - PostHog analytics
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` - Email
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` / `AWS_S3_BUCKET` - S3 file storage

## Environment Validation with Zod

The `src/lib/env.ts` module provides type-safe access to environment variables:

```ts
import { env } from '@/lib/env';

// Access validated environment variables
const apiUrl = env.NEXT_PUBLIC_API_URL;
const apiSecret = env.API_SECRET;
```

Validation occurs at application startup. If validation fails, the application throws a `ZodError` with detailed error messages.

### Helper Exports

The env module also exports boolean flags:

```ts
import { env, isProduction, isDevelopment, isTest } from '@/lib/env';

if (isProduction) {
  // Production-specific logic
}
```

## Next.js Configuration

### No Proxy Configuration

This template does not include any proxy or rewrite rules in `next.config.ts`. API requests to backend services are made directly using the full URL from environment variables.

### Security Headers

The template includes security headers configured in `next.config.ts`:

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: origin-when-cross-origin` - Controls referrer information
- `Strict-Transport-Security` - Enforces HTTPS
- `Permissions-Policy` - Blocks sensitive browser APIs
- `Content-Security-Policy` - Restricts resource loading

### Output Mode

The Next.js output mode is set to `standalone` for optimized Docker deployments.

## API Integration Patterns

### Server Components (Recommended)

For backend API calls, use Server Components with direct fetch:

```tsx
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
  const response = await fetch(env.API_URL, {
    headers: {
      'Authorization': `Bearer ${env.API_SECRET}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();

  return <div>{/* render data */}</div>;
}
```

### Client Components with Fetch

For client-side API calls, use the standard Fetch API or a data-fetching library:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { env } from '@/lib/env';

export function useApiData<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${endpoint}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [endpoint]);

  return { data, loading };
}
```

## Authentication Patterns

This template does not implement authentication out of the box. The `src/lib/env.ts` file includes commented-out NextAuth.js configuration that can be enabled by:

1. Uncommenting the NextAuth-related environment variables
2. Installing the `next-auth` package
3. Creating an API route at `src/app/api/auth/[...nextauth]/route.ts`

## Key Files

- `src/lib/env.ts` - Environment variable schema and validation
- `next.config.ts` - Next.js configuration including security headers
- `.env.example` - Template for environment variables

## Adding Backend Integration

1. Copy `.env.example` to `.env.local`
2. Set your backend URLs in the environment variables
3. Use the `env` import to access validated variables:

```ts
import { env } from '@/lib/env';

// Server-side (use API_SECRET for authenticated requests)
const serverData = await fetch(`${env.API_URL}/endpoint`, {
  headers: { 'Authorization': `Bearer ${env.API_SECRET}` },
});

// Client-side (use NEXT_PUBLIC_API_URL for public endpoints)
const clientData = await fetch(`${env.NEXT_PUBLIC_API_URL}/public-endpoint`);
```
