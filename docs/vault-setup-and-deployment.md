# Vault Setup and Deployment Guide

This guide explains how to set up HashiCorp Vault for managing secrets across different environments (feature, staging, and production) and how your application automatically retrieves secrets during deployment.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Initial Vault Setup](#initial-vault-setup)
- [Environment Configuration](#environment-configuration)
- [Deployment Process](#deployment-process)
- [How Applications Pick Up Secrets](#how-applications-pick-up-secrets)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

## Overview

This application uses HashiCorp Vault to securely store and manage secrets across multiple environments. When you deploy the application, the Vault Agent Injector automatically injects secrets into your pods, eliminating the need to store sensitive information in environment variables or ConfigMaps.

### Key Features

- **Centralized Secret Management**: All secrets stored securely in Vault
- **Automatic Secret Injection**: Vault Agent Injector injects secrets into pods at runtime
- **Environment Separation**: Dedicated secret paths for development, staging, and production
- **No Secret Sprawl**: Secrets never stored in Git or Kubernetes manifests
- **Audit Trail**: Vault provides complete audit logs of secret access

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     HashiCorp Vault Server                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                  KV Secrets Engine (v2)                │  │
│  │                                                        │  │
│  │  secret/nextjs-frontend-template/                      │  │
│  │    ├── development/                                    │  │
│  │    │   ├── NEXTAUTH_URL                                │  │
│  │    │   ├── NEXTAUTH_SECRET                             │  │
│  │    │   ├── DATABASE_URL                                │  │
│  │    │   └── API_URL                                     │  │
│  │    ├── staging/                                        │  │
│  │    │   ├── NEXTAUTH_URL                                │  │
│  │    │   ├── NEXTAUTH_SECRET                             │  │
│  │    │   ├── DATABASE_URL                                │  │
│  │    │   └── API_URL                                     │  │
│  │    └── production/                                     │  │
│  │        ├── NEXTAUTH_URL                                │  │
│  │        ├── NEXTAUTH_SECRET                             │  │
│  │        ├── DATABASE_URL                                │  │
│  │        └── API_URL                                     │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              │ Vault Agent Injector
                              │
┌─────────────────────────────▼────────────────────────────────┐
│                     Kubernetes Cluster                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Pod: nextjs-app                                       │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  Init Container: vault-agent-init                │  │  │
│  │  │  (Fetches secrets from Vault)                    │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  App Container: nextjs-app                       │  │  │
│  │  │  /vault/secrets/env ← Injected secrets file      │  │  │
│  │  │  Application reads secrets from this file        │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Prerequisites

### Required Tools

- **Vault CLI**: For managing secrets
- **kubectl**: For Kubernetes access
- **Helm**: For deploying applications

Install Vault CLI:

```bash
# macOS
brew install vault

# Linux
wget https://releases.hashicorp.com/vault/1.15.0/vault_1.15.0_linux_amd64.zip
unzip vault_1.15.0_linux_amd64.zip
sudo mv vault /usr/local/bin/

# Verify installation
vault version
```

### Vault Server Setup

If you haven't set up Vault yet, you need a running Vault server. You can deploy Vault in your Kubernetes cluster or run it separately.

#### Option 1: Vault in Kubernetes (Recommended for Production)

```bash
# Add HashiCorp Helm repository
helm repo add hashicorp https://helm.releases.hashicorp.com
helm repo update

# Install Vault
helm install vault hashicorp/vault \
  --namespace vault \
  --create-namespace \
  --set "server.dev.enabled=false" \
  --set "injector.enabled=true"
```

#### Option 2: Local Development Vault

```bash
# Start Vault in dev mode (DO NOT use in production)
vault server -dev
```

## Initial Vault Setup

### 1. Initialize Vault (First Time Only)

If this is a fresh Vault installation:

```bash
# Initialize Vault
vault operator init

# This will output:
# - Unseal keys (5 keys)
# - Root token
# SAVE THESE SECURELY! You need them to unseal Vault.
```

Store these keys securely (e.g., in a password manager or encrypted storage).

### 2. Unseal Vault

Vault starts in a sealed state and must be unsealed:

```bash
# Unseal Vault (need 3 out of 5 keys by default)
vault operator unseal <unseal-key-1>
vault operator unseal <unseal-key-2>
vault operator unseal <unseal-key-3>
```

### 3. Login to Vault

```bash
# Set Vault address
export VAULT_ADDR='http://127.0.0.1:8200'

# Login with root token
export VAULT_TOKEN='hvs.XXXXX'  # Use your actual root token

# Or login interactively
vault login
```

### 4. Enable KV Secrets Engine

```bash
# Enable KV v2 secrets engine
vault secrets enable -path=secret kv-v2

# Verify
vault secrets list
```

### 5. Configure Kubernetes Authentication

Vault needs to authenticate requests from Kubernetes:

```bash
# Enable Kubernetes auth method
vault auth enable kubernetes

# Configure Kubernetes auth
vault write auth/kubernetes/config \
    kubernetes_host="https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_SERVICE_PORT"

# Create a policy for the application
vault policy write nextjs-frontend-template - <<EOF
path "secret/data/nextjs-frontend-template/*" {
  capabilities = ["read"]
}
EOF

# Create Kubernetes role
vault write auth/kubernetes/role/nextjs-frontend-template \
    bound_service_account_names=nextjs-frontend-template \
    bound_service_account_namespaces=nextjs-frontend-template,nextjs-* \
    policies=nextjs-frontend-template \
    ttl=24h
```

## Environment Configuration

### Using the Setup Script

The easiest way to configure all environments is using the provided script:

```bash
# Make the script executable
chmod +x scripts/setup-vault-environments.sh

# Run the script
./scripts/setup-vault-environments.sh
```

The script will prompt you for secrets for each environment:

- Development
- Staging
- Production

### Manual Configuration

Alternatively, you can manually add secrets for each environment:

#### Development Environment

```bash
vault kv put secret/nextjs-frontend-template/development \
    NEXTAUTH_URL="https://dev.example.com" \
    NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
    DATABASE_URL="postgresql://user:pass@dev-db:5432/myapp" \
    API_URL="https://api-dev.example.com"
```

#### Staging Environment

```bash
vault kv put secret/nextjs-frontend-template/staging \
    NEXTAUTH_URL="https://staging.example.com" \
    NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
    DATABASE_URL="postgresql://user:pass@staging-db:5432/myapp" \
    API_URL="https://api-staging.example.com"
```

#### Production Environment

```bash
vault kv put secret/nextjs-frontend-template/production \
    NEXTAUTH_URL="https://example.com" \
    NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
    DATABASE_URL="postgresql://user:pass@prod-db:5432/myapp" \
    API_URL="https://api.example.com"
```

### Verify Secrets

```bash
# List all secret paths
vault kv list secret/nextjs-frontend-template

# View secrets for an environment
vault kv get secret/nextjs-frontend-template/development
vault kv get secret/nextjs-frontend-template/staging
vault kv get secret/nextjs-frontend-template/production
```

### Update Secrets

```bash
# Update individual secrets
vault kv patch secret/nextjs-frontend-template/production \
    DATABASE_URL="postgresql://newuser:newpass@prod-db:5432/myapp"

# Replace all secrets
vault kv put secret/nextjs-frontend-template/production \
    NEXTAUTH_URL="https://example.com" \
    NEXTAUTH_SECRET="new-secret" \
    DATABASE_URL="postgresql://user:pass@prod-db:5432/myapp" \
    API_URL="https://api.example.com"
```

## Deployment Process

### How It Works

When you deploy your application using Helm, the following happens automatically:

1. **Helm Deployment**: Helm chart is deployed with environment-specific values file
2. **Pod Creation**: Kubernetes creates a pod with Vault annotations
3. **Vault Agent Injection**: Vault Agent Injector mutates the pod to add:
   - Init container that fetches secrets
   - Shared volume for secrets
4. **Secret Retrieval**: Init container authenticates to Vault and fetches secrets
5. **Secret Writing**: Secrets are written to `/vault/secrets/env` as a shell script
6. **Application Start**: Main container starts with access to secrets file

### Deployment Commands

#### Feature Branch Deployment

Feature branches are automatically deployed via GitHub Actions when you push to a branch:

```bash
# Push to feature branch
git checkout -b feature/my-feature
git push origin feature/my-feature

# GitHub Actions will:
# 1. Build and push Docker image
# 2. Allocate a port
# 3. Deploy with values-feature.yaml
# 4. Create Cloudflare tunnel route
```

The deployment uses:

- **Values file**: `helm/nextjs-app/values-feature.yaml`
- **Vault path**: `secret/data/nextjs-frontend-template/development`
- **Namespace**: `nextjs-<sanitized-branch-name>`

#### Staging Deployment

```bash
# Automated deployment via GitHub Actions on push to staging branch
git push origin staging

# Or manual deployment
helm upgrade --install nextjs-app ./helm/nextjs-app \
  -n nextjs-frontend-template \
  --create-namespace \
  -f ./helm/nextjs-app/values-staging.yaml \
  --set image.tag=staging \
  --wait
```

The deployment uses:

- **Values file**: `helm/nextjs-app/values-staging.yaml`
- **Vault path**: `secret/data/nextjs-frontend-template/staging`
- **Namespace**: `nextjs-frontend-template`

#### Production Deployment

```bash
# Automated deployment via GitHub Actions on push to main branch
git push origin main

# Or manual deployment
helm upgrade --install nextjs-app ./helm/nextjs-app \
  -n nextjs-frontend-template \
  --create-namespace \
  -f ./helm/nextjs-app/values-production.yaml \
  --set image.tag=latest \
  --wait
```

The deployment uses:

- **Values file**: `helm/nextjs-app/values-production.yaml`
- **Vault path**: `secret/data/nextjs-frontend-template/production`
- **Namespace**: `nextjs-frontend-template`

## How Applications Pick Up Secrets

### Vault Agent Injector Annotations

Each environment's `values-*.yaml` file contains pod annotations that configure Vault injection:

```yaml
podAnnotations:
  # Enable Vault injection
  vault.hashicorp.io/agent-inject: "true"

  # Kubernetes role to use for authentication
  vault.hashicorp.io/role: "nextjs-frontend-template"

  # Secret path in Vault
  vault.hashicorp.io/agent-inject-secret-env: "secret/data/nextjs-frontend-template/production"

  # Template for how to render the secrets
  vault.hashicorp.io/agent-inject-template-env: |
    {{- with secret "secret/data/nextjs-frontend-template/production" -}}
    export NEXTAUTH_URL="{{ .Data.data.NEXTAUTH_URL }}"
    export NEXTAUTH_SECRET="{{ .Data.data.NEXTAUTH_SECRET }}"
    export DATABASE_URL="{{ .Data.data.DATABASE_URL }}"
    export API_URL="{{ .Data.data.API_URL }}"
    {{- end -}}
```

### Accessing Secrets in Your Application

Secrets are injected as a file at `/vault/secrets/env`. You have several options:

#### Option 1: Source the file in your entrypoint

```dockerfile
# Dockerfile
CMD ["sh", "-c", "source /vault/secrets/env && node server.js"]
```

#### Option 2: Read the file in your application

```typescript
// server.ts
import { readFileSync } from 'fs';
import { parse } from 'dotenv';

// Read Vault secrets if file exists
try {
  const vaultSecrets = readFileSync('/vault/secrets/env', 'utf8');
  const secrets = parse(vaultSecrets.replace(/export /g, ''));
  Object.assign(process.env, secrets);
} catch (error) {
  console.log('No Vault secrets found, using environment variables');
}

// Now use secrets
const nextAuthUrl = process.env.NEXTAUTH_URL;
```

#### Option 3: Use a startup script

```bash
#!/bin/sh
# entrypoint.sh

# Load Vault secrets if available
if [ -f /vault/secrets/env ]; then
  echo "Loading secrets from Vault..."
  . /vault/secrets/env
fi

# Start application
exec node server.js
```

### Verification

Check that secrets are properly injected:

```bash
# Get pod name
POD=$(kubectl get pods -n nextjs-frontend-template -l app=nextjs-app -o jsonpath='{.items[0].metadata.name}')

# Check secrets file exists
kubectl exec -n nextjs-frontend-template $POD -c nextjs-app -- ls -la /vault/secrets/

# View secrets (be careful in production!)
kubectl exec -n nextjs-frontend-template $POD -c nextjs-app -- cat /vault/secrets/env

# Check pod annotations
kubectl get pod $POD -n nextjs-frontend-template -o jsonpath='{.metadata.annotations}' | jq
```

## Troubleshooting

### Common Issues

#### 1. Pod Stuck in Init State

```bash
# Check init container logs
kubectl logs -n nextjs-frontend-template $POD -c vault-agent-init

# Common causes:
# - Vault is sealed
# - Vault is unreachable
# - Authentication failed
# - Secret path doesn't exist
```

**Solutions**:

- Ensure Vault is running and unsealed
- Check Vault address in Kubernetes auth config
- Verify service account has correct permissions
- Confirm secret path exists in Vault

#### 2. Secrets Not Found

```bash
# Verify secret exists
vault kv get secret/nextjs-frontend-template/production

# Check secret path in pod annotation
kubectl get pod $POD -o yaml | grep vault.hashicorp.io/agent-inject-secret
```

**Solution**: Ensure the path in pod annotations matches the actual Vault path.

#### 3. Authentication Failed

```bash
# Check service account
kubectl get sa -n nextjs-frontend-template

# Verify Kubernetes auth role
vault read auth/kubernetes/role/nextjs-frontend-template
```

**Solution**: Ensure service account name matches the Kubernetes role binding in Vault.

#### 4. Vault Agent Injector Not Installed

```bash
# Check if Vault injector is running
kubectl get pods -n vault -l app.kubernetes.io/name=vault-agent-injector
```

**Solution**: Install Vault with injector enabled:

```bash
helm upgrade --install vault hashicorp/vault \
  --namespace vault \
  --set "injector.enabled=true"
```

### Enable Debug Logging

Add this annotation to get more verbose logs:

```yaml
podAnnotations:
  vault.hashicorp.io/log-level: "debug"
```

### Check Vault Audit Logs

```bash
# Enable audit logging
vault audit enable file file_path=/vault/logs/audit.log

# View audit logs
kubectl exec -n vault vault-0 -- cat /vault/logs/audit.log
```

## Security Best Practices

### 1. Rotate Secrets Regularly

```bash
# Update production secrets
vault kv put secret/nextjs-frontend-template/production \
    NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
    # ... other secrets

# Restart pods to pick up new secrets
kubectl rollout restart deployment/nextjs-app -n nextjs-frontend-template
```

### 2. Use Vault Policies

Create least-privilege policies:

```hcl
# Read-only access to specific environment
path "secret/data/nextjs-frontend-template/production" {
  capabilities = ["read"]
}

# Deny access to other environments
path "secret/data/nextjs-frontend-template/staging" {
  capabilities = ["deny"]
}
```

### 3. Enable Vault Audit Logging

```bash
vault audit enable file file_path=/vault/logs/audit.log
```

### 4. Secure Vault Root Token

- Never commit the root token to Git
- Store in a secure password manager
- Rotate the root token periodically
- Use temporary tokens for day-to-day operations

### 5. Unseal Keys Security

- Store unseal keys separately from root token
- Use Vault auto-unseal with cloud KMS (production)
- Never store unseal keys in plain text

### 6. Network Security

- Use TLS for Vault communication in production
- Restrict Vault access to authorized networks only
- Use private networking within Kubernetes cluster

### 7. Monitor Secret Access

```bash
# View secret access logs
vault audit log | grep "nextjs-frontend-template"

# Set up alerts for unauthorized access attempts
```

## Additional Resources

- [HashiCorp Vault Documentation](https://developer.hashicorp.com/vault/docs)
- [Vault Kubernetes Integration](https://developer.hashicorp.com/vault/docs/platform/k8s)
- [Vault Agent Injector](https://developer.hashicorp.com/vault/docs/platform/k8s/injector)
- [Vault Best Practices](https://developer.hashicorp.com/vault/tutorials/recommended-patterns)
- [Vault Security Model](https://developer.hashicorp.com/vault/docs/internals/security)
- [Kubernetes Setup Guide](./kubernetes-setup.md)

## Support

For issues or questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Review Vault logs: `kubectl logs -n vault vault-0`
3. Check pod events: `kubectl describe pod $POD -n nextjs-frontend-template`
4. Consult [HashiCorp Vault documentation](https://developer.hashicorp.com/vault)
