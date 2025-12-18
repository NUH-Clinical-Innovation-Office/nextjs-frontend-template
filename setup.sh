#!/bin/bash

set -e

# Colors for output
RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
BLUE=$'\033[0;34m'
NC=$'\033[0m' # No Color

# Function to print colored output
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

# Function to get parent directory name
get_parent_dir_name() {
    basename "$(pwd)"
}

# Function to validate port number
validate_port() {
    local port=$1
    if ! [[ "$port" =~ ^[0-9]+$ ]] || [ "$port" -lt 30000 ] || [ "$port" -gt 32767 ]; then
        return 1
    fi
    return 0
}

# Function to replace text in file
replace_in_file() {
    local file=$1
    local old_text=$2
    local new_text=$3

    if [ -f "$file" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|${old_text}|${new_text}|g" "$file"
        else
            # Linux
            sed -i "s|${old_text}|${new_text}|g" "$file"
        fi
        print_success "Updated $file"
    else
        print_warning "File not found: $file"
    fi
}

# Main setup function
main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║       Next.js Frontend Template Setup Script              ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""

    # Get current parent directory name
    DEFAULT_PROJECT_NAME=$(get_parent_dir_name)

    # Prompt for project name
    print_info "Current directory: ${BLUE}${DEFAULT_PROJECT_NAME}${NC}"
    read -p "Enter project name (default: ${DEFAULT_PROJECT_NAME}): " PROJECT_NAME
    PROJECT_NAME=${PROJECT_NAME:-$DEFAULT_PROJECT_NAME}

    # Validate project name (basic validation)
    if [[ ! "$PROJECT_NAME" =~ ^[a-z0-9-]+$ ]]; then
        print_error "Project name must contain only lowercase letters, numbers, and hyphens"
        exit 1
    fi

    print_success "Project name set to: ${GREEN}${PROJECT_NAME}${NC}"
    echo ""

    # Prompt for staging port
    print_info "NodePort range: 30000-32767 (recommended: 30001-32000)"
    read -p "Enter staging environment NodePort (default: 30002): " STAGING_PORT
    STAGING_PORT=${STAGING_PORT:-30002}

    if ! validate_port "$STAGING_PORT"; then
        print_error "Invalid port number. Must be between 30000 and 32767"
        exit 1
    fi

    print_success "Staging port set to: ${GREEN}${STAGING_PORT}${NC}"

    # Prompt for production port
    read -p "Enter production environment NodePort (default: 30001): " PRODUCTION_PORT
    PRODUCTION_PORT=${PRODUCTION_PORT:-30001}

    if ! validate_port "$PRODUCTION_PORT"; then
        print_error "Invalid port number. Must be between 30000 and 32767"
        exit 1
    fi

    if [ "$STAGING_PORT" -eq "$PRODUCTION_PORT" ]; then
        print_error "Staging and production ports must be different"
        exit 1
    fi

    print_success "Production port set to: ${GREEN}${PRODUCTION_PORT}${NC}"
    echo ""

    # Confirmation
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                    Configuration Summary                  ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "  Project Name:       ${BLUE}${PROJECT_NAME}${NC}"
    echo "  Staging Port:       ${BLUE}${STAGING_PORT}${NC}"
    echo "  Production Port:    ${BLUE}${PRODUCTION_PORT}${NC}"
    echo ""

    read -p "Proceed with setup? (y/N): " CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
        print_warning "Setup cancelled"
        exit 0
    fi

    echo ""
    print_info "Starting configuration updates..."
    echo ""

    # Update package.json
    replace_in_file "package.json" "nextjs-frontend-template" "$PROJECT_NAME"

    # Update Dockerfile
    replace_in_file "Dockerfile" "https://github.com/NUH-Clinical-Innovation-Office/nextjs-frontend-template" "https://github.com/YOUR-ORG/${PROJECT_NAME}"

    # Update Helm values files
    replace_in_file "helm/nextjs-app/values.yaml" "nextjs-frontend-template" "$PROJECT_NAME"
    replace_in_file "helm/nextjs-app/values-feature.yaml" "nextjs-frontend-template" "$PROJECT_NAME"
    replace_in_file "helm/nextjs-app/values-staging.yaml" "nextjs-frontend-template" "$PROJECT_NAME"
    replace_in_file "helm/nextjs-app/values-production.yaml" "nextjs-frontend-template" "$PROJECT_NAME"

    # Update ports in staging and production values
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/nodePort: 30002/nodePort: ${STAGING_PORT}/g" "helm/nextjs-app/values-staging.yaml"
        sed -i '' "s/nodePort: 30001/nodePort: ${PRODUCTION_PORT}/g" "helm/nextjs-app/values-production.yaml"
    else
        sed -i "s/nodePort: 30002/nodePort: ${STAGING_PORT}/g" "helm/nextjs-app/values-staging.yaml"
        sed -i "s/nodePort: 30001/nodePort: ${PRODUCTION_PORT}/g" "helm/nextjs-app/values-production.yaml"
    fi
    print_success "Updated port configurations"

    # Update README.md
    replace_in_file "README.md" "nextjs-frontend-template" "$PROJECT_NAME"

    # Update documentation files in docs/
    if [ -d "docs" ]; then
        find docs -type f -name "*.md" -exec bash -c 'file="$1"; sed -i'"'"''"'"' "s/nextjs-frontend-template/'"$PROJECT_NAME"'/g" "$file" 2>/dev/null || sed -i "s/nextjs-frontend-template/'"$PROJECT_NAME"'/g" "$file" 2>/dev/null' _ {} \;
        print_success "Updated documentation files"
    fi

    # Update Vault setup script if it exists
    if [ -f "docs/scripts/setup-vault-environments.sh" ]; then
        replace_in_file "docs/scripts/setup-vault-environments.sh" "nextjs-frontend-template" "$PROJECT_NAME"
    fi

    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                    Setup Complete! 🎉                      ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    print_success "Project name: ${GREEN}${PROJECT_NAME}${NC}"
    print_success "Staging port: ${GREEN}${STAGING_PORT}${NC}"
    print_success "Production port: ${GREEN}${PRODUCTION_PORT}${NC}"
    echo ""
    print_info "Next steps:"
    echo "  1. Update the GitHub repository URL in Dockerfile (line 29)"
    echo "  2. Review and update .env.example if needed"
    echo "  3. Update GitHub secrets and variables for CI/CD"
    echo "  4. Run: ${BLUE}npm install${NC}"
    echo "  5. Run: ${BLUE}npm run dev${NC} to start development"
    echo ""
    print_warning "Note: This script updated files throughout the repository."
    print_warning "Please review changes before committing."
    echo ""
}

# Run main function
main
