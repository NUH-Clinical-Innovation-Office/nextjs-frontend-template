# Next.js Frontend Template

A production-ready [Next.js](https://nextjs.org) template with TypeScript, Tailwind CSS, and comprehensive tooling for modern web application development.

## Table of Contents

- [Features](#features)
  - [Core Framework](#core-framework)
  - [UI Components](#ui-components)
  - [Developer Experience](#developer-experience)
  - [Testing](#testing)
  - [Security](#security)
  - [CI/CD & Deployment](#cicd--deployment)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Initial Setup for New Users](#initial-setup-for-new-users)
  - [Running Locally](#running-locally)
  - [Available Scripts](#available-scripts)
  - [Husky Git Hooks](#husky-git-hooks)
- [Security](#security-1)
  - [Security Headers](#security-headers)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Deployment](#deployment)
  - [Docker](#docker)
  - [CI/CD](#cicd)
- [Learn More](#learn-more)
- [License](#license)

## Features

### Core Framework

- **Next.js 16** with App Router and Turbopack
- **React 19** with latest features
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling with PostCSS

### UI Components

- **shadcn/ui** components (Button, Card, Badge, Dropdown Menu)
- **Radix UI** primitives for accessible components
- **Lucide React** icons
- **next-themes** for dark mode support with theme toggle
- Atomic design structure (atoms, molecules, providers)

### Developer Experience

- **Biome** for fast linting and formatting
- **Vitest** for unit testing with React Testing Library
- **Husky** for git hooks
- **Commitlint** for conventional commit messages
- **Depcheck** for dependency management
- **TypeScript strict mode** with type checking

### Testing

- Unit testing with Vitest and React Testing Library
- UI mode for interactive testing
- Watch mode for development

### Security

- Comprehensive security headers (CSP, X-Frame-Options, etc.)
- Content Security Policy configured
- Environment variable validation with Zod
- HTTPS-only image loading

### CI/CD & Deployment

- **GitHub Actions workflows** for staging, production, and feature branches
- **Feature branch deployments** with automatic preview environments and cleanup
- **Docker** support with Docker Compose
- **Kubernetes** service account configuration for GitHub Actions
- **HashiCorp Vault** integration for secure secrets management
- **Cloudflare Tunnel** integration for secure external access

## Getting Started

### Prerequisites

Follow the setup guide at [NUH Clinical Innovation Office Setup](https://github.com/NUH-Clinical-Innovation-Office/setup) to install:

- Node.js >= 24.10.0
- npm, yarn, pnpm, or bun

### Initial Setup for New Users

After cloning this repository:

1. Install dependencies:

```bash
npm install
```

This will automatically set up Husky git hooks via the `prepare` script.

2. Configure environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration. See [Environment Variables Guide](docs/ENVIRONMENT_VARIABLES.md) for details.

### Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The development server includes:

- Hot module replacement with Turbopack
- Fast refresh for instant updates
- TypeScript type checking
- Auto-compilation on file changes

### Available Scripts

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build           # Build production bundle
npm start               # Start production server

# Testing
npm run test            # Run tests once
npm run test:watch      # Run tests in watch mode
npm run test:ui         # Open Vitest UI for interactive testing
npm run test:coverage   # Generate coverage report

# Code Quality
npm run lint            # Check code with Biome
npm run format          # Format code with Biome
npm run type-check      # Run TypeScript type checking
npm run depcheck        # Check for unused dependencies
```

### Husky Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality through git hooks:

#### Pre-commit Hook

- Runs `npm run lint` before each commit
- Ensures code passes linting checks before allowing commits

#### Commit Message Hook

- Validates commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) format
- Enforced via [commitlint](https://commitlint.js.org/)
- Valid commit types:
  - `feat`: New feature
  - `fix`: Bug fix
  - `docs`: Documentation changes
  - `style`: Code style changes (formatting, etc.)
  - `refactor`: Code refactoring
  - `perf`: Performance improvements
  - `test`: Adding or updating tests
  - `build`: Build system or dependency changes
  - `ci`: CI/CD changes
  - `chore`: Other changes
  - `revert`: Revert a previous commit

**Example valid commit messages:**

```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve navigation bug"
git commit -m "docs: update readme with setup instructions"
```

**Testing if Husky is working:**

```bash
# This should fail (invalid commit message format)
git commit --allow-empty -m "invalid message"

# This should pass (valid format)
git commit --allow-empty -m "test: verify husky setup"
```

## Security

### Security Headers

This template includes security headers configured in `next.config.ts` to protect against common web vulnerabilities:

**X-Frame-Options: DENY**

- Prevents your site from being embedded in iframes
- Protects against clickjacking attacks where attackers overlay invisible frames

**X-Content-Type-Options: nosniff**

- Prevents browsers from MIME-sniffing (guessing content types)
- Forces browsers to respect the declared Content-Type, preventing script execution vulnerabilities

**Referrer-Policy: origin-when-cross-origin**

- Controls what referrer information is sent with requests
- Sends full URL for same-origin requests, only origin for cross-origin requests

**X-DNS-Prefetch-Control: on**

- Enables DNS prefetching for external resources
- Improves performance by resolving domain names before users click links

**Permissions-Policy: camera=(), microphone=(), geolocation=()**

- Blocks access to sensitive browser APIs (camera, microphone, location)
- Prevents malicious scripts from accessing these features

**Content-Security-Policy (CSP)**

- Controls which resources can be loaded and executed
- `default-src 'self'`: Only load resources from your domain
- `script-src 'self' 'unsafe-eval' 'unsafe-inline'`: Allows inline scripts (permissive for template)
- `style-src 'self' 'unsafe-inline'`: Allows inline styles
- `img-src 'self' data: https:`: Images from your domain, data URIs, or any HTTPS source
- `font-src 'self' data:`: Fonts from your domain or data URIs
- `connect-src 'self'`: API calls only to your domain

**Note:** The CSP is intentionally permissive for a template. For production, tighten it by removing `'unsafe-inline'` and `'unsafe-eval'` based on your specific requirements.

## Project Structure

```text
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx        # Home page
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── atoms/          # Basic UI elements
│   │   ├── molecules/      # Composite components
│   │   ├── providers/      # Context providers
│   │   └── ui/             # shadcn/ui components
│   └── lib/
│       ├── utils.ts        # Utility functions
│       └── env.ts          # Environment validation
├── docs/                   # Documentation
├── k8s/                    # Kubernetes service account
├── scripts/                # Utility scripts
└── .github/workflows/      # CI/CD workflows
```

## Documentation

### Setup & Infrastructure

- [Kubernetes Setup Guide](docs/kubernetes-setup.md) - Overview of Kubernetes cluster setup options (Raspberry Pi vs AWS)
- [Kubernetes on Raspberry Pi](docs/kubernetes-setup-raspberry-pi.md) - Self-hosted K3s cluster setup on Raspberry Pi
- [Kubernetes on AWS with Terraform](docs/kubernetes-setup-aws.md) - Production-ready EKS cluster using Terraform IaC
- [Helm & Kubernetes Guide](docs/helm-kubernetes-setup.md) - Complete guide to Helm package manager and chart deployment
- [Vault Secrets Management](docs/vault-setup-and-deployment.md) - HashiCorp Vault integration for secure secrets across environments

### Deployment & CI/CD

- [Cloudflare GitHub Setup](docs/cloudflare-github-setup.md) - Cloudflare Tunnel configuration and GitHub Actions integration
- [Feature Branch Deployment](docs/FEATURE_BRANCH_DEPLOYMENT.md) - Automatic feature branch deployments with Cloudflare
- [Workflow Fixes](docs/WORKFLOW_FIXES.md) - CI/CD workflow documentation and fixes

### Configuration

- [Environment Variables Guide](docs/ENVIRONMENT_VARIABLES.md) - Configure and validate environment variables with Zod

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

### CI/CD

This template includes GitHub Actions workflows for:

- **Staging deployment** - Automatic deployment to staging environment
- **Production deployment** - Production deployments with approval
- **Feature branch deployment** - Automatic preview deployments for feature branches
- **Feature cleanup** - Auto-cleanup when branches are deleted

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [React Documentation](https://react.dev) - Learn React 19 features
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com) - Re-usable components
- [Vitest](https://vitest.dev) - Testing framework
- [Biome](https://biomejs.dev) - Linting and formatting
- [Docker](https://docs.docker.com) - Containerization platform
- [Kubernetes](https://kubernetes.io/docs) - Container orchestration
- [Helm](https://helm.sh/docs) - Kubernetes package manager
- [GitHub Actions](https://docs.github.com/en/actions) - CI/CD workflows
- [Cloudflare](https://developers.cloudflare.com) - CDN and DNS services

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
