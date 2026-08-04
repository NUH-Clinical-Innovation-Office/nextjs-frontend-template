# Deployment

client-sample and common-service both deploy to AWS EKS, namespace
`sample-services`. The cluster is reached via the same Cloudflare tunnel as
auth-service-frontend, but auth here is AWS OIDC rather than a kubeconfig
bearer token.

## Architecture

| Service          | Reachable from              | Ingress        |
|------------------|-----------------------------|----------------|
| client-sample    | `https://client-sample.russellgpt.com` | ALB (ACM cert) |
| common-service   | Inside `sample-services` only | ClusterIP, no ingress |

common-service has **no external URL** by design — it is only reachable from
inside the cluster. The browser → common-service call goes through a
server-side proxy at `/api/notes` that uses the cluster-internal DNS name:

```
http://common-service.sample-services.svc.cluster.local:8080
```

This keeps the internal address out of the browser bundle
(`COMMON_SERVICE_URL` is not `NEXT_PUBLIC_`).

## Pipeline

Both repos run on `push` to `main`:

```
quality checks (lint, test, type-check, knip)
  → docker build (linux/amd64,linux/arm64)
    → security scan
      → production deploy (helm upgrade --install)
```

## Required GitHub secrets and variables

| Repo                   | Secrets                                         | Variables                       |
|------------------------|-------------------------------------------------|---------------------------------|
| `nuhs/client-sample`   | `AWS_ROLE_ARN`, `COMMON_SERVICE_URL`            | `AWS_REGION`, `EKS_CLUSTER_NAME` |
| `nuhs/common-service-sample` | `AWS_ROLE_ARN`, `AUTH_SERVICE_ISSUER`, `AUTH_SERVICE_JWKS_URL`, `AUTH_SERVICE_AUDIENCE` | `AWS_REGION`, `EKS_CLUSTER_NAME` |

Every namespace the workflows deploy to needs a pre-created
`ghcr-credentials` secret of type `kubernetes.io/dockerconfigjson` so pods can
pull from GHCR:

```sh
kubectl create secret docker-registry ghcr-credentials \
  --docker-server=ghcr.io \
  --docker-username=<github-username> \
  --docker-password=<github-token> \
  --namespace=sample-services
```

## Local development

Both repos can run on the same machine with no infra:

```sh
# terminal 1 — common-service on :8080
cd ~/nuhs/common-service-sample
make run

# terminal 2 — client-sample on :3000, proxy targets localhost
cd ~/nuhs/client-sample
cp .env.example .env.local        # COMMON_SERVICE_URL defaults to http://localhost:8080
bun install
bun run dev
```

Mint a JWT against a running auth-service, paste it into the form, and the
flow ends to end without ever leaving your laptop.

## CI/CD plumbing

`production-deploy.yml` in each repo is the same shape (adapted from
`auth-service-frontend`):

1. Validate secrets and variables are present.
2. Assume AWS role via OIDC.
3. Update kubeconfig for the EKS cluster.
4. Create namespace if missing.
5. Verify `ghcr-credentials` exists in that namespace.
6. `helm upgrade --install ... --wait` with the right values file and
   extraEnv overrides for secrets.
7. Rollout status check.
8. (common-service only) Verify the Service type is `ClusterIP` and no
   Ingress exists — a defensive guardrail so removing the internal-only
   constraint is a loud failure, not a silent one.

If you need to add a public-facing component to `sample-services`, give it
its own Helm chart. Do not amend common-service's chart to add an Ingress —
the absence is the security boundary.
