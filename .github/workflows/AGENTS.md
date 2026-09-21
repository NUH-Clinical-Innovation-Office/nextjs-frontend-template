# .github/workflows/AGENTS.md

One entry workflow, `ci.yml`, plus scheduled and manual ones. Everything else
is a reusable workflow called by it. Edit the reusable file to change behaviour
for all callers at once.

## Call Graph

```
ci.yml                    (on: push, all branches)
├── extract-bun-version
├── reusable-build.yml            quality checks
├── reusable-docker.yml           build + push to ghcr.io
├── reusable-security-scan.yml
└── one deploy, by branch:
    ├── feature-deploy.yml        if ref != main
    ├── staging-deploy.yml        if ref == main
    └── production-deploy.yml     if ref == main, needs deploy-staging

feature-cleanup.yml       (on: delete)         tears down a branch's namespace
image-cleanup.yml         (cron: Sun 02:00 UTC, + manual)
staging-rollback.yml      (manual / callable)
production-rollback.yml   (manual / callable)
```

Production deploys run on merge to `main` and depend on `deploy-staging`
succeeding first. Staging is a gate, not a parallel target.

## Adding a Pull Request Workflow

There is no PR-triggered workflow today. `ci.yml` runs on push, so branch
pushes are covered but fork PRs are not.

Any workflow added for pull requests uses the `pull_request` trigger. Fork PRs
then run with no access to secrets and a read-only `GITHUB_TOKEN`.
`pull_request_target` runs PR-author-controlled code **with repository secrets
in scope**, which is a compromise path for any fork PR. A PR workflow also
stays free of deploy jobs and deploy credentials for the same reason.

## Bun Version Flow

`packageManager` in `package.json` is the single source of truth. `ci.yml`
has an `extract-bun-version` job that greps it:

```bash
BUN_VERSION=$(grep -o '"packageManager": *"bun@[^"]*"' package.json | sed 's/.*bun@//;s/"//')
```

That value is passed to downstream workflows as the `bun_version` input.
`reusable-docker.yml` then derives the DHI base-image tag by truncating to the
minor series (`1.4.2` → `1.4`), because DHI does not publish every upstream
patch version:

```bash
DHI_BUN_TAG=$(echo "${{ inputs.bun_version }}" | cut -d. -f1,2)
```

Both `BUN_VERSION` and `DHI_BUN_TAG` are passed as Docker build args. Bumping
Bun means editing `package.json` and nothing else. Both the workflows and the
Dockerfile take the version as an input, so it stays correct everywhere.

## Feature Branch Deploys

Each non-`main` branch gets its own preview:

- Namespace `nextjs-{sanitized-branch}`, release
  `nextjs-app-{sanitized-branch}`.
- URL `https://{branch}-dev-{repo}.{CLOUDFLARE_DOMAIN}`.
- A NodePort is allocated from **31000–32000** (`PORT_RANGE_START` /
  `PORT_RANGE_END` in `feature-deploy.yml`) and recorded in the ConfigMap
  `feature-branch-port-mappings` in the `default` namespace. The workflow reads
  that ConfigMap to find a free port, so it is authoritative state living in
  the cluster, not in git. Editing it by hand can strand or double-allocate
  ports.
- Cloudflare Tunnel routes and DNS records are created or updated per branch.
- `feature-cleanup.yml` fires `on: delete` and releases the namespace, the
  port mapping, and the DNS record. Deleting a branch in the UI is what
  reclaims the port, and the range is small enough that stale branches matter.

## Required Secrets and Variables

Repository secrets (feature, staging, and production all target the same
cluster via a bearer token):

| Secret | Purpose |
|---|---|
| `KUBECONFIG_SERVER` | Cluster API URL (Cloudflare tunnel hostname) |
| `KUBECONFIG_TOKEN` | ServiceAccount bearer token |
| `CLOUDFLARE_API_TOKEN` | Tunnel + DNS permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account |
| `CLOUDFLARE_TUNNEL_ID` | Tunnel to attach routes to |
| `DHI_REGISTRY_USERNAME` | Pull the DHI Bun base images |
| `DHI_REGISTRY_PASSWORD` | Pull the DHI Bun base images |

Repository variables: `CLOUDFLARE_DOMAIN` (base domain for deploy URLs).

`GITHUB_TOKEN` is provided automatically and is used for ghcr.io pushes.

Deploy workflows validate these up front and fail with the list of missing
names. A deploy that fails immediately on "missing secrets" is a configuration
problem, not a code regression.

## Conventions

- Jobs declare least-privilege `permissions:` explicitly. Keep new jobs narrow.
- Deploy jobs pass `secrets: inherit` to reusable workflows.
- Pin actions by major version (`actions/checkout@v6`) consistently with
  existing calls.
- Reusable workflows take a `bun_version` input rather than reading
  `package.json` themselves. Keep that single-extraction pattern.
