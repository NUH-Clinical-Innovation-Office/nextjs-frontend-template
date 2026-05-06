# Features

This document provides an inventory of all features in the Next.js Frontend Template.

## Feature Inventory

| Feature | Status | Description |
| ------- | ------ |-------------|
| Next.js 16 with App Router | stable | Latest Next.js with Turbopack, server components, and optimized builds |
| React 19 | stable | Latest React with new features and improved performance |
| TypeScript strict mode | stable | Full type safety with strict TypeScript configuration |
| Tailwind CSS 4 | stable | Utility-first CSS with PostCSS and dark mode support |
| shadcn/ui components | stable | Pre-built, customizable components (Button, Card, Badge, etc.) |
| Radix UI primitives | stable | Accessible low-level UI components |
| Lucide React icons | stable | Consistent icon library with tree-shaking support |
| next-themes dark mode | stable | Theme switching with pill-style toggle and system preference support |
| Biome linting/formatting | stable | Fast linter and formatter (replacement for ESLint + Prettier) |
| Vitest testing | stable | Unit testing with React Testing Library and jsdom environment |
| Husky git hooks | stable | Pre-commit linting and conventional commit validation |
| Commitlint | stable | Enforces Conventional Commits format |
| Knip dependency checker | stable | Detects unused dependencies, files, and exports |
| Trivy security scanning | stable | Vulnerability detection for dependencies, Docker, and IaC |
| Docker support | stable | Multi-stage Dockerfile with standalone output |
| Docker Compose | stable | Local containerized development environment |
| Kubernetes/Helm | stable | Production-ready K3s/EKS deployment with Helm charts |
| GitHub Actions CI/CD | stable | Automated build, test, deploy, and rollback workflows |
| Feature branch deployments | stable | Automatic preview deployments via Cloudflare Tunnel |
| HashiCorp Vault integration | stable | Secure secrets management across environments |
| Cloudflare Tunnel | stable | Secure external access to cluster services |
| Security headers | stable | CSP, HSTS, X-Frame-Options, and other protective headers |
| Zod environment validation | stable | Runtime validation of environment variables with type safety |
| Bundle analyzer | experimental | Webpack bundle analysis via `@next/bundle-analyzer` |
| HPA (Horizontal Pod Autoscaler) | planned | CPU/memory-based auto-scaling for Kubernetes pods |
| Ingress with TLS | disabled | Nginx ingress with Let's Encrypt (disabled by default) |
| PodDisruptionBudget | disabled | High availability during node maintenance (disabled by default) |

## Status Definitions

- **stable**: Shipped and tested in production environments
- **experimental**: Available but not fully tested in all scenarios
- **planned**: Not yet implemented but documented as intended
- **disabled**: Available but not enabled by default (requires configuration)