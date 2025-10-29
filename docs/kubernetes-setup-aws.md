# Kubernetes Setup on AWS with Terraform

This guide will walk you through setting up a production-ready Kubernetes cluster on AWS using EKS (Elastic Kubernetes Service) with Terraform for infrastructure as code. This approach provides a fully managed, scalable, and highly available Kubernetes environment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Setup Steps](#setup-steps)
- [Terraform Configuration](#terraform-configuration)
- [Connecting from Local Machine](#connecting-from-local-machine)
- [Verification](#verification)
- [Cost Management](#cost-management)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Prerequisites

### Required Tools

Install the following tools on your local machine:

#### 1. AWS CLI

```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version
```

#### 2. kubectl

```bash
# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verify installation
kubectl version --client
```

#### 3. Terraform

```bash
# macOS
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Linux
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# Verify installation
terraform --version
```

#### 4. eksctl (Optional but helpful)

```bash
# macOS
brew install eksctl

# Linux
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Verify installation
eksctl version
```

### AWS Account Setup

#### 1. Create AWS Account

- Sign up at [https://aws.amazon.com/](https://aws.amazon.com/)
- Enable billing alerts
- Set up MFA for root account

#### 2. Create IAM User for Terraform

```bash
# Login to AWS Console
# Navigate to IAM → Users → Create User

# Required permissions for the user:
# - AmazonEKSClusterPolicy
# - AmazonEKSWorkerNodePolicy
# - AmazonEKSServicePolicy
# - AmazonEC2FullAccess
# - AmazonVPCFullAccess
# - IAMFullAccess (or specific EKS IAM permissions)
```

Or use AWS CLI:

```bash
# Create IAM user
aws iam create-user --user-name terraform-eks-user

# Attach policies
aws iam attach-user-policy --user-name terraform-eks-user --policy-arn arn:aws:iam::aws:policy/AmazonEKSClusterPolicy
aws iam attach-user-policy --user-name terraform-eks-user --policy-arn arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy
aws iam attach-user-policy --user-name terraform-eks-user --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess
aws iam attach-user-policy --user-name terraform-eks-user --policy-arn arn:aws:iam::aws:policy/AmazonVPCFullAccess

# Create access keys
aws iam create-access-key --user-name terraform-eks-user
```

#### 3. Configure AWS CLI

```bash
# Configure AWS credentials
aws configure

# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1, ap-southeast-1)
# - Default output format (json)

# Verify configuration
aws sts get-caller-identity
```

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                           AWS CLOUD                            │
│                     Region: ap-southeast-1                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   VPC (10.0.0.0/16)                      │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │        EKS Control Plane (Managed by AWS)          │  │  │
│  │  │  • API Server                                      │  │  │
│  │  │  • etcd                                            │  │  │
│  │  │  • Controller Manager                              │  │  │
│  │  │  • Scheduler                                       │  │  │
│  │  └─────────────────────────┬──────────────────────────┘  │  │
│  │                            │                             │  │
│  │  ┌─────────────────────────┴──────────────────────────┐  │  │
│  │  │       Availability Zone ap-southeast-1a            │  │  │
│  │  │  Public Subnet (10.0.1.0/24)                       │  │  │
│  │  │  ┌─────────────┐                                   │  │  │
│  │  │  │   NAT GW    │                                   │  │  │
│  │  │  └──────┬──────┘                                   │  │  │
│  │  │  Private Subnet (10.0.11.0/24)                     │  │  │
│  │  │  ┌──────▼───────┐  ┌─────────────┐                 │  │  │
│  │  │  │  EKS Node 1  │  │ EKS Node 2  │                 │  │  │
│  │  │  │  (t3.medium) │  │ (t3.medium) │                 │  │  │
│  │  │  └──────────────┘  └─────────────┘                 │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │       Availability Zone ap-southeast-1b            │  │  │
│  │  │  Public Subnet (10.0.2.0/24)                       │  │  │
│  │  │  ┌─────────────┐                                   │  │  │
│  │  │  │   NAT GW    │                                   │  │  │
│  │  │  └──────┬──────┘                                   │  │  │
│  │  │  Private Subnet (10.0.12.0/24)                     │  │  │
│  │  │  ┌──────▼───────┐  ┌─────────────┐                 │  │  │
│  │  │  │  EKS Node 3  │  │ EKS Node 4  │                 │  │  │
│  │  │  │  (t3.medium) │  │ (t3.medium) │                 │  │  │
│  │  │  └──────────────┘  └─────────────┘                 │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │                  Internet Gateway                  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────┬──────────────────────────────┘  │
│                              │                                 │
└──────────────────────────────┼─────────────────────────────────┘
                               │
                           Internet
                               │
                        ┌──────▼──────┐
                        │Your Laptop  │
                        │  (kubectl)  │
                        └─────────────┘
```

## Setup Steps

### Step 1: Create Terraform Project Directory

```bash
# Create project directory
mkdir -p ~/terraform-eks-cluster
cd ~/terraform-eks-cluster

# Create directory structure
mkdir -p {modules,environments/production}
```

### Step 2: Create Terraform Configuration Files

We'll create a modular Terraform configuration using the official AWS EKS Terraform module.

## Terraform Configuration

### Main Configuration Files

#### 1. `versions.tf` - Terraform and Provider Versions

Create `versions.tf`:

```hcl
terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
  }

  # Optional: Configure remote state storage
  # backend "s3" {
  #   bucket         = "my-terraform-state-bucket"
  #   key            = "eks/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-lock"
  # }
}
```

#### 2. `providers.tf` - AWS Provider Configuration

Create `providers.tf`:

```hcl
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "Terraform"
      Project     = var.project_name
    }
  }
}

# Kubernetes provider configuration
provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args = [
      "eks",
      "get-token",
      "--cluster-name",
      module.eks.cluster_name
    ]
  }
}
```

#### 3. `variables.tf` - Input Variables

Create `variables.tf`:

```hcl
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "my-eks-cluster"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "my-eks-cluster"
}

