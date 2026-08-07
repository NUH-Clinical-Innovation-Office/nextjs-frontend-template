# common-service Integration

How this app talks to [common-service](../../common-service-sample), what
credentials it uses, and what to configure before deploying.

## Topology

common-service has **no ingress**. It is reachable only from inside the
cluster, which is what forces the server-side proxy:

```
browser
  │  POST /api/notes           (same origin, no credential in the browser)
  ▼
client-sample  src/app/api/notes/route.ts   (Node runtime)
  │  POST /api/v1/todos        (cluster-internal, X-API-Key)
  ▼
common-service
  │  POST /api/v1/authenticate (exchanges the API key)
  ▼
auth-service                   (returns a short-lived, audience-bound JWT)
```

Both services deploy into the `sample-services` namespace. common-service's
Helm release is named `common-service` and its chart is also `common-service`,
so its fullname collapses to `common-service` and the Service resolves at:

```
http://common-service.sample-services.svc.cluster.local:8080
```

That value is the default in `src/lib/env.ts` and is set explicitly in
`helm/nextjs-app/values-production.yaml`.

## Authentication

common-service exposes two security schemes. Which one this app uses depends
entirely on whether `COMMON_SERVICE_API_KEY` is set.

### API key (the supported path)

This app acts as a **Consumer Backend**. It sends its developer API key as
`X-API-Key`; common-service exchanges it at auth-service for a short-lived,
audience-bound JWT and caches that token for its lifetime. The browser never
holds a credential, and the UI renders no token field.

The exchange is rate limited to **10 per minute per key**, which is why
common-service caches the resulting token rather than exchanging per request.

### Bearer token (local development only)

When no API key is configured the proxy falls back to forwarding a
caller-supplied `Authorization: Bearer` header, and the UI shows a token field.

> [!WARNING]
> A token obtained directly from auth-service's `/oauth2/token`
> (`client_credentials`) **will not work**. auth-service does not set an
> audience on those tokens, so Spring Authorization Server defaults `aud` to
> the requesting `client_id`, which never equals common-service's audience.
> Such a token is rejected with 401. Only a token produced by the API-key
> exchange is accepted.

This means the bearer path is genuinely only useful when you already hold an
exchanged token. For normal work, configure an API key.

## Configuration

### Local

Copy `.env.example` to `.env.local`:

```bash
COMMON_SERVICE_URL=http://localhost:8080
# COMMON_SERVICE_API_KEY=<from-secret-manager>
API_TIMEOUT=10000
```

Leave the key commented out to exercise the bearer fallback, or set it to test
the Consumer Backend path against a local common-service.

An **empty** `COMMON_SERVICE_URL` is a startup error rather than a silent
fallback to the default — see `src/lib/env.ts` for why.

### Production

`COMMON_SERVICE_URL` lives in `values-production.yaml`. It is a Kubernetes DNS
name, not a secret, so it is not sourced from a GitHub secret. Setting the
optional `COMMON_SERVICE_URL` repository secret overrides it via `extraEnv`,
which the deployment workflow appends after `env` so the later value wins.

The API key **is** a credential and is mounted from a Secret that must exist
in the namespace before deploying:

```bash
kubectl create secret generic client-sample-common-service \
  --from-literal=api-key=<developer-api-key> \
  --namespace=sample-services
```

The production deploy workflow checks for this Secret and fails with an
actionable message rather than letting the pod CrashLoopBackOff.

To deploy without an API key, set `commonServiceApiKey.secretName` to `""` and
the environment variable is omitted entirely.

## Error mapping

`route.ts` forwards the statuses a caller can act on and collapses everything
else to 502:

| Upstream      | Returned | Meaning                                          |
|---------------|----------|--------------------------------------------------|
| 200           | 200      | Accepted; payload validated against the schema   |
| 400           | 400      | Invalid body per common-service                  |
| 401           | 401      | Credential rejected                              |
| 413           | 413      | Body exceeded the 4 KiB cap                      |
| 429           | 429      | Rate limited; `Retry-After` propagated           |
| 503           | 503      | Exchange unconfigured, or auth-service unreachable |
| other non-2xx | 502      | Upstream fault; details deliberately not leaked  |
| timeout       | 504      | Exceeded `API_TIMEOUT`; worth retrying           |
| unreachable   | 502      | Usually misconfiguration                         |

Forwarded responses carry common-service's `{ "detail": ... }` message through
as `error`. The 429 is the documented exception: common-service emits it via
Go's `http.Error`, so the body is `text/plain` and a generic message is used.

Note that common-service's rate limiter keys on **client IP**. Because every
browser request arrives through this proxy, the upstream sees a single IP for
all users and the limit is shared across them.

## Contract drift

The request and response schemas in `route.ts` mirror `CreateTodoRequest` and
`TodoAcceptedResponse` in common-service's `api/openapi.yaml`. The response is
parsed with Zod, so a drifting upstream surfaces as a 502 rather than
propagating an unexpected shape to the browser.

If common-service's spec changes, update:

- `requestSchema` / `upstreamSchema` in `src/app/api/notes/route.ts`
- the corresponding tests in `src/app/api/notes/route.test.ts`

The endpoint is `/api/v1/todos` even though this app presents the concept as a
"note". The rename stops at the proxy boundary.
