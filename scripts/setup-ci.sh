#!/bin/bash

# CI/CD setup for repositories created from nextjs-frontend-template.
#
# Generates .github/workflows/ wired to the shared reusable workflows in
# NUH-Clinical-Innovation-Office/ci-workflows, matching the setup that is
# already running in NUH-Clinical-Innovation-Office/pre-consult.
#
# The template ships self-contained workflows targeting a self-hosted NodePort
# cluster. Those are a different architecture from the shared AWS EKS pipeline
# and cannot be merged with it, so this script replaces them. Anything it
# overwrites is moved to .github/workflows-backup/ first.

set -euo pipefail

RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
BLUE=$'\033[0;34m'
NC=$'\033[0m'

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Repo root, regardless of where the script is invoked from.
REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$REPO_ROOT"

WORKFLOW_DIR=".github/workflows"
BACKUP_DIR=".github/workflows-backup"

# Reusable workflows are pinned to a tag, never to a moving branch.
CI_WORKFLOWS_REF="v1"
CI_WORKFLOWS="NUH-Clinical-Innovation-Office/ci-workflows"

# Reads a package.json script name and reports whether it exists.
has_script() {
    local script_name=$1
    node -e "process.exit(require('./package.json').scripts?.['${script_name}'] ? 0 : 1)" 2>/dev/null
}

# Prompts with a default, echoing the answer.
prompt_with_default() {
    local prompt_text=$1
    local default_value=$2
    local answer
    read -r -p "${prompt_text} (default: ${default_value}): " answer
    echo "${answer:-$default_value}"
}

require_prerequisites() {
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Run this from the repository root."
        exit 1
    fi

    if ! command -v node >/dev/null 2>&1; then
        print_error "node is required to read package.json"
        exit 1
    fi

    if [ ! -f "Dockerfile" ]; then
        print_warning "No Dockerfile found. The image build job will fail until one exists."
    fi
}

