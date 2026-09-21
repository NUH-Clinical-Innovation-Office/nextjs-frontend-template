# helm/AGENTS.md

Single chart, `helm/nextjs-app/`, deployed to every environment. Environments
differ only by values file. There is no per-environment chart.

## Layout

```
helm/nextjs-app/
├── Chart.yaml
├── values.yaml              # Base, every key the templates read
├── values-feature.yaml      # Feature branch previews
├── values-staging.yaml
├── values-production.yaml
└── templates/
    ├── _helpers.tpl              # Name/label helpers
    ├── deployment.yaml
    ├── service.yaml              # NodePort
    ├── serviceaccount.yaml
    ├── ingress.yaml              # Disabled in all environments today
    ├── hpa.yaml
    ├── poddisruptionbudget.yaml
    ├── metrics-service.yaml      # Prometheus port, separate from the app port
    ├── servicemonitor.yaml       # Requires Prometheus Operator CRDs
    └── NOTES.txt
```

## Values Layering

CI installs with base values plus exactly one environment overlay:

```bash
helm upgrade --install <release> ./helm/nextjs-app \
  -f ./helm/nextjs-app/values.yaml \
  -f ./helm/nextjs-app/values-<env>.yaml \
  --set ...   # image tag, nodePort, and other per-run values
```

`values.yaml` must define every key the templates reference. The overlays are
partial, so a key that exists only in an overlay renders empty elsewhere.
When adding a knob, add it to `values.yaml` first, then override as needed.

## Environment Differences

| | feature | staging | production |
|---|---|---|---|
| `replicaCount` | 1 | 1 | 2 |
| `image.tag` | `feature` (CI overrides) | `staging` | `latest` |
| `image.pullPolicy` | IfNotPresent | IfNotPresent | Always |
| `service.nodePort` | allocated per branch | 30002 | 30001 |
| `autoscaling` | off | off | on (1–2, CPU 60%) |
| `podDisruptionBudget` | off | `maxUnavailable: 1` | `minAvailable: 1` |
| Vault path | `.../development` | `.../staging` | `.../production` |

Feature branches set `featureBranch.enabled: true` and get their NodePort from
CI, not from the values file. The `nodePort: 30000` in `values-feature.yaml` is
a placeholder that is always overridden. See `.github/workflows/AGENTS.md` for
the allocation scheme.

## Things That Will Break If Changed Carelessly

**Non-root UID.** `podSecurityContext` pins `runAsUser`/`fsGroup` to **65532**,
matching the DHI runtime image. The container has no shell and no package
manager. `readOnlyRootFilesystem: true` is set and all capabilities are
dropped. Code that writes to disk at runtime needs an explicit volume, not a
relaxed security context.

**Bun memory tuning.** `bunOptions.smol` renders `BUN_OPTIONS=--smol`, which
keeps the GC aggressive under the 256Mi limit every environment ships. Bun runs
JavaScriptCore, so V8 flags like `NODE_OPTIONS=--max-old-space-size` are inert.
Adding them has no effect.

**Secrets come from Vault**, injected by the Vault Agent sidecar via
`podAnnotations` (`vault.hashicorp.io/agent-inject-*`). Each environment reads
its own KV path. Keep secret material out of `env:`, because those values land
in the rendered manifest in plain text. See `docs/vault-setup-and-deployment.md`.

**ServiceMonitor is opt-in.** `metrics.serviceMonitor.enabled` requires the
Prometheus Operator CRDs (`monitoring.coreos.com/v1`) in the target cluster.
Enabling it where kube-prometheus-stack is absent fails the install.

**Ingress is disabled everywhere.** External traffic reaches the cluster through
Cloudflare Tunnel pointed at the NodePort, not through an ingress controller.
Enabling `ingress` is a genuine architecture change, not a config toggle.

## Before Committing Chart Changes

Bump `version` in `Chart.yaml` when templates or default values change
(`appVersion` tracks the app, not the chart). Render before pushing, because CI
deploy failures are slower to debug than a local render.

```bash
helm lint ./helm/nextjs-app
helm template test ./helm/nextjs-app \
  -f ./helm/nextjs-app/values.yaml \
  -f ./helm/nextjs-app/values-staging.yaml
```
