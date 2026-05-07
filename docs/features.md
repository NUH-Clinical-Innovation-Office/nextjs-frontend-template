# Feature Inventory

This document provides an inventory of all features available in this Next.js 16 frontend template.

## Core Framework

| Feature | Status | Description |
|---------|--------|-------------|
| Next.js 16 with App Router | stable | Next.js 16.2.2 with App Router, Turbopack bundler enabled by default (`next dev --turbopack`) |
| React 19 | stable | React 19.2.4 with automatic JSX runtime |
| TypeScript with strict mode | stable | TypeScript 6 with strict type checking enabled (`strict: true`, `noImplicitAny`, `strictNullChecks`, etc.) |
| Tailwind CSS 4 | stable | Tailwind CSS 4.2.2 with PostCSS integration |
| PostCSS | stable | Configured via `postcss.config.mjs` for Tailwind CSS processing |

## UI Components

| Feature | Status | Description |
|---------|--------|-------------|
| shadcn/ui components | stable | Pre-built components installed via `npx shadcn@latest add <component>`. Located in `src/components/ui/` |
| Radix UI primitives | stable | Low-level UI primitives (`@radix-ui/react-switch`, `@radix-ui/react-slot`) used by shadcn/ui |
| Lucide React icons | stable | Icon library with optimized imports via `experimental.optimizePackageImports` |
| next-themes | stable | Dark mode support via `next-themes` with `class` strategy |
| Sonner toasts | stable | Toast notifications via `sonner` package |

## Architecture

| Feature | Status | Description |
|---------|--------|-------------|
| Atomic design structure | stable | Components organized as atoms, molecules, providers, and ui directories under `src/components/` |
| Server Components | stable | Next.js App Router Server Components by default; client components use `'use client'` directive |
| Path aliases | stable | `@/*` alias mapped to `src/` directory in both `tsconfig.json` and `vitest.config.ts` |

## Code Quality

| Feature | Status | Description |
|---------|--------|-------------|
| Biome | stable | Linting and formatting via `@biomejs/biome` 2.4.10 (`npm run lint`, `npm run format`) |
| Vitest | stable | Unit testing framework 4.1.2 with jsdom environment and React Testing Library |
| Husky | stable | Git hooks via Husky 9.1.7; pre-commit runs lint, commit-msg validates conventional commits |
| Commitlint | stable | Conventional commit validation via `@commitlint/config-conventional` |
| Knip | stable | Dependency management and unused code detection via `knip` 6.3.0 |

## Environment & Configuration

| Feature | Status | Description |
|---------|--------|-------------|
| Zod validation | stable | Runtime environment variable validation via `zod` 4.3.6 in `src/lib/env.ts` |
| Environment types | stable | Type-safe environment variables with TypeScript autocomplete via Zod inference |

## Security

| Feature | Status | Description |
|---------|--------|-------------|
| Security headers | stable | X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP in `next.config.ts` |
| Trivy scanning | stable | Security scanning via Trivy for dependencies, Dockerfile, and Helm charts (`npm run security-scan`) |
| Trivy ignore | stable | Vulnerability exceptions configured in `.trivyignore` |

## Deployment & Infrastructure

| Feature | Status | Description |
|---------|--------|-------------|
| Docker | stable | Multi-stage Dockerfile with standalone output for optimized images |
| Docker Compose | stable | Local containerized development via `docker-compose.yml` |
| Kubernetes/Helm | stable | Helm charts in `helm/nextjs-app/` with environment-specific values files (production, staging, feature) |
| GitHub Actions CI/CD | stable | Workflows for CI, staging deploy, production deploy, feature deploy, feature cleanup, image cleanup, rollback |
| Reusable workflows | stable | Shared workflows for build (`reusable-build.yml`), Docker (`reusable-docker.yml`), security scan (`reusable-security-scan.yml`) |
| HashiCorp Vault | experimental | Integration documented in `docs/vault-setup-and-deployment.md`; requires additional setup |
| Cloudflare Tunnel | experimental | Feature branch preview URLs documented in `docs/cloudflare-github-setup.md`; requires additional setup |
| Feature branch deployments | experimental | Automatic preview deployments for feature branches; requires Cloudflare and Kubernetes infrastructure |

## GitHub Actions Workflows

| Workflow | Status | Description |
|----------|--------|-------------|
| CI | stable | Runs on all PRs: build, lint, type-check, test |
| Staging deploy | stable | Auto-deploys to staging on merge to `main` |
| Production deploy | stable | Production deployment with approval requirement |
| Feature deploy | stable | Auto-deploys feature branches to preview URLs |
| Feature cleanup | stable | Auto-cleans resources when feature branches are deleted |
| Image cleanup | stable | Periodic cleanup of old Docker images |
| Staging rollback | stable | Rollback staging deployment |
| Production rollback | stable | Rollback production deployment |
