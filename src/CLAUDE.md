# src/ Directory Guide

This guide helps Claude Code understand the folder structure and component architecture for implementing features in this Next.js application.

## Directory Structure

```
src/
├── app/                    # Next.js App Router (pages and layouts)
│   ├── api/               # API routes (server-side endpoints)
│   │   └── example/       # Example API endpoint
│   ├── layout.tsx         # Root layout (applies to all pages)
│   └── page.tsx           # Home page
│
├── components/            # React components (Atomic Design pattern)
│   ├── atoms/            # Basic, indivisible UI elements
│   ├── molecules/        # Composite components made from atoms
│   ├── providers/        # React Context providers
│   └── ui/               # shadcn/ui components (pre-built, customizable)
│
└── lib/                   # Utility functions and configurations
    ├── env.ts            # Environment variable validation (Zod schemas)
    └── utils.ts          # Utility functions (cn helper)
```

## Component Architecture (Atomic Design)

### 1. Atoms (`src/components/atoms/`)

**Purpose**: Smallest, reusable UI building blocks that cannot be broken down further.

**Characteristics**:

- Single responsibility
- No dependencies on other custom components (may use shadcn/ui components)
- Highly reusable across the application

**Example**: `ExternalLink` component

```tsx
// src/components/atoms/external-link.tsx
import Link from 'next/link';

export function ExternalLink({ href, children, className, ...props }) {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" className={className} {...props}>
      {children}
    </Link>
  );
}
```

**When to create atoms**:

- Wrapping native HTML elements with consistent styling/behavior
- Creating specialized versions of shadcn/ui components
- Building small, reusable UI primitives

### 2. Molecules (`src/components/molecules/`)

**Purpose**: Combinations of atoms and/or shadcn/ui components that form functional units.

**Characteristics**:

- Composed of multiple atoms or ui components
- Serve a specific, single purpose
- May contain simple logic (hooks, state)
- More complex than atoms but still reusable

**Example**: `ModeToggle` component

```tsx
// src/components/molecules/mode-toggle.tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**When to create molecules**:

- Combining multiple UI elements with interactive behavior
- Creating reusable feature components (search bars, cards with actions, etc.)
- Building components that use hooks or client-side logic

### 3. Providers (`src/components/providers/`)

**Purpose**: React Context providers for global state management and configuration.

**Characteristics**:

- Must be client components (`'use client'`)
- Wrap app or page layouts to provide context
- Handle theme, auth, or other app-wide state

**Example**: `ThemeProvider`

```tsx
// Used in layout.tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

**When to create providers**:

- Adding global state (user auth, feature flags)
- Integrating third-party providers (analytics, error tracking)
- Creating app-wide configurations

### 4. UI Components (`src/components/ui/`)

**Purpose**: Pre-built components from shadcn/ui, customized for this project.

**Characteristics**:

- Installed via `npx shadcn@latest add <component>`
- Based on Radix UI primitives
- Fully customizable (you own the code)
- Styled with Tailwind CSS using `class-variance-authority` (CVA)

**Available components**:

- `Button`: Various variants (default, destructive, outline, secondary, ghost, link) and sizes
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`: Content containers
- `Badge`: Labels and tags
- `DropdownMenu`: Menus with triggers and items

**Example usage**:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <Button variant="outline" size="lg">Click me</Button>
  </CardContent>
</Card>
```

## shadcn/ui Components: Key Concepts

### Class Variance Authority (CVA)

shadcn/ui components use CVA for variant-based styling:

```tsx
const buttonVariants = cva(
  "base-classes", // Applied to all variants
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border bg-background",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

**Usage**:

```tsx
<Button variant="outline" size="sm">Small Outline Button</Button>
```

### The `cn()` Utility

Located in `src/lib/utils.ts`, `cn()` merges Tailwind classes intelligently:

```tsx
import { cn } from '@/lib/utils';

// Later classes override earlier ones
<Button className={cn("bg-blue-500", "bg-red-500")}>
  {/* Renders with bg-red-500 */}
