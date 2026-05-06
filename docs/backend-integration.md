# Backend Integration

This document describes how this frontend template integrates with backend services.

## Framework

- **Framework**: Next.js 16.2.2 with App Router
- **Runtime**: Node.js 24.15.0
- **Rendering**: Server-side rendering (SSR) and client-side rendering (CSR)

## API Integration

### Environment Configuration

The template expects the following backend-related environment variables (configured in `.env.example`):

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Public API endpoint accessible from browser | Yes (defaults to `http://localhost:3000/api`) |
| `API_URL` | Server-side only API endpoint (not exposed to browser) | No |
| `API_SECRET` | Server-side authentication token (min 32 characters) | No |
| `API_TIMEOUT` | API request timeout in milliseconds | No (default: 10000) |

### Client-Side API Calls

Client components should use `NEXT_PUBLIC_API_URL` for API requests:

```typescript
import { env } from '@/lib/env';

const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/endpoint`);
```

### Server-Side API Calls

Server components and API routes can use `API_URL` for internal API calls:

```typescript
import { env } from '@/lib/env';

const response = await fetch(`${env.API_URL}/endpoint`, {
  headers: {
    'Authorization': `Bearer ${env.API_SECRET}`
  }
});
```

## Backend Endpoints (Template)

This is a frontend template and does not include a backend. However, it expects the following API structure:

### Expected API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api` | Health check or API info |
| * | `/api/*` | Application API (custom implementation required) |

### API Response Format

The frontend expects JSON responses:

```typescript
// Success response
{ "data": ..., "status": "success" }

// Error response
{ "error": { "message": "...", "code": "..." }, "status": "error" }
```

## Authentication Patterns

### Environment-Based Auth

The template supports token-based authentication via `API_SECRET`:

```typescript
const response = await fetch(apiUrl, {
  headers: {
    'Authorization': `Bearer ${env.API_SECRET}`,
    'Content-Type': 'application/json'
  }
});
```

### Adding OAuth Providers

When ready to add OAuth authentication:

1. Uncomment and configure provider variables in `.env.example`:
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

2. Install NextAuth.js:
   ```bash
   npm install next-auth
   ```

3. Configure providers in your auth implementation

## Next.js Configuration

### Proxy Configuration (next.config.ts)

The template uses Next.js standalone output for Docker deployment. No additional proxy configuration is required since API calls are made directly to `API_URL`.

For development, API calls can be proxied through the Next.js dev server by adding to `next.config.ts`:

```typescript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:4000/api/:path*'
    }
  ];
}
```

### Security Headers

All API calls should be made over HTTPS in production. The template enforces this via:

- **Strict-Transport-Security**: 1-year HSTS with includeSubDomains
- **upgrade-insecure-requests**: Auto-upgrades HTTP to HTTPS

### Content Security Policy

The CSP is configured in `next.config.ts` with:
- `connect-src 'self'`: Only allows API calls to the same origin
- Update this to include your backend domain: `connect-src 'self' https://api.example.com`

## Database Integration

The template includes commented-out database configuration in `src/lib/env.ts`. To enable:

1. Uncomment `DATABASE_URL` and pool settings in `.env.example`
2. Configure in `src/lib/env.ts`:
   ```typescript
   DATABASE_URL: z.string().url().optional(),
   ```

## Error Handling

The frontend uses Zod for validation. API errors should follow this format:

```typescript
// Validation error (Zod)
{
  "error": {
    "message": "Invalid environment variables",
    "details": { ... }
  }
}

// API error
{
  "error": {
    "message": "Not found",
    "code": "RESOURCE_NOT_FOUND"
  }
}
```

## Development Notes

- For local development with a backend, copy `.env.example` to `.env.local` and update the API URLs
- The frontend runs on port 3000 by default
- Backend typically runs on port 4000 or another configured port
- Use `npm run dev` for development with hot module replacement