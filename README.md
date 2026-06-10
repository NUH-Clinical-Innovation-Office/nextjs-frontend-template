# Next.js Frontend Template

A production-ready [Next.js](https://nextjs.org) template with TypeScript, Tailwind CSS, and comprehensive tooling for modern web application development.

## Table of Contents

- [Project Description](#project-description)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Project Architecture](#project-architecture)
- [Project Structure](#project-structure)
- [Commands](#commands)
- [Features](#features)
  - [Core Framework](#core-framework)
  - [UI Components](#ui-components)
  - [Developer Experience](#developer-experience)
  - [Testing](#testing)
  - [Security](#security)
  - [CI/CD & Deployment](#cicd--deployment)
- [Security Headers](#security-headers)
- [Deployment](#deployment)
  - [Docker](#docker)
  - [CI/CD](#cicd)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Project Description

This is a Next.js 16 frontend template designed for teams building production web applications with Kubernetes deployment. It provides a complete starting point with type-safe environment variables, atomic design components, comprehensive CI/CD pipelines, and infrastructure-as-code for staging, production, and ephemeral feature branch environments.

Key differentiators:

- **Full CI/CD out of the box**: Automated builds, security scanning, and deployments to Kubernetes via GitHub Actions
- **Feature branch previews**: Every branch gets its own preview environment with automatic cleanup
- **Production-grade security**: Non-root containers, security headers, Trivy scanning, Vault secrets injection
- **Atomic design component library**: Pre-configured shadcn/ui components wrapped in atoms and molecules

## Prerequisites

- **Node.js** >= 24.15.0
- **npm** (or yarn, pnpm, bun)
- **Trivy** (optional, for security scanning) — [Installation Guide](https://aquasecurity.github.io/trivy/latest/getting-started/installation/)
- **Docker** (optional, for containerized builds)
- **kubectl** and **Helm** (optional, for Kubernetes deployment)

Follow the full setup guide at [NUH Clinical Innovation Office Setup](https://github.com/NUH-Clinical-Innovation-Office/setup) to install Node.js and configure your environment.

## Installation

### Quick Setup (Recommended for New Projects)

Use the automated setup script to configure your project:

```bash
chmod +x setup.sh
./setup.sh
```

The setup script will:

- Prompt for your project name (defaults to current directory name)
- Configure staging and production NodePort values (30000-32767 range)
- Update all configuration files with your project name
- Update port configurations in Helm values files
- Display a configuration summary before making changes

**What gets updated:**

- `package.json` — Project name
- `Dockerfile` — GitHub repository URL
- `helm/nextjs-app/values*.yaml` — Project name and ports
- `README.md` — Project name references
- `docs/**/*.md` — Documentation files
- `docs/scripts/setup-vault-environments.sh` — Vault setup script

**Requirements:**

- Project name must contain only lowercase letters, numbers, and hyphens
- Staging and production ports must be different
- Ports must be in the NodePort range (30000-32767)

After running the setup script, review the changes before committing.

### Manual Setup

If you prefer manual configuration:

1. Install dependencies (this also sets up Husky git hooks via the `prepare` script):

```bash
bun install
```

2. Configure environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration. See the [Configuration](#configuration) section for details.

## Configuration

Environment variables are validated at runtime using Zod schemas in `src/lib/env.ts`. Access them via `import { env } from '@/lib/env'`.

### Client Variables (browser-safe, `NEXT_PUBLIC_` prefix)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | `string` | `http://localhost:3000` | Base URL of the application |
| `NEXT_PUBLIC_API_URL` | `string` | `http://localhost:3000/api` | Public API endpoint |

### Server Variables (not exposed to browser)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | `enum: development \| test \| production` | `development` | Runtime environment |
| `API_URL` | `string` (optional) | — | Server-side API endpoint |
| `API_SECRET` | `string` (optional, min 32 chars) | — | Server-side API authentication key |
| `API_TIMEOUT` | `string` → `number` (positive) | `10000` | API request timeout in milliseconds |

Additional variables (database, authentication, analytics, email, AWS S3) are available as commented templates in `src/lib/env.ts` and `.env.example` — uncomment and configure as needed.

### Runtime Helpers

The `env.ts` module also exports:

- `isProduction` — `true` when `NODE_ENV === 'production'`
- `isDevelopment` — `true` when `NODE_ENV === 'development'`
- `isTest` — `true` when `NODE_ENV === 'test'`

## Project Architecture

This template follows a layered architecture:

```
Browser Request
    │
    ▼
Next.js App Router (src/app/)
    │   Server Components by default
    │   Client Components for interactivity ('use client')
    │
    ├─── UI Layer (src/components/)
    │     ├── atoms/     — Wrapped shadcn/ui primitives with cursor styling
    │     ├── molecules/ — Composite components (Header, Footer, ModeToggle, showcases)
    │     ├── providers/ — React Context providers (ThemeProvider)
    │     └── ui/        — shadcn/ui base components (34 components, new-york style)
    │
    ├─── Logic Layer (src/lib/)
    │     ├── env.ts     — Zod-validated environment variables
    │     ├── atom.tsx   — createAtom() factory for wrapping UI components
    │     └── utils.ts   — cn() Tailwind class merge utility
    │
    └─── Infrastructure (outside src/)
          ├── .github/workflows/ — 11 CI/CD workflows
          ├── helm/nextjs-app/   — Kubernetes Helm chart
          ├── Dockerfile         — Multi-stage Docker build
          └── docs/              — Deployment & infrastructure docs
```

**Key design decisions:**

- **Atomic Design**: Components follow atoms → molecules → pages composition. The `createAtom()` factory wraps shadcn/ui components with consistent cursor styling.
- **Server-first rendering**: Pages use React Server Components by default; client components only where interactivity is needed.
- **Standalone output**: Next.js configured with `output: 'standalone'` for optimal Docker container builds.
- **Security by default**: Comprehensive HTTP headers, non-root containers, read-only root filesystem, Trivy scanning, and Vault secret injection.

## Project Structure

```text
├── src/
│   ├── app/                 # Next.js App Router pages and layouts
│   │   ├── layout.tsx       # Root layout with fonts, ThemeProvider, env validation
│   │   ├── page.tsx         # Home page (showcase of all components)
│   │   ├── error.tsx        # Error boundary with retry/home buttons
│   │   ├── global-error.tsx # Global error handler (inline styles, no Tailwind)
│   │   ├── loading.tsx      # Loading spinner for route transitions
│   │   └── globals.css      # Tailwind CSS v4 with NUHS brand colors
│   ├── components/
│   │   ├── atoms/           # 10 wrapped UI elements (Button, Checkbox, Input, etc.)
│   │   ├── molecules/       # 10 composite components (Header, Footer, ModeToggle, showcases)
│   │   ├── providers/       # Context providers (ThemeProvider)
│   │   └── ui/              # 34 shadcn/ui base components (new-york style)
│   └── lib/
│       ├── atom.tsx         # createAtom() factory for consistent cursor styling
│       ├── env.ts           # Zod-validated environment variables
│       └── utils.ts         # cn() Tailwind merge utility
├── docs/                    # Deployment and infrastructure documentation
├── helm/nextjs-app/         # Helm chart with multi-environment values
├── .github/workflows/       # 11 CI/CD workflows
├── public/                  # Static assets (NUH logos, SVGs)
├── Dockerfile               # Multi-stage Docker build (standalone output)
├── docker-compose.yml       # Local containerized development
├── setup.sh                 # Project setup script
└── vitest.config.ts         # Test configuration with coverage thresholds
```

## Commands

### Development

```bash
bun run dev              # Start development server with Turbopack
bun run build            # Build production bundle with Turbopack
bun start                # Start production server
```

### Testing

```bash
bun run test             # Run tests once with Vitest
bun run test:watch       # Run tests in watch mode
bun run test:ui          # Open Vitest UI for interactive testing
bun run test:coverage    # Generate coverage report (60% threshold)
```

### Code Quality

```bash
bun run lint             # Check code with Biome
bun run format           # Format code with Biome
bun run type-check       # Run TypeScript type checking
bun run knip             # Check for unused dependencies and code
bun run check:all        # Run lint + type-check + knip (used by pre-commit hook)
bun run analyze          # Analyze bundle size with @next/bundle-analyzer
```

### Security Scanning

```bash
bun run security-scan          # Run Trivy scans on dependencies, Dockerfile, and Helm charts
bun run security-scan:image    # Build and scan Docker image for vulnerabilities
```

### Husky Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality through git hooks:

#### Pre-commit Hook

- Runs `bun run check:all` (lint + type-check + knip) before each commit
- Ensures code passes all quality checks before allowing commits

#### Commit Message Hook

- Validates commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) format
- Enforced via [commitlint](https://commitlint.js.org/)
- Valid commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Example valid commit messages:**

```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve navigation bug"
git commit -m "docs: update readme with setup instructions"
```

## Features

### Core Framework

- **Next.js 16** with App Router and Turbopack
- **React 19** with latest features
- **TypeScript 6** in strict mode with additional checks (`noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`)
- **Tailwind CSS 4** for styling with PostCSS
- **Zod 4** for runtime environment variable validation

### UI Components

- **shadcn/ui** — 34 components in new-york style (Accordion, AlertDialog, Alert, Avatar, Badge, Button, Calendar, Card, Checkbox, Collapsible, Dialog, Drawer, DropdownMenu, Input, Label, NavigationMenu, Pagination, Popover, Progress, RadioGroup, Select, Separator, Sheet, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toggle, ToggleGroup, Tooltip)
- **Atoms** — 10 wrapped components with consistent cursor styling via `createAtom()` factory (Button, Checkbox, ExternalLink, Input, Label, RadioGroup, SectionLabel, Slider, Switch, Textarea)
- **Molecules** — 10 composite components (Header, Footer, ModeToggle, and 7 showcase sections)
- **Radix UI** primitives for accessible components
- **Lucide React** icons
- **next-themes** for dark mode support with animated pill-style toggle (Framer Motion)
- **Sonner** for toast notifications
- **NUHS brand colors** — Dark Blue (#002f6c), Light Blue (#178fd7), Orange (#e57200), Red (#e4002b)

### Developer Experience

- **Biome** for fast linting and formatting (replaces ESLint + Prettier)
- **Vitest 4** for unit testing with React Testing Library
- **Husky** for git hooks with pre-commit quality gates
- **Commitlint** for conventional commit messages
- **Knip** for unused dependency and code detection
- **@next/bundle-analyzer** for bundle size inspection
- **Claude Code** integration with CLAUDE.md for AI-assisted development

### Testing

- Unit testing with Vitest 4 and React Testing Library
- jsdom environment with global mocks (ResizeObserver, matchMedia)
- Coverage thresholds: 60% for lines, functions, branches, and statements
- UI mode for interactive testing
- Watch mode for development
- 9 test files with 102 test cases

### Security

- Per-request nonce-based CSP generated in `src/proxy.ts` (no `unsafe-inline` / `unsafe-eval` for scripts and styles)
- Comprehensive security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy, etc.) attached by the proxy on every request
- Runtime env resolution: the proxy reads `process.env.API_URL` so Kubernetes-injected values flow into the CSP without rebuilding the image
- Environment variable validation with Zod at startup
- HTTPS-only image loading and upgrade-insecure-requests
- **Trivy** security scanner for vulnerability detection in dependencies, containers, and IaC
- Non-root containers (UID 1001), read-only root filesystem, dropped capabilities
- Vault Agent Injector for runtime secret injection (no secrets in manifests)

### CI/CD & Deployment

- **GitHub Actions workflows** for CI, staging, production, and feature branches
- **Reusable workflows** (build, Docker, security scan) to reduce duplication
- **Feature branch deployments** with automatic preview environments and cleanup
- **Rollback workflows** for both staging and production
- **GitHub Environments** for staging and production — production requires manual approval before deploy
- **Image cleanup** — weekly scheduled removal of old container images from GHCR
- **Docker** support with multi-arch builds (amd64/arm64) and Docker Compose
- **Kubernetes** service account configuration for GitHub Actions
- **HashiCorp Vault** integration for secure secrets management
- **Cloudflare Tunnel** integration for secure external access

## Security Headers

Configured in `src/proxy.ts` to protect against common web vulnerabilities. The proxy runs on every request and builds a fresh CSP, allowing runtime values (e.g. `API_URL` injected by Kubernetes) to be picked up without rebuilding the image.

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Prevents clickjacking via iframe embedding |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-sniffing attacks |
| `Referrer-Policy` | `origin-when-cross-origin` | Controls referrer information leakage |
| `X-DNS-Prefetch-Control` | `on` | Enables DNS prefetching for performance |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Enforces HTTPS (1 year, HSTS preload) |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | Blocks sensitive browser APIs |
| `X-Permitted-Cross-Domain-Policies` | `none` | Prevents Flash/PDF cross-domain content loading |
| `Content-Security-Policy` | Multi-directive policy with per-request nonce | Controls resource loading (see below) |
| `x-nonce` | Per-request base64 nonce | Echoes the nonce used in the CSP for use by `<Script nonce={…} />` |

**Content Security Policy directives (built in `src/lib/csp.ts`):**

- `default-src 'self'` — Only load resources from your domain
- `script-src 'self' 'nonce-{nonce}'` — Allows only same-origin scripts carrying the per-request nonce
- `style-src 'self' 'nonce-{nonce}'` — Allows only same-origin styles carrying the per-request nonce
- `img-src 'self' data: https:` — Images from your domain, data URIs, or HTTPS sources
- `font-src 'self' data:` — Fonts from your domain or data URIs
- `connect-src 'self' [{API_URL}]` — API calls to your domain; the runtime `API_URL` is appended when set
- `object-src 'none'` — Prevents plugin content
- `base-uri 'self'` — Prevents base tag injection
- `form-action 'self'` — Prevents form hijacking
- `frame-ancestors 'none'` — Additional clickjacking protection
- `upgrade-insecure-requests` — Automatically upgrades HTTP to HTTPS

The nonce is generated by the proxy and read by the root layout via the `x-nonce` request header, so any future `<Script nonce={…} />` in a Server Component will be permitted by the CSP without falling back to `unsafe-inline` or `unsafe-eval`.


## Deployment

### Docker

Build and run the Docker image:

```bash
docker build -t nextjs-app .
docker run -p 3000:3000 nextjs-app
```

Docker Compose is also available:

```bash
docker-compose up
```

The Docker image uses a multi-stage build:

- **Builder stage**: Installs dependencies, builds the Next.js standalone output
- **Runner stage**: Copies standalone output, runs as non-root user (`nextjs:nodejs`, UID/GID 1001)

### CI/CD

This template includes GitHub Actions workflows for:

- **CI Pipeline** (`ci.yml`) — Runs on push to `main`: build, test, security scan, Docker build, staging deploy, and production deploy
- **Staging deployment** (`staging-deploy.yml`) — Deployed automatically as part of the CI pipeline on main pushes
- **Production deployment** (`production-deploy.yml`) — Triggered as part of the CI pipeline on main pushes; gated by the `production` GitHub Environment and requires manual approval before it can run
- **Production rollback** (`production-rollback.yml`) — Manual rollback to previous production deployment
- **Staging rollback** (`staging-rollback.yml`) — Manual rollback to previous staging deployment
- **Feature branch deployment** (`feature-deploy.yml`) — Automatic preview deployments for non-main branches
- **Feature cleanup** (`feature-cleanup.yml`) — Auto-cleanup when feature branches are deleted
- **Image cleanup** (`image-cleanup.yml`) — Weekly cleanup of old container images (Sundays 2 AM UTC)

#### Reusable Workflows

The template uses reusable workflows to reduce code duplication:

- **`reusable-build.yml`** — Shared build, lint, test, knip, and Trivy security scanning
- **`reusable-docker.yml`** — Multi-platform Docker build and push to GHCR with caching
- **`reusable-security-scan.yml`** — Docker image security scanning (CRITICAL + HIGH severity)

#### Container Image Cleanup

The `image-cleanup.yml` workflow automatically manages GHCR storage:

- **Production images** (`main-*` tags): Keeps latest 3 versions
- **Feature branch images**: Keeps images from the last 7 days
- **`latest` tag**: Always protected, never deleted
- **Untagged images**: Always deleted immediately

#### Feature Branch Deployments

Each feature branch gets automatic preview deployment:

- Preview URL format: `https://{branch-name}-dev-{repo-name}.{domain}`
- Deploys to separate Kubernetes namespace: `nextjs-{branch-name}`
- Each deployment gets unique NodePort allocation (31000-32000 range)
- Cloudflare Tunnel routes and DNS records are automatically created/updated
- Cleanup automatically triggered when feature branch is deleted

#### Kubernetes & Helm

Helm charts located in `helm/nextjs-app/` with environment-specific values:

- `values.yaml` — Base configuration (2 replicas, 500m CPU, 512Mi memory)
- `values-feature.yaml` — Feature branch overrides (1 replica, 250m CPU, 256Mi memory)
- `values-staging.yaml` — Staging environment (1 replica, NodePort 30002)
- `values-production.yaml` — Production environment (1-5 replicas with HPA, NodePort 30001)

**Helm resources:** Deployment, Service (NodePort), ServiceAccount, HPA (disabled by default), Ingress (disabled by default), PodDisruptionBudget (production only)

**Security context:**

- Non-root user (UID 1001) with `runAsNonRoot: true`
- Read-only root filesystem with `readOnlyRootFilesystem: true`
- Dropped all capabilities with `capabilities.drop: [ALL]`
- No privilege escalation with `allowPrivilegeEscalation: false`

**Cost allocation labels** included in all environment configurations for cloud cost segregation:

```yaml
commonLabels:
  team: "frontend-team"
  project: "nextjs-frontend-template"
  cost-center: "engineering"
  environment: "production|staging|development"
```

## Documentation

- [Features Inventory](docs/features.md) — Complete feature inventory with status
- [Backend Integration](docs/backend-integration.md) — Backend API consumption reference
- [Kubernetes Setup Guide](docs/kubernetes-setup.md) — Overview of Kubernetes cluster setup options
- [Kubernetes on Raspberry Pi](docs/kubernetes-setup-raspberry-pi.md) — Self-hosted K3s cluster setup
- [Kubernetes on AWS with Terraform](docs/kubernetes-setup-aws.md) — Production-ready EKS cluster using Terraform
- [Helm & Kubernetes Guide](docs/helm-kubernetes-setup.md) — Helm package manager and chart deployment
- [Vault Secrets Management](docs/vault-setup-and-deployment.md) — HashiCorp Vault integration
- [Cloudflare & GitHub Integration](docs/cloudflare-github-setup.md) — Cloudflare Tunnel setup and GitHub Actions integration

## Contributing

This project uses the following conventions:

- **Commit messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/) format (enforced by commitlint)
- **Code style**: Biome for linting and formatting (2-space indent, 100 char line width, single quotes)
- **Component architecture**: Atomic Design pattern (atoms → molecules → pages)
- **File naming**: kebab-case for component files (e.g., `mode-toggle.tsx`)
- **Import paths**: Always use `@/` alias (e.g., `import { Button } from '@/components/ui/button'`)
- **Type safety**: TypeScript strict mode with no unused locals/parameters
- **Testing**: Colocate tests next to components (e.g., `button.test.tsx` next to `button.tsx`)

## License

Copyright 2025 NUH Department of Medicine

This project is licensed under the [Apache 2.0 License](LICENSE).

### What This Means For You

You may use, reproduce, and distribute this software, with or without modifications, provided that you:

1. **Include the License**: Provide a copy of the [LICENSE](LICENSE) file with any distribution
2. **Include the NOTICE**: Provide a copy of the [NOTICE](NOTICE) file with any distribution
3. **State Changes**: Clearly indicate any modifications you make to the original work
4. **Retain Copyright Notices**: Keep all copyright, patent, trademark, and attribution notices from the original source
5. **Provide Attribution**: Credit the original authors when using or modifying this work

### Patent Grant

Apache 2.0 includes an express patent license grant, protecting you from patent claims by contributors related to their contributions.

### No Trademark Rights

This license does not grant permission to use NUH trade names, trademarks, or service marks, except as required for reasonable and customary use in describing the origin of the work.

### Disclaimer

This software is provided "AS IS", WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement.
