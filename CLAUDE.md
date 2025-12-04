# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 frontend template with TypeScript, Tailwind CSS 4, and comprehensive CI/CD infrastructure. It's designed for production deployment to Kubernetes with automated feature branch previews via Cloudflare Tunnel.

## Essential Commands

### Development

```bash
npm install           # Install dependencies (automatically sets up Husky)
npm run dev          # Start dev server with Turbopack at http://localhost:3000
npm run build        # Build production bundle with Turbopack
npm start            # Start production server
```

### Testing

```bash
npm run test            # Run tests once with Vitest
npm run test:watch      # Run tests in watch mode
npm run test:ui         # Open Vitest UI for interactive testing
npm run test:coverage   # Generate coverage report
```

### Code Quality

```bash
npm run lint          # Check code with Biome
npm run format        # Format code with Biome
npm run type-check    # Run TypeScript type checking
npm run depcheck      # Check for unused dependencies
```

### Git Hooks (via Husky)

- **Pre-commit**: Runs `npm run lint` automatically
- **Commit-msg**: Validates commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) format
  - Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
  - Example: `feat: add user authentication` or `fix: resolve navigation bug`

## Architecture

### Component Structure (Atomic Design)

- **`src/components/atoms/`**: Basic UI elements (e.g., ExternalLink)
- **`src/components/molecules/`**: Composite components (e.g., ModeToggle)
- **`src/components/providers/`**: React context providers (e.g., ThemeProvider)
- **`src/components/ui/`**: shadcn/ui components (Button, Card, Badge, DropdownMenu)

### Environment Variables

- Validated at runtime using Zod schemas in `src/lib/env.ts`
- Client variables: prefixed with `NEXT_PUBLIC_` (exposed to browser)
- Server variables: no prefix (server-side only, for secrets)
- All environment variables are type-safe with TypeScript autocomplete
- Use `import { env } from '@/lib/env'` to access validated environment variables

### Path Aliases

- `@/` resolves to `src/` directory (configured in both `tsconfig.json` and `vitest.config.ts`)

## CI/CD Infrastructure

### GitHub Actions Workflows

- **`.github/workflows/ci.yml`**: Runs on all PRs (build, lint, test, type-check)
- **`.github/workflows/staging-deploy.yml`**: Auto-deploy to staging on merge to `main`
- **`.github/workflows/production-deploy.yml`**: Production deployment (requires approval)
- **`.github/workflows/feature-deploy.yml`**: Auto-deploy feature branches to preview URLs
- **`.github/workflows/feature-cleanup.yml`**: Auto-cleanup when feature branches are deleted

### Feature Branch Deployments

- Each feature branch gets automatic preview deployment
- Preview URL format: `https://{branch-name}-dev-{repo-name}.{domain}`
- Deploys to separate Kubernetes namespace: `nextjs-{branch-name}`
- Each deployment gets unique NodePort allocation (31000-32000 range)
- Port mappings stored in ConfigMap `feature-branch-port-mappings` in default namespace
- Cloudflare Tunnel routes and DNS records are automatically created/updated
- Cleanup automatically triggered when feature branch is deleted

### Kubernetes & Helm

- Helm charts located in `helm/nextjs-app/`
- Environment-specific values files:
  - `values.yaml`: Base configuration
  - `values-feature.yaml`: Feature branch overrides
  - `values-staging.yaml`: Staging environment
  - `values-production.yaml`: Production environment
- Kubernetes resources: Deployment, Service (NodePort), ServiceAccount, HPA, Ingress
- Security contexts configured with non-root user (UID 1001)

### Secrets Management

- Required GitHub secrets for deployments:
  - `KUBECONFIG`: Base64-encoded kubeconfig for cluster access
  - `CLOUDFLARE_API_TOKEN`: API token with tunnel and DNS permissions
  - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID
  - `CLOUDFLARE_TUNNEL_ID`: Cloudflare Tunnel ID
- Required GitHub variables:
  - `CLOUDFLARE_DOMAIN`: Base domain for deployments
- HashiCorp Vault integration available (see `docs/vault-setup-and-deployment.md`)

## Docker

- Multi-stage Dockerfile optimized for Next.js standalone output
- Docker Compose available for local containerized development
- Images pushed to GitHub Container Registry (ghcr.io)
- Support for multi-platform builds (linux/amd64, linux/arm64)

## Code Quality Configuration

### Biome (Linting & Formatting)

- Line width: 100 characters
- Indent: 2 spaces
- JavaScript: single quotes, JSX double quotes, trailing commas, semicolons
- Strict rules enabled for:
  - Accessibility (a11y)
  - React hooks and exhaustive dependencies
  - Performance (no accumulating spread, no delete)
  - Security (no dangerouslySetInnerHTML)
  - Unused imports/variables
- Next.js and React domain rules enabled

### TypeScript

- Strict mode enabled
- Path alias: `@/*` → `src/*`
- Node version: >=24.11.1

### Testing (Vitest)

- Environment: jsdom (for React component testing)
- React Testing Library integrated
- Setup file: `vitest.setup.ts`
- CSS support enabled

## Security

### Security Headers (configured in `next.config.ts`)

- `X-Frame-Options: DENY`: Prevents clickjacking
- `X-Content-Type-Options: nosniff`: Prevents MIME sniffing
- `Referrer-Policy: origin-when-cross-origin`: Controls referrer information
- `Permissions-Policy`: Blocks camera, microphone, geolocation
- Content Security Policy (CSP):
  - Currently permissive (`unsafe-inline`, `unsafe-eval` allowed)
  - **Important**: Tighten CSP for production by removing unsafe directives
  - Images: HTTPS only (`img-src 'self' data: https:`)

### Next.js Configuration

- Output mode: `standalone` (optimized for Docker deployments)

## Documentation

Extensive setup guides available in `docs/`:

- Kubernetes setup (Raspberry Pi K3s vs AWS EKS with Terraform)
- Helm & package management
- Vault secrets management
- Cloudflare tunnel configuration
- Feature branch deployment details
- Environment variables guide

## Important Notes

- Always run `npm install` after cloning to set up Husky hooks
- Environment variables must be copied from `.env.example` to `.env.local`
- Commit messages are validated - use conventional commit format
- Pre-commit hooks will block commits if linting fails
- Feature deployments require all Cloudflare and Kubernetes secrets configured
- Port range for feature branches is limited (31000-32000) - cleanup unused branches
