/**
 * Liveness/readiness probe target.
 *
 * Kubernetes probes previously hit `/`, which is a dynamic route (the home page
 * is a client component and is therefore absent from the prerender manifest).
 * Every probe re-rendered the full showcase tree server-side, burning ~10x the
 * idle CPU of an equivalent statically-served app. This route does no rendering
 * and is excluded from the proxy matcher, so a probe costs a constant-size
 * response and nothing else.
 */
export const dynamic = 'force-static';

// Next.js resolves route handlers by HTTP-verb export name, so `GET` is fixed.
// biome-ignore lint/style/useNamingConvention: framework-mandated export name
export function GET() {
  return new Response('ok', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}