# Moves existing workflows aside so nothing is silently destroyed.
backup_existing_workflows() {
    if [ ! -d "$WORKFLOW_DIR" ] || [ -z "$(ls -A "$WORKFLOW_DIR" 2>/dev/null)" ]; then
        return 0
    fi

    print_warning "Existing workflows found in ${WORKFLOW_DIR}:"
    ls -1 "$WORKFLOW_DIR" | sed 's/^/    /'
    echo ""

    local confirm
    read -r -p "Move these to ${BACKUP_DIR} and replace them? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        print_warning "Setup cancelled. No files were changed."
        exit 0
    fi

    mkdir -p "$BACKUP_DIR"
    # `mv` per-file so a re-run does not fail on an existing backup dir.
    for file in "$WORKFLOW_DIR"/*; do
        [ -e "$file" ] || continue
        mv -f "$file" "$BACKUP_DIR/"
    done
    print_success "Backed up previous workflows to ${BACKUP_DIR}"
}

write_pull_request_workflow() {
    cat > "${WORKFLOW_DIR}/pull-request.yml" <<YAML
name: Pull Request CI

# Quality checks and an image build for pull requests. There is no deploy job
# and no deploy credentials are referenced.
#
# \`pull_request\` (not \`pull_request_target\`) is deliberate: on \`pull_request\`,
# fork PRs run without access to secrets and with a read-only GITHUB_TOKEN.
# Switching to \`pull_request_target\` would execute PR-author-controlled code
# with access to repository secrets. Do not change this trigger.

on:
  pull_request:
    branches: [main]

jobs:
  quality-checks:
    name: Quality Checks
    permissions:
      contents: read
    uses: ${CI_WORKFLOWS}/.github/workflows/build-node.yml@${CI_WORKFLOWS_REF}
    with:
      run_test: ${RUN_TEST}
      run_knip: ${RUN_KNIP}
      run_check_api: ${RUN_CHECK_API}
    secrets: inherit

  docker-build:
    name: Build Docker Image
    needs: quality-checks
    permissions:
      contents: read
      packages: write
    uses: ${CI_WORKFLOWS}/.github/workflows/docker-build-push.yml@${CI_WORKFLOWS_REF}
    with:
      platforms: ${PLATFORMS}
      runner: ${RUNNER}
    secrets: inherit

  security-scan:
    name: Security Scan
    needs: docker-build
    permissions:
      contents: read
      packages: read
      security-events: write
    uses: ${CI_WORKFLOWS}/.github/workflows/security-scan.yml@${CI_WORKFLOWS_REF}
    with:
      image_tag: \${{ needs.docker-build.outputs.image_tag }}
      severity: CRITICAL
      runner: ${RUNNER}
      trivy_platform: ${TRIVY_PLATFORM}
      upload_sarif: false
    secrets: inherit
YAML
    print_success "Created ${WORKFLOW_DIR}/pull-request.yml"
}

write_ci_workflow() {
    cat > "${WORKFLOW_DIR}/ci.yml" <<YAML
name: Main Branch CI/CD

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  quality-checks:
    name: Quality Checks
    permissions:
      contents: read
    uses: ${CI_WORKFLOWS}/.github/workflows/build-node.yml@${CI_WORKFLOWS_REF}
    with:
      run_test: ${RUN_TEST}
      run_knip: ${RUN_KNIP}
      run_check_api: ${RUN_CHECK_API}
    secrets: inherit

  docker-build:
    name: Build Docker Image
    needs: quality-checks
    permissions:
      contents: read
      packages: write
    uses: ${CI_WORKFLOWS}/.github/workflows/docker-build-push.yml@${CI_WORKFLOWS_REF}
    with:
      platforms: ${PLATFORMS}
      runner: ${RUNNER}
    secrets: inherit

  security-scan:
    name: Security Scan
    needs: docker-build
    permissions:
      contents: read
      packages: read
      security-events: write
    uses: ${CI_WORKFLOWS}/.github/workflows/security-scan.yml@${CI_WORKFLOWS_REF}
    with:
      image_tag: \${{ needs.docker-build.outputs.image_tag }}
      severity: CRITICAL
      runner: ${RUNNER}
      trivy_platform: ${TRIVY_PLATFORM}
      upload_sarif: false
    secrets: inherit
YAML

    if [ "$ENABLE_DEPLOY" = "true" ]; then
        # Deploy consumes versioned_tag (branch-sha), not image_tag, because the
        # Helm chart takes a bare tag rather than a full registry reference.
        cat >> "${WORKFLOW_DIR}/ci.yml" <<YAML

  development-deploy:
    name: Deploy to Development
    needs: [docker-build, security-scan]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: read
      deployments: write
      id-token: write
    uses: ./.github/workflows/development-deploy.yml
    with:
      image_tag: \${{ needs.docker-build.outputs.versioned_tag }}
      registry: ghcr.io
      namespace: ${K8S_NAMESPACE}
    secrets:
      AWS_DEV_DEPLOY_ROLE_ARN: \${{ secrets.AWS_DEV_DEPLOY_ROLE_ARN }}
YAML
    fi

    print_success "Created ${WORKFLOW_DIR}/ci.yml"
}

write_development_deploy_workflow() {
    cat > "${WORKFLOW_DIR}/development-deploy.yml" <<YAML
name: Development Deploy (AWS EKS)

on:
  workflow_dispatch:
    inputs:
      image_tag:
        description: "Immutable versioned image tag to deploy"
        required: true
        type: string
  workflow_call:
    inputs:
      image_tag:
        description: "Immutable versioned image tag to deploy"
        required: true
        type: string
      registry:
        required: false
        type: string
        default: ghcr.io
      image_name:
        required: false
        type: string
        default: ""
      namespace:
        required: false
        type: string
        default: ${K8S_NAMESPACE}
    secrets:
      AWS_DEV_DEPLOY_ROLE_ARN:
        required: true

jobs:
  deploy:
    name: Deploy to AWS EKS Development
    permissions:
      contents: read
      packages: read
      id-token: write
    uses: ${CI_WORKFLOWS}/.github/workflows/deploy-eks-helm.yml@${CI_WORKFLOWS_REF}
    with:
      image_tag: \${{ inputs.image_tag }}
      environment_name: development
      environment_url: ${ENVIRONMENT_URL}
      aws_region: ${AWS_REGION}
      eks_cluster_name: ${EKS_CLUSTER}
      namespace: \${{ inputs.namespace || '${K8S_NAMESPACE}' }}
      helm_chart_path: ${HELM_CHART_PATH}
      helm_values_file: ${HELM_VALUES_FILE}
      chart_release_name: ${RELEASE_NAME}
      required_rollout_deployments: ${RELEASE_NAME}
    secrets:
      AWS_DEV_DEPLOY_ROLE_ARN: \${{ secrets.AWS_DEV_DEPLOY_ROLE_ARN }}
YAML
    print_success "Created ${WORKFLOW_DIR}/development-deploy.yml"
}

write_image_cleanup_workflow() {
    cat > "${WORKFLOW_DIR}/image-cleanup.yml" <<YAML
name: Container Image Cleanup

on:
  schedule:
    # Run every Sunday at 2 AM UTC
    - cron: "0 2 * * 0"
  workflow_dispatch: # Allow manual trigger

jobs:
  cleanup:
    name: Cleanup Old Container Images
    permissions:
      packages: write
      contents: read
    uses: ${CI_WORKFLOWS}/.github/workflows/image-cleanup.yml@${CI_WORKFLOWS_REF}
    with:
      keep_latest_production: 3
    secrets: inherit
YAML
    print_success "Created ${WORKFLOW_DIR}/image-cleanup.yml"
}

print_next_steps() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                    CI Setup Complete! 🎉                   ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    print_info "Generated workflows:"
    echo "    ${WORKFLOW_DIR}/pull-request.yml   - PR quality checks, build, scan"
    echo "    ${WORKFLOW_DIR}/ci.yml             - main branch pipeline"
    if [ "$ENABLE_DEPLOY" = "true" ]; then
        echo "    ${WORKFLOW_DIR}/development-deploy.yml - AWS EKS deploy"
    fi
    echo "    ${WORKFLOW_DIR}/image-cleanup.yml  - weekly GHCR pruning"
    echo ""
    print_info "Before the first run, confirm in GitHub:"
    echo "    1. Settings > Actions > General > Workflow permissions"
    echo "       allows access to the ${CI_WORKFLOWS} repository."
    if [ "$ENABLE_DEPLOY" = "true" ]; then
        echo "    2. Repository secret AWS_DEV_DEPLOY_ROLE_ARN is set to the"
        echo "       OIDC role ARN that GitHub Actions assumes."
        echo "    3. A 'development' environment exists (Settings > Environments)."
        echo "    4. The Helm chart at ${HELM_CHART_PATH} has a values file at"
        echo "       ${HELM_VALUES_FILE} and a deployment named ${RELEASE_NAME}."
    fi
    echo ""
    if [ -d "$BACKUP_DIR" ]; then
        print_warning "Previous workflows are in ${BACKUP_DIR} — delete once you are happy."
    fi
    echo ""
    print_info "Validate locally with: bunx action-validator ${WORKFLOW_DIR}/ci.yml"
}

main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║              CI/CD Setup — Shared Workflows                ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""

    require_prerequisites

    local default_name
    default_name=$(node -p "require('./package.json').name" 2>/dev/null || basename "$(pwd)")

    PROJECT_NAME=$(prompt_with_default "Project name" "$default_name")
    if [[ ! "$PROJECT_NAME" =~ ^[a-z0-9-]+$ ]]; then
        print_error "Project name must contain only lowercase letters, numbers, and hyphens"
        exit 1
    fi
    echo ""

    # Detect which optional quality gates this repo can actually run, so the
    # generated workflow never enables a script that does not exist.
    RUN_TEST=false
    RUN_KNIP=false
    RUN_CHECK_API=false
    has_script "test" && RUN_TEST=true
    has_script "knip" && RUN_KNIP=true
    has_script "check:api" && RUN_CHECK_API=true

    print_info "Detected quality gates from package.json:"
    echo "    test:      ${RUN_TEST}"
    echo "    knip:      ${RUN_KNIP}"
    echo "    check:api: ${RUN_CHECK_API}"
    echo "    (lint and type-check always run)"
    echo ""

    local arch
    arch=$(prompt_with_default "Build architecture [arm64/amd64]" "arm64")
    case "$arch" in
        arm64)
            PLATFORMS="linux/arm64"
            TRIVY_PLATFORM="linux/arm64"
            RUNNER="ubuntu-24.04-arm"
            ;;
        amd64)
            PLATFORMS="linux/amd64"
            TRIVY_PLATFORM="linux/amd64"
            RUNNER="ubuntu-latest"
            ;;
        *)
            print_error "Architecture must be 'arm64' or 'amd64'"
            exit 1
            ;;
    esac
    print_success "Building ${PLATFORMS} on ${RUNNER}"
    echo ""

    local deploy_answer
    read -r -p "Add an AWS EKS development deploy job? (y/N): " deploy_answer
    ENABLE_DEPLOY=false
    if [[ "$deploy_answer" =~ ^[Yy]$ ]]; then
        ENABLE_DEPLOY=true
    fi

    if [ "$ENABLE_DEPLOY" = "true" ]; then
        echo ""
        K8S_NAMESPACE=$(prompt_with_default "Kubernetes namespace" "$PROJECT_NAME")
        RELEASE_NAME=$(prompt_with_default "Helm release / deployment name" "$PROJECT_NAME")
        EKS_CLUSTER=$(prompt_with_default "EKS cluster name" "dev")
        AWS_REGION=$(prompt_with_default "AWS region" "ap-southeast-1")
        ENVIRONMENT_URL=$(prompt_with_default "Environment URL" "https://${PROJECT_NAME}.russellgpt.com")

        # The template ships its chart at helm/nextjs-app and setup.sh does not
        # rename the directory, so default to whatever is actually on disk.
        local default_chart="./helm/nextjs-app"
        if [ ! -d "helm/nextjs-app" ]; then
            local found_chart
            found_chart=$(find helm -maxdepth 2 -name Chart.yaml 2>/dev/null | head -1)
            if [ -n "$found_chart" ]; then
                default_chart="./$(dirname "$found_chart")"
            fi
        fi
        HELM_CHART_PATH=$(prompt_with_default "Helm chart path" "$default_chart")

        if [ ! -d "$HELM_CHART_PATH" ]; then
            print_warning "Chart directory ${HELM_CHART_PATH} does not exist yet."
        fi

        local default_values="${HELM_CHART_PATH}/values-development.yaml"
        if [ ! -f "$default_values" ] && [ -f "${HELM_CHART_PATH}/values-staging.yaml" ]; then
            default_values="${HELM_CHART_PATH}/values-staging.yaml"
        fi
        HELM_VALUES_FILE=$(prompt_with_default "Helm values file" "$default_values")

        if [ ! -f "$HELM_VALUES_FILE" ]; then
            print_warning "Values file ${HELM_VALUES_FILE} does not exist yet — create it before deploying."
        fi
    fi

    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                   Configuration Summary                    ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "  Project:        ${PROJECT_NAME}"
    echo "  Platforms:      ${PLATFORMS}"
    echo "  Runner:         ${RUNNER}"
    echo "  Shared ref:     ${CI_WORKFLOWS}@${CI_WORKFLOWS_REF}"
    echo "  Deploy job:     ${ENABLE_DEPLOY}"
    if [ "$ENABLE_DEPLOY" = "true" ]; then
        echo "  Namespace:      ${K8S_NAMESPACE}"
        echo "  Release:        ${RELEASE_NAME}"
        echo "  Cluster:        ${EKS_CLUSTER} (${AWS_REGION})"
        echo "  Chart:          ${HELM_CHART_PATH}"
        echo "  Values:         ${HELM_VALUES_FILE}"
    fi
    echo ""

    local confirm
    read -r -p "Proceed? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        print_warning "Setup cancelled"
        exit 0
    fi

    echo ""
    backup_existing_workflows
    mkdir -p "$WORKFLOW_DIR"

    write_pull_request_workflow
    write_ci_workflow
    write_image_cleanup_workflow
    if [ "$ENABLE_DEPLOY" = "true" ]; then
        write_development_deploy_workflow
    fi

    print_next_steps
}

main "$@"
