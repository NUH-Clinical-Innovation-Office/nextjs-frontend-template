# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 frontend template with TypeScript, Tailwind CSS 4, and comprehensive CI/CD infrastructure. It's designed for production deployment to Kubernetes with automated feature branch previews via Cloudflare Tunnel.

## Essential Commands

### Development

```bash
bun install           # Install dependencies (automatically sets up Husky)
bun run dev          # Start dev server with Turbopack at http://localhost:3000
bun run build        # Build production bundle with Turbopack
bun start            # Start production server
```

### Testing

```bash
bun run test            # Run tests once with bun test
bun run test:watch      # Run tests in watch mode
bun run test:coverage   # Generate coverage report
```

### Code Quality

```bash
bun run lint          # Check code with Biome
bun run format        # Format code with Biome
bun run type-check    # Run TypeScript type checking
bun run knip          # Check for unused dependencies
```

### Git Hooks (via Husky)

- **Pre-commit**: Runs `bun run lint` automatically
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
- Empty strings are rejected rather than falling back to defaults, since Zod's
  `.default()` only fires on `undefined` and a blank Helm/CI override would
  otherwise validate into a broken value

### common-service Integration

The app proxies to common-service through `/api/notes` because that service has
no ingress. It authenticates as a Consumer Backend with `COMMON_SERVICE_API_KEY`
(sent as `X-API-Key`), falling back to a caller-supplied bearer token when no
key is configured. A token minted directly by auth-service's `/oauth2/token` is
rejected with 401 — only a token from the API-key exchange is accepted.

See [docs/common-service-integration.md](docs/common-service-integration.md).

### Observability

Telemetry reaches Grafana by two independent routes, and it matters which is
which when something stops appearing:

| Signal | Path | Sink |
| --- | --- | --- |
| Server logs (stdout) | Collector `filelog` receiver | Loki |
| Browser logs | `/telemetry/logs` proxy | Loki |
| Server metrics | Prometheus scrapes `:9464/metrics` via ServiceMonitor | Prometheus |
| Browser metrics (Web Vitals) | `/telemetry/metrics` proxy | Prometheus |
| Browser traces | `/telemetry/traces` proxy | Tempo |

- `src/instrumentation.ts` starts the Prometheus endpoint on its own port
  (`METRICS_ENABLED=true`), deliberately not a Next.js route: it stays off the
  public ingress and clear of the `/api/*` common-service proxy.
- `src/lib/telemetry/proxy.ts` is the only browser-reachable path to the
  collector. It enforces content type, body size, rate limit, and same-site
  origin, and it **overwrites** `service.name`/`deployment.environment`/`tenant`
  server-side so a tampered browser cannot masquerade as another service.
- The collector credential never reaches the browser — it is attached
  server-side in the proxy.
- `NEXT_PUBLIC_OTEL_ENABLED` is inlined into the client bundle at **image build
  time** (Dockerfile `ARG`), so enabling telemetry in Helm alone turns on the
  server half only. The browser SDK also needs the `otel_enabled: true` input to
  `reusable-docker.yml`.
- The browser SDK self-disables outside production builds, so local development
  never ships telemetry.

### Path Aliases

- `@/` resolves to `src/` directory (configured in `tsconfig.json`, read natively by `bun test`)

## CI/CD Infrastructure

### GitHub Actions Workflows

- **`.github/workflows/ci.yml`**: Runs on push to `main` — build, security scan,
  then deploy to development
- **`.github/workflows/pull-request.yml`**: Quality checks on PRs
- **`.github/workflows/dev-deploy.yml`**: Deploys to AWS EKS namespace
  `eai-otherapps`, delegating to the pinned shared workflow
  `nuhs-projects/ci-workflows/.github/workflows/deploy-eks-helm.yml@v1`
- **`.github/workflows/production-deploy.yml`**: Retained for `workflow_dispatch`
  only; it is no longer wired into `ci.yml`

### Development Deployment

- Namespace `eai-otherapps` on the `dev` EKS cluster, release name `client-sample`
- Values file: `helm/nextjs-app/values-dev.yaml`
- URL: `https://client-sample-dev.russellgpt.com` (shares the `dev` ALB group)
- Authenticates via GitHub OIDC using the `AWS_DEV_DEPLOY_ROLE_ARN` secret
- `nameOverride: client-sample` is load-bearing: `app.kubernetes.io/name` is what
  the OTel collector's NetworkPolicy matches to admit this pod as a sender.
  Without it the label would be the chart name (`nextjs-app`) and every
  telemetry export would be dropped at L3/L4 with no application-level error.

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

Deployment targets AWS EKS (namespace `eai-otherapps`) and authenticates via
GitHub OIDC rather than a stored kubeconfig.

- Required GitHub secrets:
  - `AWS_DEV_DEPLOY_ROLE_ARN`: Role assumed via OIDC for cluster access
- Kubernetes Secrets that must exist in the namespace before deploying:
  - `ghcr-credentials`: Image pull secret for GHCR
  - `client-sample-common-service`: Holds `api-key`, the developer API key
    presented to common-service
- Created by the chart via External Secrets (no manual step, but the underlying
  Parameter Store entry must be seeded out of band):
  - `otel-client-sample-api-key`: Bearer token for the OTel collector, synced
    from `/nuh-cio/otel/proxies/client-sample`

No credential passes through CI. Both secrets are read by reference from the
namespace, so nothing sensitive appears in a values file or in
`helm get values` output.

See `docs/deployment.md` for the exact commands.

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
- Node version: 26.3.0

### Testing (bun test)

- Test runner: `bun test` (native, no Vitest)
- Environment: happy-dom via `@happy-dom/global-registrator` (preloaded in `happydom.ts`)
- React Testing Library + jest-dom matchers (augmented onto `bun:test` in `bun-test.d.ts`)
- Setup file: `test-setup.ts` (jest-dom import, ResizeObserver/matchMedia mocks, `afterEach(cleanup)`)
- Config in `bunfig.toml`: preload files + 60% coverage threshold (text + lcov reporters)
- Module mocks use `vi.mock` (bun's Vitest-compatible alias); bun does NOT hoist mocks, so mocked modules must be dynamically imported after the `vi.mock` call

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

- Always run `bun install` after cloning to set up Husky hooks
- Environment variables must be copied from `.env.example` to `.env.local`
- Commit messages are validated - use conventional commit format
- Pre-commit hooks will block commits if linting fails
- Feature deployments require all Cloudflare and Kubernetes secrets configured
- Port range for feature branches is limited (31000-32000) - cleanup unused branches
