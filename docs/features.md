# Feature Inventory

## Core Framework

| Feature | Status | Description |
|---------|--------|-------------|
| Next.js 16 | stable | App Router framework with Turbopack bundler |
| React 19 | stable | Latest React with Server/Client Component support |
| TypeScript (strict mode) | stable | Full type safety with strict mode enabled |
| Turbopack | stable | Fast Rust-based bundler for dev/build |

## Styling & UI

| Feature | Status | Description |
|---------|--------|-------------|
| Tailwind CSS 4 | stable | Utility-first CSS with @tailwindcss/postcss |
| shadcn/ui components | stable | Button, Card, Badge based on Radix UI primitives |
| class-variance-authority | stable | Variant-based component styling |
| next-themes | stable | Dark mode with class-based strategy |
| framer-motion | stable | Animation library for motion effects |
| Geist fonts | stable | Next.js optimized font family (Sans + Mono) |

## Components (Atomic Design)

| Feature | Status | Description |
|---------|--------|-------------|
| Atoms: Button, ExternalLink | stable | Basic UI building blocks |
| Molecules: ModeToggle | stable | Dark/light theme switch with Radix Switch |
| Providers: ThemeProvider | stable | React Context for theme management |
| UI: Button, Card, Badge | stable | shadcn/ui customized components |
| clsx + tailwind-merge | stable | cn() utility for class merging |

## Testing

| Feature | Status | Description |
|---------|--------|-------------|
| Vitest | stable | Unit testing framework |
| React Testing Library | stable | Component testing utilities |
| jsdom environment | stable | DOM simulation for component tests |
| jest-dom matchers | stable | Extended assertions for testing |
| Coverage thresholds | stable | 60% line/function/branch/statement coverage enforced |

## Code Quality

| Feature | Status | Description |
|---------|--------|-------------|
| Biome | stable | Linting and formatting with strict a11y rules |
| Husky | stable | Pre-commit hooks via .husky |
| commitlint | stable | Conventional Commits validation |
| knip | stable | Unused dependency detection |
| Bundle analyzer | stable | @next/bundle-analyzer for bundle size analysis |

## Error Handling

| Feature | Status | Description |
|---------|--------|-------------|
| Error boundary (error.tsx) | stable | Per-route error recovery with reset capability |
| Global error (global-error.tsx) | stable | Root-level critical error handler |
| Loading states (loading.tsx) | stable | Route-level loading spinner |

## Security

| Feature | Status | Description |
|---------|--------|-------------|
| Security headers | stable | X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS |
| Trivy security scanning | stable | fs, docker image, and helm chart vulnerability scanning |
| Content Security Policy | experimental | CSP configured but permissive (unsafe-inline/eval allowed) |
| Non-root Docker user | stable | Runs as UID 1001 for container security |
| Environment variable validation | stable | Zod schema validation at startup |

## Environment & Configuration

| Feature | Status | Description |
|---------|--------|-------------|
| Zod env validation | stable | Runtime type-safe env vars with client/server split |
| Client env vars | stable | NEXT_PUBLIC_* vars exposed to browser |
| Server env vars | stable | Server-only vars for secrets |
| Path aliases | stable | @/* maps to src/ in TS and Vitest |

## Deployment & Infrastructure

| Feature | Status | Description |
|---------|--------|-------------|
| Docker (multi-stage) | stable | Multi-stage Dockerfile with standalone output |
| Docker Compose | stable | Local containerized development |
| Standalone output | stable | Next.js self-contained production build |
| Helm charts | stable | Kubernetes Deployment, Service, HPA, Ingress, ServiceAccount |
| HPA (Horizontal Pod Autoscaler) | stable | CPU/memory-based pod scaling |
| GitHub Actions CI | planned | CI pipeline workflow (build, lint, test, type-check) |
| Feature branch deployments | planned | Auto-deploy to preview URLs via Cloudflare Tunnel |
| Staging/production deploy | planned | GitHub Actions deployment workflows |
| Cloudflare Tunnel | planned | Branch preview routing and DNS (documentation exists) |
| Vault integration | planned | HashiCorp Vault integration (documentation exists) |

## Automation

| Feature | Status | Description |
|---------|--------|-------------|
| Renovate | stable | Automated dependency updates via .github/renovate.json |
| Feature branch cleanup | planned | Auto-cleanup workflow when branch deleted |
| Image cleanup | planned | Auto-cleanup old Docker images workflow |
| Staging rollback | planned | One-click staging environment rollback workflow |
| Production rollback | planned | One-click production environment rollback workflow |

## Documentation

| Feature | Status | Description |
|---------|--------|-------------|
| CLAUDE.md | stable | Project guidance for Claude Code |
| Kubernetes setup guides | stable | AWS EKS and Raspberry Pi K3s documentation |
| Helm setup guide | stable | Helm deployment documentation |
| Cloudflare setup | stable | Tunnel and DNS configuration guide |
| Vault guide | stable | HashiCorp Vault secrets management |

## Planned / Not Implemented

| Feature | Status | Description |
|---------|--------|-------------|
| API routes | planned | No API routes present in src/app/api/ |
| Database integration | planned | DATABASE_URL schema defined but commented out |
| Authentication | planned | NEXTAUTH_URL/NEXTAUTH_SECRET schemas defined but commented out |
| OAuth providers | planned | Google/GitHub OAuth schemas defined but commented out |
| Sentry error tracking | planned | SENTRY_DSN schema defined but commented out |
| Analytics integration | planned | GA/PostHog schemas defined but commented out |
| Email/SMTP service | planned | SMTP schemas defined but commented out |
| AWS S3 integration | planned | AWS_* schemas defined but commented out |
