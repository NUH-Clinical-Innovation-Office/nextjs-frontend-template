# Kubernetes Setup on Raspberry Pi (Self-Hosted)

This guide will walk you through setting up a self-hosted Kubernetes cluster on Raspberry Pi devices using K3s, a lightweight Kubernetes distribution perfect for edge computing and resource-constrained environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Hardware Requirements](#hardware-requirements)
- [Architecture Overview](#architecture-overview)
- [Step-by-Step Setup](#step-by-step-setup)
- [Connecting from Local Machine](#connecting-from-local-machine)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Prerequisites

### Hardware Requirements

**Minimum Setup (1 node):**

- 1x Raspberry Pi 4 (4GB RAM minimum, 8GB recommended)
- 1x MicroSD card (32GB minimum, Class 10 or better)
- 1x Power supply (official Raspberry Pi power supply recommended)
- 1x Ethernet cable (recommended over WiFi for stability)

**Recommended Setup (3 nodes):**

- 3x Raspberry Pi 4 (4GB or 8GB RAM)
- 3x MicroSD cards (64GB, Class 10 or better)
- 3x Power supplies
- 1x Network switch
- 3x Ethernet cables
- Optional: Raspberry Pi cluster case with cooling

### Software Requirements

- **Raspberry Pi OS**: 64-bit Lite (recommended) or Desktop
- **SSH access**: Enabled on all Pi devices
- **Static IP addresses**: For stable cluster networking

## Architecture Overview

```
┌───────────────────────────────────────────────────────────────┐
│                  HOME NETWORK (192.168.1.0/24)                │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│          ┌─────────────────────┐                              │
│          │   Router/Gateway    │                              │
│          │   192.168.1.1       │                              │
│          └──────────┬──────────┘                              │
│                     │                                         │
│          ┌──────────┴─────────┐                               │
│          │                    │                               │
│  ┌───────▼────────┐  ┌────────▼───────┐  ┌─────────────────┐  │
│  │ Master Node    │  │  Worker Node 1 │  │  Worker Node 2  │  │
│  │ (k3s-master)   │  │  (k3s-worker1) │  │  (k3s-worker2)  │  │
│  │ 192.168.1.100  │  │  192.168.1.101 │  │  192.168.1.102  │  │
│  │                │  │                │  │                 │  │
│  │ • API Server   │  │ • Kubelet      │  │ • Kubelet       │  │
│  │ • Scheduler    │  │ • Container    │  │ • Container     │  │
│  │ • Controller   │  │   Runtime      │  │   Runtime       │  │
│  │ • etcd         │  │ • kube-proxy   │  │ • kube-proxy    │  │
│  └────────────────┘  └────────────────┘  └─────────────────┘  │
│                                                               │
└───────────────────────────────┬───────────────────────────────┘
                                │
                         ┌──────▼──────┐
                         │Your Laptop  │
                         │(kubectl)    │
                         │192.168.1.50 │
                         └─────────────┘
```

## Step-by-Step Setup

### Step 1: Prepare Raspberry Pi Devices

#### 1.1 Flash Raspberry Pi OS

```bash
# Download Raspberry Pi Imager
# Visit: https://www.raspberrypi.com/software/

# Flash Raspberry Pi OS (64-bit) Lite to each SD card
# Enable SSH and configure WiFi/credentials during imaging
```

#### 1.2 Configure Static IP Addresses

SSH into each Pi and edit the dhcpcd configuration:

```bash
# SSH into each Pi
ssh pi@raspberrypi.local

# Edit dhcpcd.conf
sudo nano /etc/dhcpcd.conf

# Add the following (adjust IP for each node):
# For Master Node (192.168.1.100)
interface eth0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8

# For Worker Node 1 (192.168.1.101)
# Use 192.168.1.101/24

# For Worker Node 2 (192.168.1.102)
# Use 192.168.1.102/24

# Reboot
sudo reboot
```

#### 1.3 Set Hostnames

```bash
# On Master Node
sudo hostnamectl set-hostname k3s-master

# On Worker Node 1
sudo hostnamectl set-hostname k3s-worker1

# On Worker Node 2
sudo hostnamectl set-hostname k3s-worker2

# Update /etc/hosts on all nodes
sudo nano /etc/hosts
```

Add to `/etc/hosts` on all nodes:

```
192.168.1.100 k3s-master
192.168.1.101 k3s-worker1
192.168.1.102 k3s-worker2
```

### Step 2: Prepare for K3s Installation

#### 2.1 Update System

Run on all nodes:

```bash
sudo apt update && sudo apt upgrade -y
```

#### 2.2 Enable Container Features

Edit boot configuration on all nodes:

```bash
sudo nano /boot/firmware/cmdline.txt

# Add to the end of the existing line (don't create new line):
cgroup_memory=1 cgroup_enable=memory
```

Reboot all nodes:

```bash
sudo reboot
```

#### 2.3 Disable Swap (if enabled)

```bash
sudo dphys-swapfile swapoff
sudo dphys-swapfile uninstall
sudo systemctl disable dphys-swapfile
```

### Step 3: Install K3s

#### 3.1 Install K3s on Master Node

```bash
# SSH into master node
ssh pi@192.168.1.100

# Install K3s server
curl -sfL https://get.k3s.io | sh -s - server \
  --write-kubeconfig-mode 644 \
  --node-name k3s-master

# Verify installation
sudo systemctl status k3s

# Get node token (needed for workers)
sudo cat /var/lib/rancher/k3s/server/node-token
```

Save the node token output - you'll need it for worker nodes.

#### 3.2 Install K3s on Worker Nodes

```bash
# SSH into worker node 1
ssh pi@192.168.1.101

# Install K3s agent (replace TOKEN with actual token from master)
export K3S_URL="https://192.168.1.100:6443"
export K3S_TOKEN="<your-node-token-from-master>"

curl -sfL https://get.k3s.io | sh -s - agent \
  --node-name k3s-worker1

# Repeat for worker node 2
ssh pi@192.168.1.102

export K3S_URL="https://192.168.1.100:6443"
export K3S_TOKEN="<your-node-token-from-master>"

curl -sfL https://get.k3s.io | sh -s - agent \
  --node-name k3s-worker2
```

### Step 4: Verify Cluster

On the master node:

```bash
sudo kubectl get nodes

# Expected output:
# NAME          STATUS   ROLES                  AGE   VERSION
# k3s-master    Ready    control-plane,master   5m    v1.28.x+k3s1
# k3s-worker1   Ready    <none>                 2m    v1.28.x+k3s1
# k3s-worker2   Ready    <none>                 1m    v1.28.x+k3s1
```

## Connecting from Local Machine

### Step 1: Copy kubeconfig from Master Node

```bash
# On your local machine
scp pi@192.168.1.100:/etc/rancher/k3s/k3s.yaml ~/.kube/config-k3s-pi

# Or manually copy the content
ssh pi@192.168.1.100
sudo cat /etc/rancher/k3s/k3s.yaml
# Copy the output
```

### Step 2: Update kubeconfig

```bash
# Edit the downloaded config
nano ~/.kube/config-k3s-pi

# Change the server URL from:
# server: https://127.0.0.1:6443
# To:
# server: https://192.168.1.100:6443
```

### Step 3: Set up kubectl Context

```bash
# Backup existing config
cp ~/.kube/config ~/.kube/config.backup

# Merge configs or use specific config
export KUBECONFIG=~/.kube/config-k3s-pi

# Or merge with existing config
KUBECONFIG=~/.kube/config:~/.kube/config-k3s-pi kubectl config view --flatten > ~/.kube/config-merged
mv ~/.kube/config-merged ~/.kube/config

# Set context
kubectl config use-context default

# Rename context for clarity (optional)
kubectl config rename-context default k3s-raspberry-pi
```

### Step 4: Verify Connection

```bash
kubectl get nodes
kubectl get pods -A
kubectl cluster-info
```

## Verification

### Check Cluster Health

```bash
# View all nodes
kubectl get nodes -o wide

# Check system pods
kubectl get pods -n kube-system

# View cluster info
kubectl cluster-info

# Check component status
kubectl get componentstatuses

# View cluster events
kubectl get events --all-namespaces --sort-by='.lastTimestamp'
```

### Deploy Test Application

```bash
# Create a test deployment
kubectl create deployment nginx-test --image=nginx

# Expose it
kubectl expose deployment nginx-test --port=80 --type=NodePort

# Check status
kubectl get deployments
kubectl get pods
kubectl get services

# Get the NodePort
kubectl get svc nginx-test

# Access from browser
# http://192.168.1.100:<NodePort>
```

### Monitor Resources

```bash
# Install metrics server (if not already installed)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Wait a few minutes, then check resource usage
kubectl top nodes
kubectl top pods -A
```

## Network Diagram with Services

```
┌──────────────────────────────────────────────────┐
│                K3S CLUSTER NETWORK               │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │      Service Network (10.43.0.0/16)        │  │
│  │                                            │  │
│  │  ┌─────────────┐      ┌─────────────┐      │  │
│  │  │  ClusterIP  │      │  NodePort   │      │  │
│  │  │  Services   │      │  Services   │      │  │
│  │  └──────┬──────┘      └──────┬──────┘      │  │
│  └─────────┼────────────────────┼─────────────┘  │
│            │                    │                │
│  ┌─────────▼────────────────────▼─────────────┐  │
│  │         Pod Network (10.42.0.0/16)         │  │
│  │                                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │Pod (App1)│  │Pod (App2)│  │Pod (App3)│  │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  │  │
│  └───────┼─────────────┼─────────────┼────────┘  │
│          │             │             │           │
│  ┌───────┼─────────────┼─────────────┼────────┐  │
│  │  ┌────▼────┐   ┌────▼────┐   ┌────▼────┐   │  │
│  │  │ Master  │   │Worker 1 │   │Worker 2 │   │  │
│  │  │  Node   │   │  Node   │   │  Node   │   │  │
│  │  └─────────┘   └─────────┘   └─────────┘   │  │
│  │      Physical Network (192.168.1.0/24)     │  │
│  └─────────────────────┬──────────────────────┘  │
│                        │                         │
└────────────────────────┼─────────────────────────┘
                         │
                  ┌──────▼──────┐
                  │Local Machine│
                  │  (kubectl)  │
                  └─────────────┘
```

## Troubleshooting

### Nodes Not Joining

```bash
# On master, check K3s service
sudo systemctl status k3s

# Check logs
sudo journalctl -u k3s -f

# On worker, check K3s agent
sudo systemctl status k3s-agent
sudo journalctl -u k3s-agent -f

# Verify network connectivity
ping k3s-master
telnet 192.168.1.100 6443
```

### kubectl Connection Issues

```bash
# Verify kubeconfig
kubectl config view

# Check cluster connectivity
kubectl cluster-info dump

# Test direct API access
curl -k https://192.168.1.100:6443/version
```

### High Memory/CPU Usage

```bash
# Check resource consumption
kubectl top nodes
kubectl top pods -A

# Check for problematic pods
kubectl get pods -A --field-selector=status.phase!=Running

# Restart K3s service if needed
sudo systemctl restart k3s        # On master
sudo systemctl restart k3s-agent  # On workers
```

### Pods Stuck in Pending

```bash
# Describe the pod to see events
kubectl describe pod <pod-name>

# Check node resources
kubectl describe nodes

# View events
kubectl get events --sort-by='.lastTimestamp'
```

## Performance Optimization

### 1. Reduce Resource Usage

```bash
# Disable unnecessary components on master
curl -sfL https://get.k3s.io | sh -s - server \
  --write-kubeconfig-mode 644 \
  --disable traefik \
  --disable servicelb
```

### 2. Configure Resource Limits

Create resource quotas for namespaces:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: default
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
```

### 3. Enable Log Rotation

```bash
# Add to K3s configuration
sudo nano /etc/rancher/k3s/config.yaml
```

Add:

```yaml
log:
  level: info
  max-size: 50  # MB
  max-age: 7    # days
```

## Backup and Restore

### Backup etcd

```bash
# On master node
sudo cp -r /var/lib/rancher/k3s/server/db /backup/k3s-db-$(date +%Y%m%d)

# Automated backup script
cat << 'EOF' | sudo tee /usr/local/bin/k3s-backup.sh
#!/bin/bash
BACKUP_DIR="/backup/k3s"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d-%H%M%S)
cp -r /var/lib/rancher/k3s/server/db "$BACKUP_DIR/db-$DATE"
# Keep only last 7 backups
ls -t $BACKUP_DIR/db-* | tail -n +8 | xargs rm -rf
EOF

sudo chmod +x /usr/local/bin/k3s-backup.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/k3s-backup.sh") | crontab -
```

## Upgrading K3s

```bash
# On master node
sudo systemctl stop k3s
curl -sfL https://get.k3s.io | sh -
sudo systemctl start k3s

# On worker nodes
sudo systemctl stop k3s-agent
curl -sfL https://get.k3s.io | sh -
sudo systemctl start k3s-agent

# Verify upgrade
kubectl get nodes
```

## Security Best Practices

1. **Change default passwords** on all Raspberry Pi devices
2. **Use SSH keys** instead of passwords
3. **Configure firewall** rules:

   ```bash
   sudo apt install ufw
   sudo ufw allow 22/tcp      # SSH
   sudo ufw allow 6443/tcp    # K3s API
   sudo ufw allow 10250/tcp   # Kubelet
   sudo ufw enable
   ```

4. **Enable automatic security updates**
5. **Regularly backup** your cluster configuration
6. **Use RBAC** for access control
7. **Enable pod security policies**

## Additional Resources

### Documentation

- [K3s Official Documentation](https://docs.k3s.io/)
- [Rancher K3s GitHub](https://github.com/k3s-io/k3s)
- [Kubernetes Official Docs](https://kubernetes.io/docs/home/)

### Tutorials

- [K3s on Raspberry Pi Tutorial](https://k3s.io/)
- [Raspberry Pi Cluster Setup](https://www.raspberrypi.com/tutorials/cluster-raspberry-pi-tutorial/)

### Tools

- [k9s](https://k9scli.io/) - Terminal UI for Kubernetes
- [Lens](https://k8slens.dev/) - Kubernetes IDE
- [Helm](https://helm.sh/) - Package manager for Kubernetes

### Community

- [K3s Slack](https://slack.rancher.io/)
- [Kubernetes Slack](https://kubernetes.slack.com/)
- [r/kubernetes](https://www.reddit.com/r/kubernetes/)

## Next Steps

1. Deploy your application to the cluster
2. Set up [Helm](https://helm.sh/) for package management
3. Configure [cert-manager](https://cert-manager.io/) for TLS certificates
4. Set up monitoring with [Prometheus](https://prometheus.io/) and [Grafana](https://grafana.com/)
5. Configure ingress controller (Traefik comes with K3s by default)
6. Explore [GitOps with ArgoCD](https://argo-cd.readthedocs.io/)

---

[← Back to Main Setup Guide](./kubernetes-setup.md) | [AWS Setup Guide →](./kubernetes-setup-aws.md)
