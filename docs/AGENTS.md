# docs/AGENTS.md

Long-form setup guides, roughly 180KB in total. They are written for humans doing
one-time provisioning, so read the one that matches the task instead of grepping
the directory. For day-to-day code work, the root and subdirectory `AGENTS.md`
files are the faster source.

## Index

| Doc | Read it when | Size |
|---|---|---|
| `features.md` | You need the feature inventory of the template. States that the codebase is the source of truth, so verify against code before relying on it. | 6K |
| `backend-integration.md` | Wiring this frontend to a backend API. | 6K |
| `kubernetes-setup.md` | Choosing between the two cluster options. Start here, then follow one of the two below. | 7K |
| `kubernetes-setup-raspberry-pi.md` | Provisioning the self-hosted K3s cluster on Raspberry Pi. This is the current production topology. | 17K |
| `kubernetes-setup-aws.md` | Provisioning EKS with Terraform. | 31K |
| `helm-kubernetes-setup.md` | Installing Helm and general chart workflow. For *this* chart's specifics, read `helm/AGENTS.md` first. | 38K |
| `cloudflare-github-setup.md` | Configuring Cloudflare Tunnel and the GitHub Actions secrets. The reference for how preview URLs and DNS are wired. | 31K |
| `vault-setup-and-deployment.md` | Setting up HashiCorp Vault, KV paths, and the Agent Injector that supplies runtime secrets. | 19K |

## Status Caveats

`kubernetes-setup-aws.md` describes a setup that is not deployed. The running
architecture is K3s plus Cloudflare Tunnel, per the workflows and Helm values,
so read the AWS guide as an option rather than a description of production.

Where a guide and the actual manifests disagree, the manifests win.
`helm/nextjs-app/values-*.yaml` and `.github/workflows/` are what runs.

## Writing Docs Here

These are reference guides with tables of contents, not agent instructions. Keep
agent-facing guidance in the nearest `AGENTS.md` instead. A fact that changes
with the code belongs next to the code.
