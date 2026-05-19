# Features

Feature inventory for this Next.js frontend template. Codebase is the source of truth.

## Core Framework

| Feature | Status | Description |
|---------|--------|-------------|
| Next.js 16 with App Router | stable | Server and client components, file-based routing via App Router |
| Turbopack | stable | Fast bundler for both dev and production builds |
| React 19 | stable | Latest React with improved concurrent features |
| TypeScript 6 strict mode | stable | Full type safety with strict compiler options |
| Tailwind CSS 4 with PostCSS | stable | Utility-first CSS with oklch color support |
| Zod 4 environment validation | stable | Runtime validation and type-safe access to env variables |

## UI Components

| Feature | Status | Description |
|---------|--------|-------------|
| 33 shadcn/ui components (new-york style) | stable | Pre-built accessible UI primitives in src/components/ui/ |
| 10 atom components | stable | Cursor-styled wrappers around shadcn/ui in src/components/atoms/ |
| 10 molecule components | stable | Composed components including Header, Footer, ModeToggle, showcases |
| ThemeProvider with next-themes | stable | Light/dark/system theme switching via React context |
| NUHS brand colors via oklch | stable | Custom color palette defined as CSS variables in globals.css |
| Dark mode with animated pill toggle | stable | Framer Motion animated toggle in mode-toggle.tsx |
| Toast notifications via Sonner | stable | Toast system integrated in page.tsx |
| createAtom() component factory | stable | Factory function for generating styled atom components |

## Developer Experience

| Feature | Status | Description |
|---------|--------|-------------|
| Biome linting and formatting | stable | Fast unified linter and formatter via biome.json |
| Vitest 4 with React Testing Library | stable | Component and unit testing with jsdom environment |
| Husky pre-commit hooks | stable | Runs check:all before each commit |
| Commitlint for conventional commits | stable | Validates commit message format (feat, fix, docs, etc.) |
| Knip for unused code detection | stable | Finds unused dependencies, exports, and files |
| Bundle analyzer | stable | Visualize bundle size via @next/bundle-analyzer |
| Claude Code integration | stable | CLAUDE.md with project context and commands |

## Testing

| Feature | Status | Description |
|---------|--------|-------------|
| 7 test files with ~75 test cases | stable | Comprehensive test coverage across src/ |
| Coverage thresholds at 60% | stable | Minimum coverage enforced in vitest.config.ts |
| jsdom environment with global mocks | stable | Browser API mocks configured in vitest.setup.ts |

## Security

| Feature | Status | Description |
|---------|--------|-------------|
| HTTP security headers | stable | X-Frame-Options, CSP, Permissions-Policy in next.config.ts |
| Trivy security scanning | stable | Scans deps, Dockerfile, and Helm charts in CI |
| Non-root Docker containers | stable | Runs as UID 1001 in Dockerfile and Helm values |
| Read-only root filesystem | stable | K8s security context enforces read-only root |
| Vault Agent Injector for secrets | stable | HashiCorp Vault annotations in Helm values |
| Zod runtime env validation | stable | Type-safe environment variable parsing |
| Image tag validation in Helm | stable | Prevents deployment of untagged images via _helpers.tpl |

## CI/CD

| Feature | Status | Description |
|---------|--------|-------------|
| 11 GitHub Actions workflows | stable | CI, deploys, rollbacks, cleanup, and reusable workflows |
| Feature branch deployments | stable | Preview URLs for each feature branch |
| Feature branch cleanup | stable | Automatic teardown when branches are deleted |
| Staging deployment | stable | Auto-deploy to staging on merge to main |
| Production deployment | stable | Manual-approval production deploys |
| Staging rollback | stable | One-click rollback for staging environment |
| Production rollback | stable | One-click rollback for production environment |
| Container image cleanup | stable | Removes old images from GHCR |
| Multi-arch Docker builds | stable | Builds for linux/amd64 and linux/arm64 |
| GHCR container registry | stable | Images pushed to GitHub Container Registry |
| Cloudflare Tunnel integration | stable | Secure ingress via Cloudflare Tunnel in deploy workflows |

## Infrastructure

| Feature | Status | Description |
|---------|--------|-------------|
| Helm chart with multi-environment values | stable | Base, feature, staging, and production value files |
| PodDisruptionBudget | stable | Ensures minimum availability during disruptions in production |
| HPA autoscaling | stable | Horizontal pod autoscaling for production workloads |
| Cost allocation labels | stable | Kubernetes labels for cost tracking across all environments |
| Docker Compose for local dev | stable | Containerized local development environment |
| Health checks | stable | Liveness and readiness probes in Docker and Kubernetes |

## Project Setup

| Feature | Status | Description |
|---------|--------|-------------|
| Automated setup script | stable | setup.sh for initial project configuration |
