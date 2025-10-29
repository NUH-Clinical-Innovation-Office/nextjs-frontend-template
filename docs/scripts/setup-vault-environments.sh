#!/bin/bash

# Setup Vault secrets for development, staging, and production environments
# This script creates secrets at the paths expected by the Helm charts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vault configuration
VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
VAULT_TOKEN="${VAULT_TOKEN:-}"

echo -e "${YELLOW}Setting up Vault environment secrets...${NC}"
echo "Vault Address: $VAULT_ADDR"

# Check if vault is accessible
if ! command -v vault &> /dev/null; then
    echo -e "${RED}Error: vault CLI not found. Please install Vault.${NC}"
    exit 1
fi

# Login to Vault (if token not set)
if [ -z "$VAULT_TOKEN" ]; then
    echo -e "${YELLOW}Please provide your Vault root token:${NC}"
    read -s VAULT_TOKEN
    export VAULT_TOKEN
fi

# Function to create secrets for an environment
create_environment_secrets() {
    local ENV=$1
    local PATH="secret/data/nextjs-frontend-template/${ENV}"

    echo -e "\n${YELLOW}Creating secrets for ${ENV} environment...${NC}"

    # Prompt for secrets
    echo "Enter NEXTAUTH_URL (e.g., https://${ENV}.example.com):"
    read NEXTAUTH_URL

    echo "Enter NEXTAUTH_SECRET (or press Enter to generate):"
    read NEXTAUTH_SECRET
    if [ -z "$NEXTAUTH_SECRET" ]; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        echo -e "${GREEN}Generated NEXTAUTH_SECRET${NC}"
    fi

    echo "Enter DATABASE_URL (e.g., postgresql://user:pass@host:5432/db):"
    read DATABASE_URL

    echo "Enter API_URL (e.g., https://api-${ENV}.example.com):"
    read API_URL

    # Create secret in Vault
    vault kv put "${PATH}" \
        NEXTAUTH_URL="${NEXTAUTH_URL}" \
        NEXTAUTH_SECRET="${NEXTAUTH_SECRET}" \
        DATABASE_URL="${DATABASE_URL}" \
        API_URL="${API_URL}"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Successfully created secrets for ${ENV}${NC}"
    else
        echo -e "${RED}✗ Failed to create secrets for ${ENV}${NC}"
        exit 1
    fi
}

# Enable KV secrets engine if not already enabled
echo -e "\n${YELLOW}Ensuring KV secrets engine is enabled...${NC}"
vault secrets enable -path=secret kv-v2 2>/dev/null || echo "KV secrets engine already enabled"

# Create secrets for each environment
echo -e "\n${YELLOW}=== Development Environment ===${NC}"
create_environment_secrets "development"

echo -e "\n${YELLOW}=== Staging Environment ===${NC}"
create_environment_secrets "staging"

echo -e "\n${YELLOW}=== Production Environment ===${NC}"
create_environment_secrets "production"

echo -e "\n${GREEN}✓ All environment secrets created successfully!${NC}"
echo -e "\n${YELLOW}Verifying secrets...${NC}"

# Verify secrets were created
for env in development staging production; do
    echo -e "\n${YELLOW}Secrets in ${env}:${NC}"
    vault kv get "secret/nextjs-frontend-template/${env}" || echo -e "${RED}Failed to retrieve ${env} secrets${NC}"
done

echo -e "\n${GREEN}Setup complete!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Deploy your Helm chart with the appropriate values file:"
echo "   helm upgrade --install nextjs-app ./helm/nextjs-app -f ./helm/nextjs-app/values-development.yaml"
echo "2. Verify the Vault agent injection is working in the pod"
