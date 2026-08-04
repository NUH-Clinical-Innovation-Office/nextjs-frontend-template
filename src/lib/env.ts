/** biome-ignore-all lint/style/useNamingConvention: Environment variables use uppercase naming convention */
import { z } from 'zod';

/**
 * Environment variable schema with Zod validation.
 *
 * Variables are validated once at startup so configuration errors surface
 * immediately rather than on the first request.
 *
 * ```ts
 * import { env } from '@/lib/env'
 *
 * const upstream = env.COMMON_SERVICE_URL
 * ```
 */

/**
 * Client-side variables (prefixed with NEXT_PUBLIC_). These are inlined into
 * the browser bundle, so they must be safe to expose publicly.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
});

/**
 * Server-side variables. Never exposed to the browser.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  /**
   * Cluster-internal address of common-service. Deliberately server-only: the
   * service has no ingress, so this hostname resolves only from inside the
   * cluster and must never be inlined into the browser bundle.
   */
  COMMON_SERVICE_URL: z
    .string()
    .default('http://common-service.sample-services.svc.cluster.local:8080'),

  /** Upstream request timeout in milliseconds. */
  API_TIMEOUT: z
    .string()
    .default('10000')
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().positive()),
});

const envSchema = clientSchema.merge(serverSchema);

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

/** Validated environment variables with proper TypeScript types. */
export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
