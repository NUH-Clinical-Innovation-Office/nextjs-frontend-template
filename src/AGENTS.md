# src/AGENTS.md

Where code goes in this application, and the conventions that are specific to
this repo. General Next.js, React, and Tailwind usage is assumed. This file
covers only the decisions a newcomer would otherwise get wrong.

## Directory Structure

```
src/
├── app/                  # Next.js App Router
│   ├── api/              # Route handlers (route.ts)
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── atoms/            # Indivisible UI elements
│   ├── molecules/        # Composites built from atoms/ui
│   ├── providers/        # React Context providers
│   └── ui/               # shadcn/ui, installed then owned by us
└── lib/
    ├── env.ts            # Zod-validated environment variables
    └── utils.ts          # cn() helper
```

## Where New Code Goes

| Need | Location | Notes |
|---|---|---|
| Pre-built UI component | `components/ui/` | Install via `bunx shadcn@latest add <name>` |
| Simple reusable element | `components/atoms/` | No dependency on other custom components |
| Interactive feature | `components/molecules/` | Composes atoms/ui, may hold state |
| New page or route | `app/` | Server Component by default |
| API endpoint | `app/api/*/route.ts` | |
| Global state | `components/providers/` | Must be `'use client'` |
| Utility function | `lib/` | |

### Atoms vs molecules

An atom has a single responsibility and depends on no other custom component
(shadcn/ui components are fine). A molecule composes atoms or ui components and
may carry hooks and state. If a component reaches for `useState` or an event
handler, it is a molecule, not an atom.

### Server vs client components

Components under `app/` are Server Components by default. Add `'use client'`
only when the component needs hooks, event handlers, or browser APIs. Pushing
it to the leaves keeps the server-rendered tree large. Providers are always
client components.

## shadcn/ui Conventions

Components in `components/ui/` are generated but then **owned by this repo**.
Edit them directly rather than wrapping them to work around a style. They use
Radix primitives and `class-variance-authority` for variants.

Currently installed: `Button`, `Card` (with `CardHeader`/`CardTitle`/
`CardDescription`/`CardContent`), `Badge`, `Switch`.

Browse the catalogue at <https://ui.shadcn.com/docs/components>. Repo-specific
shadcn rules live in `.agents/skills/shadcn/`.

### `cn()`

`cn()` from `@/lib/utils` merges Tailwind classes and resolves conflicts (later
wins). Use it whenever classes are conditional or a `className` prop is merged
into defaults. Plain template strings leave both conflicting classes in place.

```tsx
cn('base-class', isActive && 'active-class')
cn(defaultClasses, className)
```

### `asChild`

Radix-backed components accept `asChild` to render as a different element while
keeping their styling. This is how to get a link that looks like a button
without nesting interactive elements.

```tsx
<Button asChild>
  <Link href="/about">About</Link>
</Button>
```

## Conventions

**Dark mode** uses the `class` strategy, so pair colours with a `dark:` variant
(`bg-white dark:bg-gray-900`). A colour set without one breaks in dark theme.

**Environment variables** are read through `@/lib/env`, never `process.env`:

```tsx
import { env } from '@/lib/env';
const apiUrl = env.NEXT_PUBLIC_API_URL;
```

**File naming.** Components are `kebab-case.tsx`. The files `page.tsx`,
`layout.tsx`, and `route.ts` follow Next.js conventions. Tests are
`*.test.tsx` or `*.test.ts`.

**Imports** always use the `@/` alias rather than relative parent paths.

```tsx
import { Button } from '@/components/ui/button';  // not ../../../components/ui/button
```

**Tests** sit next to the file under test (`external-link.tsx` →
`external-link.test.tsx`). Note the mock-hoisting caveat in the root
`AGENTS.md`: bun does not hoist `vi.mock`, so mocked modules must be imported
dynamically after the mock call.