variable "cluster_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.28"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "node_instance_types" {
  description = "EC2 instance types for worker nodes"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_desired_size" {
  description = "Desired number of worker nodes"
  type        = number
  default     = 2
}

variable "node_min_size" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 1
}

variable "node_max_size" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = 4
}
```

#### 4. `main.tf` - Main Infrastructure

Create `main.tf`:

```hcl
locals {
  cluster_name = var.cluster_name
}

# Data source for availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

################################################################################
# VPC Module
################################################################################

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.project_name}-vpc"
  cidr = var.vpc_cidr

  azs             = slice(data.aws_availability_zones.available.names, 0, 3)
  private_subnets = [for k, v in slice(data.aws_availability_zones.available.names, 0, 3) : cidrsubnet(var.vpc_cidr, 4, k)]
  public_subnets  = [for k, v in slice(data.aws_availability_zones.available.names, 0, 3) : cidrsubnet(var.vpc_cidr, 8, k + 48)]

  enable_nat_gateway   = true
  single_nat_gateway   = false  # Set to true for cost savings in dev
  enable_dns_hostnames = true
  enable_dns_support   = true

  # Kubernetes tags for subnet discovery
  public_subnet_tags = {
    "kubernetes.io/role/elb"                    = "1"
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb"           = "1"
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
  }

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

################################################################################
# EKS Module
################################################################################

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = local.cluster_name
  cluster_version = var.cluster_version

  # Cluster endpoint access
  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  # Cluster encryption
  cluster_encryption_config = {
    resources        = ["secrets"]
    provider_key_arn = aws_kms_key.eks.arn
  }

  # VPC configuration
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Cluster addons
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }

  # EKS Managed Node Group(s)
  eks_managed_node_groups = {
    main = {
      name = "${var.project_name}-node-group"

      instance_types = var.node_instance_types
      capacity_type  = "ON_DEMAND"

      min_size     = var.node_min_size
      max_size     = var.node_max_size
      desired_size = var.node_desired_size

      # Node disk configuration
      block_device_mappings = {
        xvda = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size           = 50
            volume_type           = "gp3"
            encrypted             = true
            delete_on_termination = true
          }
        }
      }

      # Node labels
      labels = {
        Environment = var.environment
        NodeGroup   = "main"
      }

      # Node taints (optional)
      # taints = []

      # Node IAM role permissions
      iam_role_additional_policies = {
        AmazonSSMManagedInstanceCore = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
      }

      tags = {
        Name = "${var.project_name}-node"
      }
    }
  }

  # aws-auth configmap
  manage_aws_auth_configmap = true

  # Allow additional IAM users/roles to access cluster
  aws_auth_users = [
    # Add your IAM users here
    # {
    #   userarn  = "arn:aws:iam::123456789012:user/your-user"
    #   username = "your-user"
    #   groups   = ["system:masters"]
    # }
  ]

  tags = {
    Name = local.cluster_name
  }
}

################################################################################
# KMS Key for EKS Encryption
################################################################################

