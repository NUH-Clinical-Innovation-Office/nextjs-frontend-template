/** biome-ignore-all lint/style/useNamingConvention: Environment variables use uppercase naming convention */
import { z } from 'zod';

// Parsing happens at module load, so a bad environment fails the process on
// startup rather than at the first request that reads a variable.

// NEXT_PUBLIC_ variables reach the browser, so nothing secret belongs here.
const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),

  NEXT_PUBLIC_API_URL: z.string().default('http://localhost:3000/api'),
});

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  API_URL: z.string().optional(),

  API_SECRET: z
    .string()
    .min(32, 'API_SECRET must be at least 32 characters for security')
    .optional(),

  API_TIMEOUT: z
    .string()
    .default('10000')
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().positive()),

  // Prometheus metrics server (consumed by src/instrumentation.ts).
  // Defaults to 9464 to match the ServiceMonitor selector in
  // helm/nextjs-app/templates/servicemonitor.yaml.
  METRICS_PORT: z
    .string()
    .default('9464')
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().min(1).max(65535)),

  METRICS_PATH: z.string().startsWith('/').default('/metrics'),
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

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;

export const isProduction = env.NODE_ENV === 'production';

export const isDevelopment = env.NODE_ENV === 'development';

export const isTest = env.NODE_ENV === 'test';
