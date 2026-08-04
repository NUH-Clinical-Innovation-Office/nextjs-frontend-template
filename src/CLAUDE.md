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
```

The browser never learns the internal address. `COMMON_SERVICE_URL` is
deliberately **not** prefixed with `NEXT_PUBLIC_`, which is what keeps it out
of the client bundle. Do not add the prefix.

### Auth

common-service validates an auth-service RS256 JWT via JWKS on every request.
There is no unauthenticated path. The user pastes their own token into the
form; the proxy forwards it as `Authorization: Bearer <token>` and never logs,
stores, or echoes it back.

Status mapping in `route.ts` is intentional:

| Upstream            | Returned | Why                                        |
|---------------------|----------|--------------------------------------------|
| 200                 | 200      | Validated payload passed through           |
| 401                 | 401      | Rejected token must stay distinct from an outage |
| other non-2xx       | 502      | Upstream fault, details not leaked         |
| timeout             | 504      | Worth retrying                             |
| unreachable         | 502      | Usually misconfiguration                   |

Keep the 401 distinct. Collapsing it into a generic error makes the token
field undebuggable.

## Environment variables

```tsx
import { env } from '@/lib/env';

const upstream = env.COMMON_SERVICE_URL; // server-side only
```

Validated once at startup by Zod. Adding a variable means adding it to the
schema in `src/lib/env.ts`.

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
