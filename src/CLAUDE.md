# src/ Directory Guide

## Structure

```
src/
├── app/
│   ├── api/notes/route.ts   # Server-side proxy to common-service
│   ├── layout.tsx
│   ├── page.tsx
│   ├── error.tsx            # Route error boundary
│   ├── global-error.tsx     # Root error boundary
│   └── loading.tsx
│
├── components/
│   ├── add-note-card.tsx    # The one feature component
│   └── ui/                  # shadcn/ui: button, card, input, label, sonner
│
├── lib/
│   ├── env.ts               # Zod-validated environment variables
│   ├── csp.ts               # Content Security Policy builder
│   └── utils.ts             # cn() helper
│
└── proxy.ts                 # Security headers + per-request CSP nonce
```

This is a deliberately small sample. It was reduced from a design-system
showcase template, so if you are looking for atoms/molecules/providers or the
other ~30 shadcn components, they were removed on purpose. Add components back
via `bunx shadcn@latest add <name>` only when something actually uses them —
`bun run knip` fails the build on unused dependencies.

## How the common-service call works

common-service has **no ingress**. It is reachable only from inside the
cluster, at `http://common-service.sample-services.svc.cluster.local:8080`.

That shapes the data flow:

```
browser → POST /api/notes (same origin)
          → route.ts (Node runtime, server-side)
            → POST {COMMON_SERVICE_URL}/api/v1/todos (cluster-internal)
              → common-service exchanges X-API-Key at auth-service
```

The browser never learns the internal address. `COMMON_SERVICE_URL` is
deliberately **not** prefixed with `NEXT_PUBLIC_`, which is what keeps it out
of the client bundle. The same applies to `COMMON_SERVICE_API_KEY`, which is a
real credential. Do not add the prefix to either.

The endpoint is `/api/v1/todos` even though this app calls the concept a
"note" - common-service's operation is `CreateTodo`. The rename stops at the
proxy boundary.

### Auth

common-service validates an auth-service RS256 JWT via JWKS on every request.
There is no unauthenticated path. It accepts two credentials, and this app
supports both:

1. **`X-API-Key` (preferred).** This app is a *Consumer Backend*: it presents
   its developer API key and common-service exchanges it at auth-service for a
   short-lived, audience-bound JWT, which it caches. The key is read from
   `COMMON_SERVICE_API_KEY`, stays server-side, and the browser never sees or
   supplies a credential. When it is set, the UI renders no token field.
2. **`Authorization: Bearer`.** Only used when no API key is configured. The
   user pastes a token into the form and the proxy forwards it verbatim.

**A token from auth-service's `/oauth2/token` (client_credentials) will not
work.** auth-service leaves `aud` defaulted to the requesting `client_id`,
which never equals common-service's audience, so it is rejected with 401. Only
a token produced by the API-key exchange is accepted. That is why the API-key
path is the supported one and the bearer field is a local-dev fallback.

No credential is ever logged, stored, or echoed back.

Status mapping in `route.ts` is intentional:

| Upstream      | Returned | Why                                              |
|---------------|----------|--------------------------------------------------|
| 200           | 200      | Validated payload passed through                 |
| 400           | 400      | Caller's input was bad; 502 would misattribute it |
| 401           | 401      | Rejected credential must stay distinct from an outage |
| 413           | 413      | Body exceeded common-service's 4 KiB cap         |
| 429           | 429      | Rate limited; `Retry-After` is propagated        |
| 503           | 503      | Exchange unconfigured or auth-service down       |
| other non-2xx | 502      | Upstream fault, details not leaked               |
| timeout       | 504      | Worth retrying                                   |
| unreachable   | 502      | Usually misconfiguration                         |

Forwarded statuses carry common-service's `{ "detail": ... }` message through
as `error`, falling back to a generic string when the body is not that shape.
The 429 body is the one documented exception: it is emitted via Go's
`http.Error`, so it is `text/plain` and the fallback always applies.

Keep 401 and 400 distinct from 502. Collapsing them makes a rejected
credential indistinguishable from an outage, and a validation failure
indistinguishable from a service fault.

Note the rate limiter keys on client IP. Every browser call arrives through
this proxy, so common-service sees one IP for all users and its default of
10 requests/minute is shared across them.

## Environment variables

```tsx
import { env } from '@/lib/env';

const upstream = env.COMMON_SERVICE_URL; // server-side only
```

Validated once at startup by Zod. Adding a variable means adding it to the
schema in `src/lib/env.ts`.

| Variable                 | Required | Notes                                      |
|--------------------------|----------|--------------------------------------------|
| `COMMON_SERVICE_URL`     | no       | Defaults to the in-cluster address         |
| `COMMON_SERVICE_API_KEY` | no       | When unset, the UI asks for a bearer token |
| `API_TIMEOUT`            | no       | Milliseconds, defaults to 10000            |

Two details worth keeping:

- An **empty string is rejected**, not treated as unset. Zod's `.default()`
  only fires on `undefined`, so a blank value from a Helm or CI override would
  otherwise validate and produce `http:///api/v1/todos` at runtime. Failing at
  startup is the point.
- `route.ts` reads `COMMON_SERVICE_API_KEY` from `process.env` per request
  rather than from the validated `env` object. `env` is frozen at module load,
  which makes the key impossible to vary in tests without defeating the module
  cache. The validated value remains the fallback.

## Conventions

- Components are `kebab-case.tsx`; Next.js files follow its own names
  (`page.tsx`, `layout.tsx`, `route.ts`).
- Always import via the `@/` alias, never relative parent paths.
- Server Components by default; add `'use client'` only for hooks, events, or
  browser APIs.
- Tests sit next to the file under test as `*.test.ts(x)`.

## Testing

```bash
bun run test           # once
bun run test:watch     # watch
bun run test:coverage  # 60% floor, enforced in bunfig.toml
```

`bun test` does **not** hoist `vi.mock`, so a mocked module has to be imported
dynamically after the mock call. Tests here mostly stub `globalThis.fetch`
directly, which sidesteps the issue.