resource "aws_kms_key" "eks" {
  description             = "EKS Secret Encryption Key"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name = "${var.project_name}-eks-encryption-key"
  }
}

resource "aws_kms_alias" "eks" {
  name          = "alias/${var.project_name}-eks"
  target_key_id = aws_kms_key.eks.key_id
}

################################################################################
# Security Group Rules
################################################################################

# Additional security group for worker nodes (optional)
resource "aws_security_group" "additional" {
  name_prefix = "${var.project_name}-additional"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"
    cidr_blocks = [
      "10.0.0.0/8",
    ]
    description = "Allow SSH from within VPC"
  }

  tags = {
    Name = "${var.project_name}-additional-sg"
  }
}
```

#### 5. `outputs.tf` - Output Values

Create `outputs.tf`:

```hcl
output "cluster_id" {
  description = "EKS cluster ID"
  value       = module.eks.cluster_id
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = module.eks.cluster_security_group_id
}

output "cluster_name" {
  description = "Kubernetes Cluster Name"
  value       = module.eks.cluster_name
}

output "region" {
  description = "AWS region"
  value       = var.aws_region
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "configure_kubectl" {
  description = "Configure kubectl command"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}
```

#### 6. `terraform.tfvars` - Variable Values

Create `terraform.tfvars`:

```hcl
aws_region     = "us-east-1"  # Change to your preferred region
environment    = "production"
project_name   = "my-project"
cluster_name   = "my-eks-cluster"
cluster_version = "1.28"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"

# Node Group Configuration
node_instance_types = ["t3.medium"]  # Or ["t3.small"] for cost savings
node_desired_size   = 2
node_min_size       = 1
node_max_size       = 4
```

### Step 3: Initialize and Deploy

```bash
# Navigate to project directory
cd ~/terraform-eks-cluster

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Preview changes
terraform plan

# Apply configuration (create resources)
terraform apply

# Type 'yes' when prompted
```

This process will take approximately 10-15 minutes.

### Step 4: Save Terraform Outputs

```bash
# Save outputs to file
terraform output > outputs.txt

# View specific output
terraform output configure_kubectl
```

## Connecting from Local Machine

### Step 1: Update kubeconfig

```bash
# Get the cluster name from Terraform output
export CLUSTER_NAME=$(terraform output -raw cluster_name)
export AWS_REGION=$(terraform output -raw region)

# Update kubeconfig
aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME

# Or use the full command from Terraform output
terraform output -raw configure_kubectl | bash
```

### Step 2: Verify Connection

```bash
# View current context
kubectl config current-context

# Get cluster info
kubectl cluster-info

# View nodes
kubectl get nodes

# Expected output:
# NAME                          STATUS   ROLES    AGE   VERSION
# ip-10-0-1-123.ec2.internal    Ready    <none>   5m    v1.28.x-eks-xxx
# ip-10-0-2-456.ec2.internal    Ready    <none>   5m    v1.28.x-eks-xxx
```

### Step 3: Configure kubectl Context (Optional)

```bash
# Rename context for easier identification
kubectl config rename-context \
  arn:aws:eks:us-east-1:123456789:cluster/my-eks-cluster \
  my-eks-prod

# Switch between contexts
kubectl config use-context my-eks-prod

# View all contexts
kubectl config get-contexts
```

## Verification

### Check Cluster Health

```bash
# View all nodes with details
kubectl get nodes -o wide

# Check system pods
kubectl get pods -n kube-system

# View cluster info
kubectl cluster-info

# Check node resource capacity
kubectl describe nodes

# View all namespaces
kubectl get namespaces
```

### Deploy Test Application

```bash
# Create a test namespace
kubectl create namespace test-app

# Deploy nginx
kubectl create deployment nginx-test --image=nginx -n test-app

# Expose as LoadBalancer
kubectl expose deployment nginx-test --port=80 --type=LoadBalancer -n test-app

# Wait for external IP (takes 2-3 minutes)
kubectl get service nginx-test -n test-app --watch

# Once EXTERNAL-IP is available, test it
curl http://<EXTERNAL-IP>

# Clean up
kubectl delete namespace test-app
```

### Install Kubernetes Dashboard (Optional)

```bash
# Deploy dashboard
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml

# Create admin service account
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
EOF

# Get token
kubectl -n kubernetes-dashboard create token admin-user

# Start proxy
kubectl proxy

# Access dashboard at:
# http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/
```

## Cost Management

### Estimated Monthly Costs

```
EKS Control Plane:                $73/month
2x t3.medium nodes (On-Demand):   ~$60/month
NAT Gateways (2 AZs):             ~$64/month
Data Transfer:                    Variable
Load Balancers:                   ~$16/month each
Total Estimate:                   ~$200-250/month
```

### Cost Optimization Tips

1. **Use Spot Instances for non-critical workloads**:

```hcl
# In main.tf, add spot instance node group
eks_managed_node_groups = {
  spot = {
    name          = "${var.project_name}-spot"
    instance_types = ["t3.medium", "t3a.medium"]
    capacity_type  = "SPOT"

    min_size     = 0
    max_size     = 4
    desired_size = 2
  }
}
```

2. **Single NAT Gateway** (development only):

```hcl
# In main.tf
module "vpc" {
  # ...
  single_nat_gateway = true  # Reduces cost but eliminates redundancy
}
```

3. **Use Cluster Autoscaler**:

```bash
# Deploy cluster autoscaler
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml

# Edit deployment with your cluster name
kubectl -n kube-system edit deployment cluster-autoscaler
```

4. **Schedule shutdowns** for dev environments:

```bash
# Using AWS Instance Scheduler
# https://aws.amazon.com/solutions/implementations/instance-scheduler/
```

5. **Monitor and set budgets**:

```bash
# Create AWS Budget via console or CLI
aws budgets create-budget \
  --account-id 123456789012 \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

## Monitoring and Observability

### Install Metrics Server

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify
kubectl top nodes
kubectl top pods -A
```

### Install Prometheus and Grafana (using Helm)

```bash
# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Add Prometheus community repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus stack
kubectl create namespace monitoring

helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false

# Access Grafana (default: admin/prom-operator)
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# Visit: http://localhost:3000
```

### CloudWatch Container Insights

```bash
# Install CloudWatch agent
ClusterName=${CLUSTER_NAME}
RegionName=${AWS_REGION}
FluentBitHttpPort='2020'
FluentBitReadFromHead='Off'
[[ ${FluentBitReadFromHead} = 'On' ]] && FluentBitReadFromTail='Off'|| FluentBitReadFromTail='On'
[[ -z ${FluentBitHttpPort} ]] && FluentBitHttpServer='Off' || FluentBitHttpServer='On'

curl https://raw.githubusercontent.com/aws-samples/amazon-cloudwatch-container-insights/latest/k8s-deployment-manifest-templates/deployment-mode/daemonset/container-insights-monitoring/quickstart/cwagent-fluent-bit-quickstart.yaml | sed 's/{{cluster_name}}/'${ClusterName}'/;s/{{region_name}}/'${RegionName}'/;s/{{http_server_toggle}}/"'${FluentBitHttpServer}'"/;s/{{http_server_port}}/"'${FluentBitHttpPort}'"/;s/{{read_from_head}}/"'${FluentBitReadFromHead}'"/;s/{{read_from_tail}}/"'${FluentBitReadFromTail}'"/' | kubectl apply -f -
```

## Troubleshooting

### Cannot connect to cluster

```bash
# Verify AWS credentials
aws sts get-caller-identity

# Check cluster status
aws eks describe-cluster --name $CLUSTER_NAME --region $AWS_REGION

# Update kubeconfig again
aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME

# Test connection
kubectl get svc
```

### Nodes not joining cluster

```bash
# Check node group status
aws eks describe-nodegroup \
  --cluster-name $CLUSTER_NAME \
  --nodegroup-name main \
  --region $AWS_REGION

# View CloudFormation events
aws cloudformation describe-stack-events \
  --stack-name eksctl-$CLUSTER_NAME-nodegroup-main \
  --region $AWS_REGION

# Check EC2 instances
aws ec2 describe-instances \
  --filters "Name=tag:eks:cluster-name,Values=$CLUSTER_NAME" \
  --region $AWS_REGION
```

### Terraform errors

```bash
# Refresh state
terraform refresh

# Force unlock if needed
terraform force-unlock <LOCK_ID>

# Re-initialize
rm -rf .terraform
terraform init
```

### Pods stuck in Pending

```bash
# Describe pod to see events
kubectl describe pod <pod-name> -n <namespace>

# Check node resources
kubectl describe nodes

# View events
kubectl get events --sort-by='.lastTimestamp' -A

# Check if autoscaler is working
kubectl logs -n kube-system deployment/cluster-autoscaler
```

## Cleanup and Destruction

### Important: Clean up resources to avoid charges

```bash
# Delete all Kubernetes resources first
kubectl delete --all deployments --all-namespaces
kubectl delete --all services --all-namespaces
kubectl delete --all ingress --all-namespaces

# Delete any LoadBalancers and persistent volumes
kubectl get svc --all-namespaces
kubectl get pv

# Destroy Terraform resources
cd ~/terraform-eks-cluster
terraform destroy

# Type 'yes' when prompted
```

**Note**: Make sure to delete all LoadBalancers and EBS volumes manually if Terraform fails to remove them.

## Security Best Practices

### 1. Enable IAM Roles for Service Accounts (IRSA)

```hcl
# Add to main.tf
module "eks" {
  # ...
  enable_irsa = true
}
```

### 2. Enable Pod Security Standards

```bash
# Create Pod Security Policy
kubectl label namespace default pod-security.kubernetes.io/enforce=restricted
```

### 3. Enable Audit Logging

```hcl
# Add to main.tf in EKS module
cluster_enabled_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
```

### 4. Use Network Policies

```bash
# Install Calico for network policies
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.26.1/manifests/calico-vxlan.yaml
```

### 5. Regular Updates

```bash
# Update cluster version
terraform apply -var="cluster_version=1.29"

# Update node group
terraform apply -refresh-only
terraform apply
```

## Backup and Disaster Recovery

### Backup etcd using Velero

```bash
# Install Velero CLI
brew install velero

# Create S3 bucket for backups
aws s3 mb s3://my-velero-backup-bucket --region us-east-1

# Install Velero in cluster
velero install \
  --provider aws \
  --plugins velero/velero-plugin-for-aws:v1.8.0 \
  --bucket my-velero-backup-bucket \
  --backup-location-config region=us-east-1 \
  --snapshot-location-config region=us-east-1 \
  --secret-file ./credentials-velero

# Create backup
velero backup create my-backup

# Schedule daily backups
velero schedule create daily-backup --schedule="0 1 * * *"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to EKS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Update kube config
        run: aws eks update-kubeconfig --name my-eks-cluster --region us-east-1

      - name: Deploy to EKS
        run: |
          kubectl apply -f k8s/
          kubectl rollout status deployment/my-app
```

## Additional Resources

### Official Documentation

- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Terraform AWS EKS Module](https://registry.terraform.io/modules/terraform-aws-modules/eks/aws/latest)
- [Terraform AWS VPC Module](https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws/latest)
- [AWS CLI EKS Commands](https://docs.aws.amazon.com/cli/latest/reference/eks/)

### Tutorials and Guides

- [EKS Workshop](https://www.eksworkshop.com/)
- [Terraform EKS Tutorial](https://learn.hashicorp.com/tutorials/terraform/eks)
- [AWS EKS Best Practices Guide](https://aws.github.io/aws-eks-best-practices/)

### Tools and Extensions

- [eksctl](https://eksctl.io/) - CLI for EKS
- [k9s](https://k9scli.io/) - Terminal UI for Kubernetes
- [Lens](https://k8slens.dev/) - Kubernetes IDE
- [kubectx/kubens](https://github.com/ahmetb/kubectx) - Context and namespace switcher
- [Helm](https://helm.sh/) - Package manager
- [ArgoCD](https://argo-cd.readthedocs.io/) - GitOps tool
- [Flux](https://fluxcd.io/) - GitOps toolkit

### AWS Services Integration

- [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/)
- [EBS CSI Driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver)
- [EFS CSI Driver](https://github.com/kubernetes-sigs/aws-efs-csi-driver)
- [AWS CloudWatch Container Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/ContainerInsights.html)

### Community

- [Kubernetes Slack](https://kubernetes.slack.com/)
- [AWS Developers Slack](https://aws-developers.slack.com/)
- [r/kubernetes](https://www.reddit.com/r/kubernetes/)
- [r/aws](https://www.reddit.com/r/aws/)

## Next Steps

1. **Set up ingress controller**: Install AWS Load Balancer Controller
2. **Configure autoscaling**: Install Cluster Autoscaler and HPA
3. **Set up monitoring**: Deploy Prometheus and Grafana
4. **Implement GitOps**: Set up ArgoCD or Flux
5. **Configure SSL/TLS**: Use cert-manager with Let's Encrypt
6. **Set up CI/CD**: Integrate with GitHub Actions, GitLab CI, or Jenkins
7. **Implement service mesh**: Consider Istio or Linkerd for advanced traffic management

---

[← Back to Main Setup Guide](./kubernetes-setup.md) | [Raspberry Pi Setup Guide ←](./kubernetes-setup-raspberry-pi.md)
