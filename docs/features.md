# Feature Inventory

This document provides a feature inventory for the Next.js frontend template.

## Feature Inventory Table

| Feature | Status | Description |
|---------|--------|-------------|
| **Framework** | | |
| Next.js | stable | Next.js 16.2.2 with App Router, Turbopack for dev/build, standalone output mode |
| React | stable | React 19.2.4 with automatic JSX runtime |
| TypeScript | stable | TypeScript 6 with strict mode (strict, noImplicitAny, strictNullChecks, etc.), Node 24.15.0 |
| Tailwind CSS | stable | Tailwind CSS 4.2.2 with CSS-based configuration, dark mode support via `class` strategy |
| **UI Components** | | |
| shadcn/ui | stable | Pre-built UI components (AlertDialog, Alert, Accordion, Calendar, Card, Checkbox, Collapsible, Badge, Avatar, Button, Pagination, Dialog, Label, DropdownMenu, Drawer, Input, Popover, NavigationMenu, Skeleton, Slider, Select, Separator, Sheet, Progress, Switch, Sonner, RadioGroup, ToggleGroup, Textarea, Tabs, Tooltip, Table, Toggle) installed via CLI |
| Radix UI | stable | Unstyled, accessible UI primitives via `@radix-ui/react-switch` and shadcn/ui integration |
| Lucide React | stable | Icon library (v1.7.0) with optimized imports via Turbopack |
| Dark Mode | stable | Theme switching via `next-themes` with `ThemeProvider`, supports system preference |
| **Developer Experience** | | |
| Biome | stable | Linter and formatter (v2.4.10) with Next.js and React domain rules, 100 char line width |
| Vitest | stable | Unit testing framework (v4.1.2) with jsdom environment and V8 coverage |
| Husky | stable | Git hooks (v9.1.7) with pre-commit and commit-msg hooks |
| commitlint | stable | Conventional commits validation (v20.5.0), supports feat/fix/docs/style/refactor/perf/test/build/ci/chore/revert |
| Knip | stable | Unused dependencies detection (v6.3.0) |
| Bundle Analyzer | stable | Webpack bundle analysis via `@next/bundle-analyzer` |
| Path Aliases | stable | `@/` resolves to `src/` configured in tsconfig.json and vitest.config.ts |
| **Security** | | |
| Security Headers | stable | X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS, Permissions-Policy, CSP via next.config.ts |
| Environment Validation | stable | Zod schema validation (v4.3.6) for type-safe env vars with client/server separation |
| Trivy Scanning | stable | Container and filesystem security scanning via `npm run security-scan` |
| **CI/CD** | | |
| GitHub Actions | stable | Workflows for CI (build/lint/test/type-check), staging/production deploy, feature branch deploy |
| Feature Deployments | stable | Auto-deploy feature branches to Cloudflare Tunnel preview URLs with unique NodePort (31000-32000) |
| Docker | stable | Multi-stage Dockerfile for standalone output, multi-platform builds (linux/amd64, linux/arm64), GHCR push |
| Kubernetes/Helm | stable | Helm charts with Deployment, Service (NodePort), ServiceAccount, HPA, Ingress; environment-specific values files |
| **Testing** | | | |
| Vitest | stable | Test runner (v4.1.2) with jsdom environment, globals, and CSS support |
| React Testing Library | stable | Component testing via `@testing-library/react` (v16.3.2) and `@testing-library/user-event` (v14.6.1) |
| Coverage | stable | V8 coverage provider with 60% thresholds for lines/functions/branches/statements |
| Test Utilities | stable | Jest DOM matchers, ResizeObserver mock, matchMedia mock for theme in vitest.setup.ts |
