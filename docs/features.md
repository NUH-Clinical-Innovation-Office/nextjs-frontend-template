# Feature Inventory

| Feature      | Status                          | Description                                         |
| ------------ | ------------------------------- | --------------------------------------------------- |
| Next.js      | stable                          | App Router framework (v16.2.2) with Turbopack     |
| React        | stable                          | UI library (v19.2.4)                                |
| TypeScript   | stable                          | Static typing (v6.0.2)                              |
| Tailwind CSS | stable                          | Utility-first CSS (v4.2.2) with @tailwindcss/postcss |
| Biome        | stable                          | Linter and formatter (v2.4.10)                       |
| Vitest       | stable                          | Unit testing framework (v4.1.2)                     |
| Husky        | stable                          | Git hooks with commitlint (v9.1.7)                  |
| Knip         | stable                          | Dependency and unused code checker (v6.3.0)          |
| shadcn/ui    | stable                          | Reusable UI component library                        |
| Radix UI     | stable                          | Unstyled, accessible primitives                      |
| Lucide React | stable                          | Icon library with optimized imports                  |
| Framer Motion| stable                          | Animation library (v12.38.0)                        |
| Dark Mode    | stable                          | Theme switching via next-themes                      |
| Sonner       | stable                          | Toast notifications (v2.0.7)                         |
| Vaul         | stable                          | Drawer component (v1.1.2)                           |
| React Day Picker | stable                      | Calendar component (v9.14.0)                         |
| Zod          | stable                          | Env validation with runtime type checking (v4.3.6) |
| CSP Headers  | stable                          | Security headers (X-Frame-Options, HSTS, CSP, etc.) |
| Env Validation | stable                        | Zod schema validation in src/lib/env.ts              |
| Bundle Analyzer | stable                       | Webpack bundle analysis via @next/bundle-analyzer   |
| GitHub Actions CI | stable                    | Reusable workflows for build, test, lint, knip       |
| Feature Deployments | stable                 | Auto-deploy feature branches to isolated namespaces |
| Production Deployments | stable               | Helm-based deployment with Cloudflare tunnel routing |
| Docker       | stable                          | Multi-stage Dockerfile with non-root user           |
| Helm Charts  | stable                          | Kubernetes manifests for all environments            |
| Security Scanning | stable                   | Trivy vulnerability and misconfiguration scanning   |
| Trivy FS Scan | stable                         | Scan source code and configs in CI                   |
| Trivy Image Scan | stable                     | Scan Docker images for CVEs in CI                   |
| Staging Deployments | stable                 | Automatic staging deployment on main branch          |
| Image Cleanup | stable                          | Automated cleanup of old Docker images               |
| Production Rollback | planned                 | Rollback workflow (workflow file exists)             |
| Staging Rollback | planned                   | Rollback workflow (workflow file exists)             |
| Vitest UI    | experimental                    | Interactive test runner UI (npm run test:ui)        |
| Test Coverage | experimental                    | Coverage reports via @vitest/coverage-v8            |

**Notes on status classification:**

- **stable**: Actively used in CI/CD pipelines and/or fully implemented with tests
- **experimental**: Available via npm scripts but not enforced in CI (e.g., `test:ui`, `test:coverage`)
- **planned**: Workflow files exist but are not yet triggered in the CI pipeline (rollback workflows are defined but not yet called by any workflow_dispatch trigger)