</Button>
```

**Use `cn()` when**:

- Conditionally applying classes: `cn("base-class", isActive && "active-class")`
- Merging default and custom classes: `cn(defaultClasses, className)`
- Preventing Tailwind class conflicts

### The `asChild` Pattern

Many shadcn/ui components support `asChild` (via Radix UI's `Slot`):

```tsx
// Renders as a Link, not a button element, but with Button styles
<Button asChild>
  <Link href="/about">About</Link>
</Button>
```

**Benefits**:

- Preserves component styling while changing the underlying element
- Useful for navigation (Button as Link) or semantic HTML

## Tailwind CSS Guidelines

### Responsive Design

Use Tailwind's responsive prefixes:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {/* 1 column mobile, 2 tablet, 3 desktop */}
</div>
```

### Dark Mode

This project uses `class` strategy for dark mode:

```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  {/* Automatically switches based on theme */}
</div>
```

### Spacing & Layout

```tsx
<div className="p-4 sm:p-8">           {/* Padding */}
  <div className="space-y-4">          {/* Vertical spacing between children */}
    <div className="flex gap-2">        {/* Horizontal spacing in flexbox */}
      <Button>One</Button>
      <Button>Two</Button>
    </div>
  </div>
</div>
```

## Implementing New Features: Decision Tree

### 1. Is it a basic UI element?

→ **Create an atom** in `src/components/atoms/`

- Examples: custom links, icons, badges, specialized inputs

### 2. Does it combine multiple UI elements with logic?

→ **Create a molecule** in `src/components/molecules/`

- Examples: navigation bars, search components, form groups

### 3. Is it a page or major route?

→ **Create in `src/app/`**

- Use Server Components by default (faster, better SEO)
- Add `'use client'` only when needed (hooks, events, browser APIs)

### 4. Is it an API endpoint?

→ **Create in `src/app/api/`**

- Example: `src/app/api/users/route.ts`

### 5. Do you need a pre-built component?

→ **Search shadcn/ui components** and install:

```bash
npx shadcn@latest add [component-name]
```

- Browse available components: <https://ui.shadcn.com/docs/components>

## Common Patterns

### Server Component (Default)

```tsx
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await fetchData(); // Can directly fetch data

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Use client components for interactive parts */}
      <InteractiveWidget data={data} />
    </div>
  );
}
```

### Client Component

```tsx
// src/components/molecules/interactive-widget.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function InteractiveWidget({ data }) {
  const [count, setCount] = useState(0);

  return (
    <Button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </Button>
  );
}
```

### API Route

```tsx
// src/app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello World' });
}
```

### Using Environment Variables

```tsx
import { env } from '@/lib/env';

// Type-safe, validated at runtime
const apiUrl = env.NEXT_PUBLIC_API_URL;
```

## File Naming Conventions

- **Components**: `kebab-case.tsx` (e.g., `mode-toggle.tsx`)
- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx` (Next.js convention)
- **API routes**: `route.ts` (Next.js convention)
- **Tests**: `*.test.tsx` or `*.test.ts`

## Import Paths

Always use the `@/` alias for imports:

```tsx
// ✅ Correct
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ❌ Avoid
import { Button } from '../../../components/ui/button';
```

## Quick Reference: When to Use What

| Need | Use | Location |
|------|-----|----------|
| Pre-built UI component | shadcn/ui | `src/components/ui/` |
| Simple reusable element | Atom | `src/components/atoms/` |
| Interactive feature | Molecule | `src/components/molecules/` |
| New page | App Router | `src/app/page.tsx` |
| API endpoint | API Route | `src/app/api/*/route.ts` |
| Global state | Provider | `src/components/providers/` |
| Utility function | Lib | `src/lib/` |
| Environment config | env.ts | `src/lib/env.ts` |

## Testing

Place tests next to the file being tested:

```
src/
├── components/
│   ├── atoms/
│   │   ├── external-link.tsx
│   │   └── external-link.test.tsx  ← Test file
```

Run tests:

```bash
npm run test              # Run once
npm run test:watch        # Watch mode
npm run test:ui           # Interactive UI
```
