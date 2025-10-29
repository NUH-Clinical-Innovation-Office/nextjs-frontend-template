# Kubernetes Setup Guide

This guide covers two approaches for setting up Kubernetes clusters that you can manage from your local computer using `kubectl`.

## Overview

Both setup methods will allow you to:

- Manage your cluster using `kubectl` from your local machine
- Deploy containerized applications
- Scale workloads
- Monitor cluster health

## Setup Options

### 1. [Self-Hosted on Raspberry Pi](./kubernetes-setup-raspberry-pi.md)

Perfect for learning, development, and small-scale production workloads. Lower cost but requires physical hardware management.

**Best for:**

- Learning Kubernetes
- Development environments
- Edge computing scenarios
- Cost-effective small-scale deployments

### 2. [AWS with Terraform](./kubernetes-setup-aws.md)

Production-ready managed Kubernetes service (EKS) with infrastructure as code. Higher cost but fully managed and scalable.

**Best for:**

- Production workloads
- Scalable applications
- Environments requiring high availability
- Teams preferring managed services

## Prerequisites (Both Methods)

### Local Machine Requirements

- **kubectl**: Kubernetes command-line tool
- **git**: Version control
- **Text editor**: VS Code, vim, etc.

Install kubectl:

```bash
# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verify installation
kubectl version --client
```

## Architecture Comparison

```
┌────────────────────────────────────────────────────────┐
│                    RASPBERRY PI CLUSTER                │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Master     │  │   Worker 1   │  │   Worker 2   │  │
│  │   Node       │  │              │  │              │  │
│  │  (K3s/K8s)   │  │   (K3s/K8s)  │  │   (K3s/K8s)  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │          │
│         └─────────────────┴─────────────────┘          │
│                           │                            │
│                    Home Network                        │
│                           │                            │
└───────────────────────────┼────────────────────────────┘
                            │
                     ┌──────▼──────┐
                     │Local Machine│
                     │  (kubectl)  │
                     └─────────────┘

┌──────────────────────────────────────────────────────────────┐
│                       AWS EKS CLUSTER                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│     ┌─────────────────────────────────────────────────┐      │
│     │           EKS Control Plane (Managed)           │      │
│     └───────────────────────┬─────────────────────────┘      │
│                             │                                │
│  ┌──────────────────────────┼─────────────────────────────┐  │
│  │                  VPC Subnet                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  EC2 Node 1  │  │  EC2 Node 2  │  │  EC2 Node 3  │  │  │
│  │  │  (Worker)    │  │  (Worker)    │  │  (Worker)    │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└───────────────────────────┼──────────────────────────────────┘
                            │
                        Internet
                            │
                     ┌──────▼──────┐
                     │Local Machine│
                     │  (kubectl)  │
                     └─────────────┘
```

## Quick Comparison

| Feature | Raspberry Pi | AWS EKS |
|---------|-------------|---------|
| Cost | Low (hardware + electricity) | Higher (pay-as-you-go) |
| Setup Complexity | Moderate | Moderate (simplified with Terraform) |
| Scalability | Limited by hardware | Highly scalable |
| Maintenance | Manual updates | Managed control plane |
| High Availability | Manual setup required | Built-in |
| Learning Value | High (full control) | Moderate (abstracted) |
| Production Ready | Small scale | Enterprise scale |

## Next Steps

Choose your setup path:

- [Raspberry Pi Setup Guide →](./kubernetes-setup-raspberry-pi.md)
- [AWS EKS Setup Guide →](./kubernetes-setup-aws.md)

## Additional Resources

- [Official Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Kubernetes The Hard Way](https://github.com/kelseyhightower/kubernetes-the-hard-way)
- [K3s Documentation](https://docs.k3s.io/)
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Terraform AWS EKS Module](https://registry.terraform.io/modules/terraform-aws-modules/eks/aws/latest)
