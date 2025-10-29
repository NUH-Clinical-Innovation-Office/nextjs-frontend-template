# Helm Setup with Kubernetes Guide

This guide explains how to set up Helm, the Kubernetes package manager, and use it to deploy applications to your Kubernetes cluster. Helm simplifies the deployment and management of Kubernetes applications through reusable, versioned packages called "charts."

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installing Helm](#installing-helm)
- [Helm Basics](#helm-basics)
- [Creating Your First Chart](#creating-your-first-chart)
- [Chart Structure](#chart-structure)
- [Values and Templating](#values-and-templating)
- [Deployment Workflows](#deployment-workflows)
- [Helm Best Practices](#helm-best-practices)
- [Troubleshooting](#troubleshooting)
- [Advanced Topics](#advanced-topics)

## Overview

Helm is the package manager for Kubernetes, analogous to apt/yum for Linux or npm for Node.js. It streamlines the installation and management of Kubernetes applications through charts—pre-configured Kubernetes resources.

### Key Features

- **Package Management**: Bundle multiple Kubernetes manifests into a single chart
- **Version Control**: Track and rollback releases easily
- **Templating**: Create reusable, configurable Kubernetes manifests
- **Dependency Management**: Manage dependencies between charts
- **Releases**: Maintain multiple versions of applications in different states
- **Values Override**: Configure deployments for different environments

### Why Use Helm?

**Without Helm:**

```bash
# Managing multiple YAML files manually
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

# Difficult to track versions
# Hard to rollback
# No templating for different environments
```

**With Helm:**

```bash
# One command to deploy everything
helm install my-app ./my-chart

# Easy rollbacks
helm rollback my-app 1

# Environment-specific values
helm install my-app ./my-chart -f values-production.yaml
```

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Helm Architecture                         │
└──────────────────────────────────────────────────────────────────┘

                       ┌───────────────────┐
                       │   Developer/User  │
                       │                   │
                       │  $ helm install   │
                       │  $ helm upgrade   │
                       │  $ helm rollback  │
                       └─────────┬─────────┘
                                 │
                                 │ Helm CLI
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                          Helm Chart                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Chart.yaml          (Chart metadata)                      │  │
│  │  values.yaml         (Default configuration)               │  │
│  │  templates/          (Kubernetes manifest templates)       │  │
│  │    ├── deployment.yaml                                     │  │
│  │    ├── service.yaml                                        │  │
│  │    ├── ingress.yaml                                        │  │
│  │    └── configmap.yaml                                      │  │
│  │  charts/             (Dependency charts)                   │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                │ Render templates
                                │ with values
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Kubernetes API Server                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Release: my-app-v1                                        │  │
│  │  ├── Deployment: my-app                                    │  │
│  │  ├── Service: my-app                                       │  │
│  │  ├── Ingress: my-app                                       │  │
│  │  └── ConfigMap: my-app-config                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Helm Release History (stored as Secrets)                  │  │
│  │  ├── my-app revision 1                                     │  │
│  │  ├── my-app revision 2                                     │  │
│  │  └── my-app revision 3                                     │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### How Helm Works

1. **Chart Creation**: Package Kubernetes manifests into a chart
2. **Template Rendering**: Helm renders templates with values
3. **Release Creation**: Helm installs resources and creates a release
4. **Release Tracking**: Release history stored in Kubernetes secrets
5. **Upgrade/Rollback**: Modify or revert releases as needed

## Prerequisites

### Required Tools

- **kubectl**: Kubernetes command-line tool
- **Kubernetes cluster**: Running cluster (see [Kubernetes Setup Guide](./kubernetes-setup.md))
- **Access credentials**: Configured kubeconfig file

Verify your setup:

```bash
# Check kubectl connection
kubectl cluster-info
kubectl get nodes

# Check current context
kubectl config current-context
```

## Installing Helm

### Installation Methods

#### macOS

```bash
# Using Homebrew (recommended)
brew install helm

# Verify installation
helm version
```

#### Linux

```bash
# Using package manager
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Or download binary directly
wget https://get.helm.sh/helm-v3.13.0-linux-amd64.tar.gz
tar -zxvf helm-v3.13.0-linux-amd64.tar.gz
sudo mv linux-amd64/helm /usr/local/bin/helm

# Verify installation
helm version
```

#### Windows

```powershell
# Using Chocolatey
choco install kubernetes-helm

# Using Scoop
scoop install helm

# Verify installation
helm version
```

### Post-Installation Setup

#### Enable Bash/Zsh Completion

```bash
# Bash
helm completion bash | sudo tee /etc/bash_completion.d/helm

# Zsh
helm completion zsh > "${fpath[1]}/_helm"

# Fish
helm completion fish > ~/.config/fish/completions/helm.fish
```

#### Add Helm Repositories

```bash
# Add popular Helm repositories
helm repo add stable https://charts.helm.sh/stable
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add hashicorp https://helm.releases.hashicorp.com
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx

# Update repository index
helm repo update

# List configured repositories
helm repo list
```

## Helm Basics

### Essential Helm Commands

#### Searching for Charts

```bash
# Search in all repositories
helm search repo nginx

# Search Artifact Hub (public registry)
helm search hub wordpress

# Show chart information
helm show chart bitnami/nginx
helm show values bitnami/nginx
helm show readme bitnami/nginx
```

#### Installing Charts

```bash
# Install a chart
helm install my-nginx bitnami/nginx

# Install with custom namespace
helm install my-nginx bitnami/nginx --namespace my-apps --create-namespace

# Install with custom values
helm install my-nginx bitnami/nginx --set service.type=LoadBalancer

# Install with values file
helm install my-nginx bitnami/nginx -f custom-values.yaml

# Dry run (see what would be installed)
helm install my-nginx bitnami/nginx --dry-run --debug
```

#### Managing Releases

```bash
# List all releases
helm list
helm list --all-namespaces

# Get release status
helm status my-nginx

# Get release history
helm history my-nginx

# Upgrade a release
helm upgrade my-nginx bitnami/nginx --set replicaCount=3

# Rollback a release
helm rollback my-nginx 1

# Uninstall a release
helm uninstall my-nginx

# Uninstall but keep history
helm uninstall my-nginx --keep-history
```

#### Getting Release Information

```bash
# Get manifest of installed release
helm get manifest my-nginx

# Get values used in release
helm get values my-nginx

# Get all release information
helm get all my-nginx

# Get release notes
helm get notes my-nginx
```

## Creating Your First Chart

### Generate Chart Scaffold

```bash
# Create a new chart
helm create my-app

# This creates:
my-app/
  ├── Chart.yaml              # Chart metadata
  ├── values.yaml             # Default values
  ├── charts/                 # Chart dependencies
  └── templates/              # Kubernetes manifests
      ├── deployment.yaml
      ├── service.yaml
      ├── ingress.yaml
      ├── serviceaccount.yaml
      ├── hpa.yaml
      ├── _helpers.tpl        # Template helpers
      ├── NOTES.txt           # Post-install notes
      └── tests/
          └── test-connection.yaml
```

### Customize Your Chart

Edit `Chart.yaml`:

```yaml
apiVersion: v2
name: my-app
description: A Helm chart for my application
type: application
version: 0.1.0        # Chart version
appVersion: "1.0"     # Application version

# Optional fields
keywords:
  - web
  - nodejs
home: https://github.com/myorg/my-app
sources:
  - https://github.com/myorg/my-app
maintainers:
  - name: Your Name
    email: your.email@example.com
```

Edit `values.yaml`:

```yaml
# Default values for my-app
replicaCount: 1

image:
  repository: myregistry.io/my-app
  pullPolicy: IfNotPresent
  tag: "1.0.0"

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: false
  className: "nginx"
  hosts:
    - host: my-app.local
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 100m
    memory: 128Mi

autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
```

### Validate and Install

```bash
# Lint your chart
helm lint ./my-app

# Validate templates render correctly
helm template my-app ./my-app

# Dry run installation
helm install my-app ./my-app --dry-run --debug

# Install the chart
helm install my-app ./my-app

# Install with custom values
helm install my-app ./my-app -f values-production.yaml
```

## Chart Structure

### Complete Chart Directory Layout

```
my-app/
├── Chart.yaml                 # Chart metadata and dependencies
├── values.yaml                # Default configuration values
├── values-dev.yaml            # Development environment values
├── values-staging.yaml        # Staging environment values
├── values-production.yaml     # Production environment values
├── .helmignore                # Files to ignore when packaging
├── README.md                  # Chart documentation
├── LICENSE                    # Chart license
├── charts/                    # Dependency charts
│   └── mysql-9.3.0.tgz
├── templates/                 # Kubernetes manifest templates
│   ├── NOTES.txt              # User-facing notes
│   ├── _helpers.tpl           # Template helpers
│   ├── deployment.yaml        # Deployment template
│   ├── service.yaml           # Service template
│   ├── ingress.yaml           # Ingress template
│   ├── configmap.yaml         # ConfigMap template
│   ├── secret.yaml            # Secret template
│   ├── serviceaccount.yaml    # ServiceAccount template
│   ├── hpa.yaml               # HorizontalPodAutoscaler
│   ├── networkpolicy.yaml     # NetworkPolicy
│   ├── pvc.yaml               # PersistentVolumeClaim
│   └── tests/                 # Test resources
│       └── test-connection.yaml
└── crds/                      # Custom Resource Definitions
    └── my-custom-resource.yaml
```

### Key Files Explained

#### Chart.yaml

```yaml
apiVersion: v2
name: my-app
description: A comprehensive Helm chart
type: application
version: 1.0.0
appVersion: "2.1.0"

# Dependencies
dependencies:
  - name: postgresql
    version: "12.1.0"
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis
    version: "17.3.0"
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled

# Metadata
keywords:
  - web
  - application
home: https://my-app.example.com
sources:
  - https://github.com/myorg/my-app
maintainers:
  - name: DevOps Team
    email: devops@example.com
```

#### .helmignore

```
# Patterns to ignore when packaging
.git/
.gitignore
.DS_Store
*.md
.vscode/
.idea/
*.tmp
*.bak
```

#### NOTES.txt

```
Thank you for installing {{ .Chart.Name }}!

Your release is named {{ .Release.Name }}.

To access your application:

{{- if .Values.ingress.enabled }}
  Visit: http://{{ (index .Values.ingress.hosts 0).host }}
{{- else if contains "NodePort" .Values.service.type }}
  export NODE_PORT=$(kubectl get --namespace {{ .Release.Namespace }} -o jsonpath="{.spec.ports[0].nodePort}" services {{ include "my-app.fullname" . }})
  export NODE_IP=$(kubectl get nodes --namespace {{ .Release.Namespace }} -o jsonpath="{.items[0].status.addresses[0].address}")
  echo http://$NODE_IP:$NODE_PORT
{{- else if contains "LoadBalancer" .Values.service.type }}
  export SERVICE_IP=$(kubectl get svc --namespace {{ .Release.Namespace }} {{ include "my-app.fullname" . }} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
  echo http://$SERVICE_IP:{{ .Values.service.port }}
{{- end }}

For more information, visit our documentation:
https://docs.example.com/my-app
```

## Values and Templating

### Understanding Values Hierarchy

Values are merged in this order (later values override earlier):

1. `values.yaml` in the chart
2. Values from parent charts
3. Values files specified with `-f` flag
4. Values set with `--set` flag

```bash
# Example showing value precedence
helm install my-app ./my-app \
  -f values.yaml \              # Base values
  -f values-production.yaml \   # Override with production values
  --set replicaCount=5          # Override specific value
```

### Template Syntax

#### Basic Templating

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-deployment
  labels:
    app: {{ .Chart.Name }}
    version: {{ .Chart.AppVersion }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Chart.Name }}
  template:
    metadata:
      labels:
        app: {{ .Chart.Name }}
    spec:
      containers:
      - name: {{ .Chart.Name }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
        ports:
        - containerPort: {{ .Values.service.port }}
```

#### Built-in Objects

```yaml
# Common built-in objects
{{ .Release.Name }}          # Release name
{{ .Release.Namespace }}     # Release namespace
{{ .Release.Service }}       # Service that performed the release
{{ .Release.IsUpgrade }}     # True if this is an upgrade
{{ .Release.IsInstall }}     # True if this is an install

{{ .Chart.Name }}            # Chart name from Chart.yaml
{{ .Chart.Version }}         # Chart version
{{ .Chart.AppVersion }}      # Application version

{{ .Values }}                # Values from values.yaml
{{ .Values.image.repository }}  # Nested values

{{ .Files }}                 # Access files in the chart
{{ .Capabilities }}          # Kubernetes cluster capabilities
```

#### Flow Control

```yaml
# If/Else
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
# ... ingress spec
{{- end }}

# If/Else If/Else
{{- if eq .Values.environment "production" }}
replicas: 3
{{- else if eq .Values.environment "staging" }}
replicas: 2
{{- else }}
replicas: 1
{{- end }}

# With (change scope)
{{- with .Values.image }}
image: {{ .repository }}:{{ .tag }}
{{- end }}

# Range (loops)
{{- range .Values.environments }}
- name: {{ . }}
{{- end }}
```

#### Functions and Pipelines

```yaml
# String functions
name: {{ .Values.name | upper }}              # MYAPP
name: {{ .Values.name | lower }}              # myapp
name: {{ .Values.name | title }}              # Myapp
name: {{ .Values.name | quote }}              # "myapp"
name: {{ .Values.name | trim }}               # Remove whitespace

# Default values
image: {{ .Values.image.tag | default "latest" }}

# Type conversion
replicas: {{ .Values.replicaCount | int }}

# String operations
name: {{ printf "%s-%s" .Release.Name .Chart.Name }}
path: {{ .Values.basePath | trimSuffix "/" }}/api

# Encoding
data:
  config: {{ .Values.config | b64enc }}       # Base64 encode

# Conditionals
{{- if not .Values.ingress.enabled }}
# ...
{{- end }}

{{- if and .Values.persistence.enabled .Values.persistence.size }}
# ...
{{- end }}

{{- if or .Values.usePostgresql .Values.useMysql }}
# ...
{{- end }}
```

#### Template Helpers

`templates/_helpers.tpl`:

```yaml
{{/*
Expand the name of the chart.
*/}}
{{- define "my-app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a fully qualified app name.
*/}}
{{- define "my-app.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "my-app.labels" -}}
helm.sh/chart: {{ include "my-app.chart" . }}
{{ include "my-app.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "my-app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "my-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
```

Using helpers:

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "my-app.fullname" . }}
  labels:
    {{- include "my-app.labels" . | nindent 4 }}
spec:
  selector:
    matchLabels:
      {{- include "my-app.selectorLabels" . | nindent 6 }}
```

## Deployment Workflows

### Development Workflow

```bash
# 1. Create/modify chart
vim my-app/values.yaml

# 2. Validate changes
helm lint ./my-app

# 3. Test template rendering
helm template my-app ./my-app -f values-dev.yaml

# 4. Dry run
helm install my-app ./my-app -f values-dev.yaml --dry-run --debug

# 5. Install to development
helm install my-app ./my-app -f values-dev.yaml -n development --create-namespace

# 6. Make changes and upgrade
helm upgrade my-app ./my-app -f values-dev.yaml -n development

# 7. Watch rollout
kubectl rollout status deployment/my-app -n development
```

### Multi-Environment Deployment

#### Development Environment

`values-dev.yaml`:

```yaml
replicaCount: 1

image:
  tag: "dev-latest"
  pullPolicy: Always

ingress:
  enabled: true
  hosts:
    - host: my-app-dev.example.com

resources:
  limits:
    cpu: 200m
    memory: 256Mi

postgresql:
  enabled: true
  auth:
    database: myapp_dev
```

Deploy:

```bash
helm upgrade --install my-app ./my-app \
  -f values-dev.yaml \
  -n development \
  --create-namespace
```

#### Staging Environment

`values-staging.yaml`:

```yaml
replicaCount: 2

image:
  tag: "v1.0.0-rc1"
  pullPolicy: IfNotPresent

ingress:
  enabled: true
  hosts:
    - host: my-app-staging.example.com
  tls:
    - secretName: my-app-tls
      hosts:
        - my-app-staging.example.com

resources:
  limits:
    cpu: 500m
    memory: 512Mi

postgresql:
  enabled: false  # Use external database

externalDatabase:
  host: staging-db.example.com
  database: myapp_staging
```

Deploy:

```bash
helm upgrade --install my-app ./my-app \
  -f values-staging.yaml \
  -n staging \
  --create-namespace \
  --wait
```

#### Production Environment

`values-production.yaml`:

```yaml
replicaCount: 3

image:
  tag: "v1.0.0"
  pullPolicy: IfNotPresent

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: my-app.example.com
  tls:
    - secretName: my-app-prod-tls
      hosts:
        - my-app.example.com

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

podDisruptionBudget:
  enabled: true
  minAvailable: 2

postgresql:
  enabled: false

externalDatabase:
  host: prod-db.example.com
  database: myapp_production

monitoring:
  enabled: true

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
              - key: app
                operator: In
                values:
                  - my-app
          topologyKey: kubernetes.io/hostname
```

Deploy:

```bash
helm upgrade --install my-app ./my-app \
  -f values-production.yaml \
  -n production \
  --create-namespace \
  --atomic \
  --wait \
  --timeout 10m
```

### CI/CD Integration

#### GitHub Actions Example

`.github/workflows/deploy.yml`:

```yaml
name: Deploy with Helm

on:
  push:
    branches: [main, staging, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up kubectl
        uses: azure/setup-kubectl@v3

      - name: Set up Helm
        uses: azure/setup-helm@v3
        with:
          version: '3.13.0'

      - name: Configure kubeconfig
        run: |
          mkdir -p $HOME/.kube
          echo "${{ secrets.KUBECONFIG }}" | base64 -d > $HOME/.kube/config

      - name: Determine environment
        id: env
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            echo "environment=production" >> $GITHUB_OUTPUT
            echo "values_file=values-production.yaml" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref }}" == "refs/heads/staging" ]]; then
            echo "environment=staging" >> $GITHUB_OUTPUT
            echo "values_file=values-staging.yaml" >> $GITHUB_OUTPUT
          else
            echo "environment=development" >> $GITHUB_OUTPUT
            echo "values_file=values-dev.yaml" >> $GITHUB_OUTPUT
          fi

      - name: Deploy with Helm
        run: |
          helm upgrade --install my-app ./helm/my-app \
            -f ./helm/my-app/${{ steps.env.outputs.values_file }} \
            --set image.tag=${{ github.sha }} \
            -n ${{ steps.env.outputs.environment }} \
            --create-namespace \
            --wait \
            --timeout 5m

      - name: Verify deployment
        run: |
          kubectl rollout status deployment/my-app \
            -n ${{ steps.env.outputs.environment }} \
            --timeout=5m
```

### Rollback Strategy

```bash
# Check release history
helm history my-app -n production

# Rollback to previous version
helm rollback my-app -n production

# Rollback to specific revision
helm rollback my-app 3 -n production

# Rollback with wait
helm rollback my-app --wait --timeout 5m -n production
```

## Helm Best Practices

### Chart Development

#### 1. Use Semantic Versioning

```yaml
# Chart.yaml
version: 1.2.3  # MAJOR.MINOR.PATCH
```

- MAJOR: Breaking changes
- MINOR: New features, backward compatible
- PATCH: Bug fixes

#### 2. Document Everything

```yaml
# values.yaml with comments
# Replica count for the application
# @default -- 1
replicaCount: 1

# Image configuration
image:
  # Container registry and repository
  # @default -- "nginx"
  repository: nginx

  # Image pull policy
  # @default -- "IfNotPresent"
  pullPolicy: IfNotPresent

  # Image tag (defaults to Chart.appVersion)
  # @default -- ""
  tag: ""
```

#### 3. Provide Sensible Defaults

```yaml
# Good defaults that work in most cases
resources:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 100m
    memory: 128Mi

securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000
  capabilities:
    drop:
      - ALL
```

#### 4. Use Labels Consistently

```yaml
# Standard Kubernetes labels
labels:
  app.kubernetes.io/name: {{ include "my-app.name" . }}
  app.kubernetes.io/instance: {{ .Release.Name }}
  app.kubernetes.io/version: {{ .Chart.AppVersion }}
  app.kubernetes.io/managed-by: {{ .Release.Service }}
  app.kubernetes.io/component: web
  app.kubernetes.io/part-of: my-platform
```

#### 5. Make Resources Configurable

```yaml
# Allow users to override any Kubernetes resource
deployment:
  annotations: {}
  labels: {}
  podAnnotations: {}
  podLabels: {}

service:
  annotations: {}
  labels: {}
```

### Security Best Practices

#### 1. Never Hardcode Secrets

```yaml
# Bad
env:
  - name: DATABASE_PASSWORD
    value: "super-secret-password"

# Good - Use secrets
env:
  - name: DATABASE_PASSWORD
    valueFrom:
      secretKeyRef:
        name: {{ .Values.database.existingSecret }}
        key: password

# Better - Use Vault injection (see vault-setup-and-deployment.md)
podAnnotations:
  vault.hashicorp.io/agent-inject: "true"
  vault.hashicorp.io/role: "my-app"
```

#### 2. Run as Non-Root

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000
  capabilities:
    drop:
      - ALL
  readOnlyRootFilesystem: true
```

#### 3. Set Resource Limits

```yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
```

### Performance Best Practices

#### 1. Use Readiness and Liveness Probes

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: http
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: http
  initialDelaySeconds: 5
  periodSeconds: 5
```

#### 2. Configure Pod Disruption Budgets

```yaml
{{- if .Values.podDisruptionBudget.enabled }}
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: {{ include "my-app.fullname" . }}
spec:
  minAvailable: {{ .Values.podDisruptionBudget.minAvailable }}
  selector:
    matchLabels:
      {{- include "my-app.selectorLabels" . | nindent 6 }}
{{- end }}
```

#### 3. Use Anti-Affinity for HA

```yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchLabels:
              app: my-app
          topologyKey: kubernetes.io/hostname
```

## Troubleshooting

### Common Issues

#### 1. Release Already Exists

```bash
# Error: release "my-app" already exists

# Solutions:
# Check existing releases
helm list --all-namespaces

# Uninstall old release
helm uninstall my-app -n namespace

# Or use --replace flag
helm install my-app ./my-app --replace
```

#### 2. Template Rendering Errors

```bash
# Error: template rendering failed

# Debug template rendering
helm template my-app ./my-app --debug

# Check specific template
helm template my-app ./my-app --show-only templates/deployment.yaml

# Validate YAML syntax
helm lint ./my-app
```

#### 3. Values Not Being Applied

```bash
# Check what values are being used
helm get values my-app

# Test with dry-run to see rendered manifests
helm upgrade my-app ./my-app -f values.yaml --dry-run --debug

# Verify value precedence
helm install my-app ./my-app \
  -f values.yaml \
  -f values-override.yaml \
  --set key=value \
  --dry-run --debug
```

#### 4. Dependency Issues

```bash
# Error: dependency chart not found

# Update dependencies
helm dependency update ./my-app

# Build dependencies
helm dependency build ./my-app

# List dependencies
helm dependency list ./my-app
```

#### 5. Upgrade Failures

```bash
# Check release status
helm status my-app

# View release history
helm history my-app

# Check pod status
kubectl get pods -n namespace
kubectl describe pod pod-name -n namespace

# View pod logs
kubectl logs pod-name -n namespace

# Rollback if needed
helm rollback my-app
```

### Debugging Commands

```bash
# Validate chart structure
helm lint ./my-app

# Test template rendering
helm template my-app ./my-app --debug

# Dry-run installation
helm install my-app ./my-app --dry-run --debug

# Get rendered manifest
helm get manifest my-app

# Get all release information
helm get all my-app

# Check Helm release secrets
kubectl get secrets -l owner=helm
kubectl get secret -l name=my-app -o yaml
```

### Enable Debug Logging

```bash
# Install with debug output
helm install my-app ./my-app --debug

# Increase kubectl verbosity
kubectl get pods --v=8
```

## Advanced Topics

### Chart Dependencies

#### Defining Dependencies

`Chart.yaml`:

```yaml
dependencies:
  - name: postgresql
    version: "12.1.0"
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
    tags:
      - database

  - name: redis
    version: "17.3.0"
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled
    tags:
      - cache

  - name: common
    version: "2.x.x"
    repository: https://charts.bitnami.com/bitnami
```

#### Managing Dependencies

```bash
# Download dependencies
helm dependency update ./my-app

# Build dependency packages
helm dependency build ./my-app

# List dependencies
helm dependency list ./my-app
```

#### Configuring Sub-Charts

`values.yaml`:

```yaml
# Parent chart values
replicaCount: 2

# Sub-chart values
postgresql:
  enabled: true
  auth:
    username: myapp
    database: myapp
  primary:
    persistence:
      size: 10Gi

redis:
  enabled: true
  architecture: standalone
  auth:
    enabled: true
```

### Hooks and Tests

#### Pre-Install Hook

`templates/pre-install-job.yaml`:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "my-app.fullname" . }}-pre-install
  annotations:
    "helm.sh/hook": pre-install
    "helm.sh/hook-weight": "-5"
    "helm.sh/hook-delete-policy": hook-succeeded
spec:
  template:
    spec:
      containers:
      - name: pre-install
        image: busybox
        command: ['sh', '-c', 'echo "Running pre-install hook"']
      restartPolicy: Never
```

#### Post-Install Hook

`templates/post-install-job.yaml`:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "my-app.fullname" . }}-post-install
  annotations:
    "helm.sh/hook": post-install,post-upgrade
    "helm.sh/hook-weight": "0"
    "helm.sh/hook-delete-policy": hook-succeeded
spec:
  template:
    spec:
      containers:
      - name: db-migration
        image: {{ .Values.image.repository }}:{{ .Values.image.tag }}
        command: ['npm', 'run', 'migrate']
      restartPolicy: Never
```

#### Available Hooks

- `pre-install`: Before any resources are installed
- `post-install`: After all resources are installed
- `pre-delete`: Before any resources are deleted
- `post-delete`: After all resources are deleted
- `pre-upgrade`: Before any resources are upgraded
- `post-upgrade`: After all resources are upgraded
- `pre-rollback`: Before any resources are rolled back
- `post-rollback`: After all resources are rolled back
- `test`: When `helm test` is invoked

#### Test Files

`templates/tests/test-connection.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: {{ include "my-app.fullname" . }}-test-connection
  annotations:
    "helm.sh/hook": test
spec:
  containers:
  - name: wget
    image: busybox
    command: ['wget']
    args: ['{{ include "my-app.fullname" . }}:{{ .Values.service.port }}']
  restartPolicy: Never
```

Run tests:

```bash
# Run all tests
helm test my-app

# View test logs
helm test my-app --logs
```

### Chart Repositories

#### Creating a Chart Repository

```bash
# Package your chart
helm package ./my-app

# Create repository index
helm repo index . --url https://charts.example.com

# This creates index.yaml
```

#### Using Private Repositories

```bash
# Add private repository with authentication
helm repo add my-repo https://charts.example.com \
  --username user \
  --password pass

# Or use repo with basic auth in URL
helm repo add my-repo https://user:pass@charts.example.com
```

#### Publishing to GitHub Pages

```bash
# 1. Package chart
helm package ./my-app -d docs/

# 2. Update index
helm repo index docs/ --url https://myorg.github.io/charts

# 3. Commit and push
git add docs/
git commit -m "Release new chart version"
git push

# 4. Enable GitHub Pages in repository settings

# 5. Add repository
helm repo add myorg https://myorg.github.io/charts
```

### OCI Registry Support

Helm 3 supports OCI (Open Container Initiative) registries:

```bash
# Login to registry
helm registry login registry.example.com

# Package and push chart
helm package ./my-app
helm push my-app-1.0.0.tgz oci://registry.example.com/charts

# Install from OCI registry
helm install my-app oci://registry.example.com/charts/my-app --version 1.0.0

# Pull chart from OCI registry
helm pull oci://registry.example.com/charts/my-app --version 1.0.0
```

### Using Helm with This Project

This project already includes Helm charts. Here's how to use them:

```bash
# Navigate to Helm chart directory
cd helm/nextjs-app

# View available values files
ls values*.yaml

# Deploy to development
helm upgrade --install nextjs-app . \
  -f values-feature.yaml \
  -n development \
  --create-namespace

# Deploy to production
helm upgrade --install nextjs-app . \
  -f values-production.yaml \
  -n nextjs-frontend-template \
  --create-namespace

# Check deployment
helm list -n nextjs-frontend-template
kubectl get pods -n nextjs-frontend-template
```

## Additional Resources

### Official Documentation

- [Helm Documentation](https://helm.sh/docs/)
- [Helm Best Practices](https://helm.sh/docs/chart_best_practices/)
- [Chart Template Guide](https://helm.sh/docs/chart_template_guide/)
- [Helm Chart Repository Guide](https://helm.sh/docs/topics/chart_repository/)

### Tutorials and Guides

- [Creating Your First Chart](https://helm.sh/docs/chart_template_guide/getting_started/)
- [Debugging Templates](https://helm.sh/docs/chart_template_guide/debugging/)
- [Helm Hooks Guide](https://helm.sh/docs/topics/charts_hooks/)
- [Dependency Management](https://helm.sh/docs/helm/helm_dependency/)

### Chart Repositories

- [Artifact Hub](https://artifacthub.io/) - Discover charts
- [Bitnami Charts](https://github.com/bitnami/charts)
- [Helm Stable Charts](https://github.com/helm/charts)

### Related Documentation

- [Kubernetes Setup Guide](./kubernetes-setup.md)
- [Vault Setup and Deployment](./vault-setup-and-deployment.md)
- [Cloudflare GitHub Setup](./cloudflare-github-setup.md)

### Tools and Plugins

- [helm-diff](https://github.com/databus23/helm-diff) - Preview upgrade changes
- [helm-secrets](https://github.com/jkroepke/helm-secrets) - Encrypt secrets in charts
- [helmfile](https://github.com/helmfile/helmfile) - Declarative Helm deployment
- [chart-testing](https://github.com/helm/chart-testing) - Test Helm charts

### Community

- [Helm Slack](https://slack.k8s.io/) - #helm-users channel
- [Helm GitHub](https://github.com/helm/helm)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/kubernetes-helm)

## Quick Reference

### Essential Commands Cheat Sheet

```bash
# Installation
helm install [NAME] [CHART] [flags]
helm install my-app ./my-chart
helm install my-app bitnami/nginx
helm install my-app ./my-chart -f values.yaml --set key=value

# Upgrade
helm upgrade [NAME] [CHART] [flags]
helm upgrade my-app ./my-chart
helm upgrade --install my-app ./my-chart  # Install if not exists

# Rollback
helm rollback [NAME] [REVISION]
helm rollback my-app 1

# Uninstall
helm uninstall [NAME]
helm uninstall my-app --keep-history

# List releases
helm list
helm list --all-namespaces
helm list --all  # Include uninstalled

# Get information
helm status [NAME]
helm get values [NAME]
helm get manifest [NAME]
helm get all [NAME]
helm history [NAME]

# Repository management
helm repo add [NAME] [URL]
helm repo update
helm repo list
helm search repo [KEYWORD]

# Chart management
helm create [NAME]
helm package [CHART]
helm lint [CHART]
helm template [NAME] [CHART]

# Testing
helm test [NAME]
helm test [NAME] --logs

# Dependencies
helm dependency update [CHART]
helm dependency build [CHART]
helm dependency list [CHART]
```

---

**Next Steps:**

1. Install Helm on your local machine
2. Set up a Kubernetes cluster (see [Kubernetes Setup Guide](./kubernetes-setup.md))
3. Create your first chart
4. Deploy applications using environment-specific values files
5. Integrate with CI/CD pipeline
6. Set up Vault for secrets management (see [Vault Setup Guide](./vault-setup-and-deployment.md))

For questions or issues, refer to the [Official Helm Documentation](https://helm.sh/docs/) or consult the [troubleshooting section](#troubleshooting).
