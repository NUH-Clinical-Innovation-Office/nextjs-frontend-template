# Next.js Helm Chart

This Helm chart deploys the Next.js application to Kubernetes.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- Docker image built and pushed to a container registry

## Installation

### 1. Build and Push Docker Image

```bash
# Build the image
docker build -t your-registry/nextjs-frontend-template:latest .

# Push to your registry
docker push your-registry/nextjs-frontend-template:latest
```

### 2. Install the Chart

```bash
# Install with default values
helm install nextjs-app ./helm/nextjs-app

# Install with custom values
helm install nextjs-app ./helm/nextjs-app \
  --set image.repository=your-registry/nextjs-frontend-template \
  --set image.tag=v1.0.0 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=example.com

# Install with custom values file
helm install nextjs-app ./helm/nextjs-app -f custom-values.yaml
```

### 3. Verify Installation

```bash
# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# Get application URL
kubectl port-forward svc/nextjs-app 8080:80
# Visit http://localhost:8080
```

## Configuration

The following table lists the configurable parameters:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `2` |
| `image.repository` | Image repository | `nextjs-frontend-template` |
| `image.tag` | Image tag | `latest` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `service.type` | Service type | `ClusterIP` |
| `service.port` | Service port | `80` |
| `ingress.enabled` | Enable ingress | `false` |
| `ingress.className` | Ingress class name | `nginx` |
| `resources.limits.cpu` | CPU limit | `500m` |
| `resources.limits.memory` | Memory limit | `512Mi` |
| `autoscaling.enabled` | Enable HPA | `false` |
| `autoscaling.minReplicas` | Minimum replicas | `2` |
| `autoscaling.maxReplicas` | Maximum replicas | `10` |

## Examples

### Enable Ingress with TLS

```yaml
# values-production.yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  hosts:
    - host: myapp.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: myapp-tls
      hosts:
        - myapp.example.com
```

```bash
helm upgrade nextjs-app ./helm/nextjs-app -f values-production.yaml
```

### Enable Autoscaling

```yaml
# values-autoscaling.yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80

resources:
  requests:
    cpu: 250m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### Add Environment Variables

```yaml
# values-env.yaml
env:
  - name: API_URL
    value: "https://api.example.com"
  - name: NODE_ENV
    value: "production"
  - name: NEXT_PUBLIC_API_KEY
    valueFrom:
      secretKeyRef:
        name: api-secrets
        key: api-key
```

## Upgrading

```bash
# Upgrade with new image version
helm upgrade nextjs-app ./helm/nextjs-app --set image.tag=v1.1.0

# Upgrade with new values file
helm upgrade nextjs-app ./helm/nextjs-app -f new-values.yaml
```

## Uninstalling

```bash
helm uninstall nextjs-app
```

## Health Checks

The chart includes three types of probes:

- **Liveness Probe**: Checks if the container is alive
- **Readiness Probe**: Checks if the container is ready to serve traffic
- **Startup Probe**: Gives the container time to start before other probes begin

All probes are configured to check the root path (`/`) on port 3000.

## Security

The chart follows security best practices:

- Runs as non-root user (uid: 1001)
- Drops all capabilities
- Disables privilege escalation
- Creates dedicated service account

## Troubleshooting

```bash
# View logs
kubectl logs -l app.kubernetes.io/name=nextjs-app

# Describe pod for events
kubectl describe pod -l app.kubernetes.io/name=nextjs-app

# Execute shell in pod
kubectl exec -it deployment/nextjs-app -- sh

# Check horizontal pod autoscaler
kubectl get hpa
kubectl describe hpa nextjs-app
```
