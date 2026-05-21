# Backend Integration

Backend consumption reference for this Next.js frontend template.

## Framework

Next.js 16 with App Router. React 19.

## Current Backend Usage

This template is a standalone frontend with **no backend API calls** currently implemented. The following configuration is pre-wired for when a backend is integrated.

## Proxy/Middleware Configuration

This template uses Next.js 16 proxy middleware (`src/proxy.ts`, formerly `middleware.ts` in Next.js 15 and earlier) for:

- **Security headers** — Setting CSP, X-Frame-Options, HSTS, and other security headers at request time
- **Nonce-based CSP** — Generating per-request nonces for strict Content Security Policy without `unsafe-inline`
- **Runtime environment resolution** — Reading `API_URL` and other env vars at request time (useful for Kubernetes-injected values)

### Adding API Rewrites/Proxying

To add API proxying to avoid CORS issues, add a `rewrites` function to `next.config.ts`:

```ts
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: `${process.env.API_URL}/:path*`,
    },
  ];
}
```

This avoids exposing the backend URL to the browser and avoids CORS issues. Client-side code can then request `/api/...` and Next.js will proxy to the destination.

### CSP and Backend Connectivity

The proxy middleware in `src/proxy.ts` dynamically builds the CSP header using `src/lib/csp.ts`. When `API_URL` is set in the environment, it is automatically added to the `connect-src` directive to allow frontend-to-backend API calls.

## Environment Variables

Environment variables are validated at runtime using Zod schemas in `src/lib/env.ts`. Access them via `import { env } from '@/lib/env'`.

### Client-side (NEXT_PUBLIC_ prefix, browser-safe)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | `string` | `http://localhost:3000` | Base URL of the application |
| `NEXT_PUBLIC_API_URL` | `string` | `http://localhost:3000/api` | Public API endpoint (browser-accessible) |

### Server-side

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | `'development' \| 'test' \| 'production'` | `development` | Runtime environment |
| `API_URL` | `string` (optional) | — | Server-side API endpoint (not exposed to browser) |
| `API_SECRET` | `string` (optional, min 32 chars) | — | Server-side API authentication key |
| `API_TIMEOUT` | `number` (parsed from string) | `10000` | API request timeout in milliseconds |

### Commented-out Templates

The following variables have commented-out Zod schemas in `src/lib/env.ts` and corresponding entries in `.env.example`. Uncomment them when needed:

- **Database**: `DATABASE_URL`, `DATABASE_POOL_MIN`, `DATABASE_POOL_MAX`
- **NextAuth.js**: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- **OAuth Providers**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- **Error Tracking**: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`
- **Analytics**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- **Email Service**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
- **File Storage**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`

## Authentication

No authentication is currently implemented. Commented-out templates for NextAuth.js are available in `src/lib/env.ts` and `.env.example`.

To enable authentication:

1. Uncomment `NEXTAUTH_URL` and `NEXTAUTH_SECRET` in `src/lib/env.ts`
2. Install next-auth: `npm install next-auth`
3. Configure NextAuth.js in `src/app/api/auth/[...nextauth]/route.ts`
4. Set secrets in Vault or `.env.local`

## Vault Integration

HashiCorp Vault Agent Injector is configured in the Helm charts to inject secrets at runtime. This avoids storing sensitive values in container images or Git.

### How It Works

Pod annotations in the Helm values files trigger Vault Agent Injector to render a file at `/vault/secrets/env` containing exported environment variables. The injected secrets are:

- `NEXTAUTH_URL` — NextAuth.js callback URL
- `NEXTAUTH_SECRET` — NextAuth.js signing/encryption key
- `DATABASE_URL` — Database connection string
- `API_URL` — Server-side API endpoint

### Vault Paths by Environment

| Environment | Vault Path |
|-------------|------------|
| Feature branch | `secret/data/nextjs-frontend-template/development` |
| Staging | `secret/data/nextjs-frontend-template/staging` |
| Production | `secret/data/nextjs-frontend-template/production` |

### Adding New Secrets to Vault

To inject additional secrets:

1. Add the key-value pair to the corresponding Vault path (e.g., via `vault kv patch`)
2. Add an `export` line to the `vault.hashicorp.io/agent-inject-template-env` annotation in the relevant Helm values file (`values-feature.yaml`, `values-staging.yaml`, or `values-production.yaml`)
3. Add the variable to the Zod schema in `src/lib/env.ts` (or uncomment an existing commented-out entry)

## Adding Backend Integration

Step-by-step guide for adding a backend API:

1. **Configure API URL** — Set `API_URL` in `.env.local` to point to your backend (e.g., `http://localhost:4000`). For browser-accessible endpoints, also set `NEXT_PUBLIC_API_URL`.

2. **Add Next.js rewrites** — If proxying is needed to avoid CORS, add a `rewrites` function in `next.config.ts` (see the Proxy Configuration section above).

3. **Create server-side data fetching functions** — Place these in `src/lib/` (e.g., `src/lib/api.ts`). Use `env.API_URL` and `env.API_SECRET` for authenticated server-side requests:

   ```ts
   import { env } from '@/lib/env';

   async function fetchFromAPI(path: string, options?: RequestInit) {
     const url = `${env.API_URL}${path}`;
     const headers: Record<string, string> = {
       'Content-Type': 'application/json',
       ...(env.API_SECRET && { Authorization: `Bearer ${env.API_SECRET}` }),
       ...options?.headers,
     };

     const response = await fetch(url, {
       ...options,
       headers,
       signal: AbortSignal.timeout(env.API_TIMEOUT),
     });

     if (!response.ok) {
       throw new Error(`API error: ${response.status}`);
     }

     return response.json();
   }
   ```

4. **Use in Server Components** — Call data fetching functions directly in Server Components (the default in App Router):

   ```ts
   // src/app/dashboard/page.tsx
   import { fetchFromAPI } from '@/lib/api';

   export default async function DashboardPage() {
     const data = await fetchFromAPI('/dashboard');
     return <Dashboard data={data} />;
   }
   ```

5. **Store production secrets in Vault** — Never commit real secrets to Git. Add them to the Vault path for each environment and update the Helm template annotations to inject them.
