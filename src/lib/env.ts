/** biome-ignore-all lint/style/useNamingConvention: Environment variables use uppercase naming convention */
import { z } from 'zod';

/**
 * Environment variable schema with Zod validation
 *
 * This module provides type-safe access to environment variables with runtime validation.
 * Variables are validated on application startup to catch configuration errors early.
 *
 * Usage:
 * ```ts
 * import { env } from '@/lib/env'
 *
 * // Access validated environment variables
 * const apiUrl = env.NEXT_PUBLIC_API_URL
 * const apiSecret = env.API_SECRET
 * ```
 */

/**
 * Client-side environment variables schema (prefixed with NEXT_PUBLIC_)
 * These variables are exposed to the browser and must be safe to expose publicly
 */
const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),

  NEXT_PUBLIC_API_URL: z.string().default('http://localhost:3000/api'),
});

/**
 * Server-side environment variables schema (not exposed to browser)
 * These variables should contain sensitive data like API keys and secrets
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // API Configuration
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

  // Database (uncomment when needed)
  // DATABASE_URL: z
  // 	.string()
  // 	.url("DATABASE_URL must be a valid connection string")
  // 	.optional(),

  // DATABASE_POOL_MIN: z
  // 	.string()
  // 	.transform((val) => Number.parseInt(val, 10))
  // 	.pipe(z.number().min(1))
  // 	.default("2"),

  // DATABASE_POOL_MAX: z
  // 	.string()
  // 	.transform((val) => Number.parseInt(val, 10))
  // 	.pipe(z.number().max(100))
  // 	.default("10"),

  // Authentication (uncomment when needed)
  // NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL").optional(),
  // NEXTAUTH_SECRET: z
  // 	.string()
  // 	.min(32, "NEXTAUTH_SECRET must be at least 32 characters")
  // 	.optional(),

  // OAuth Providers (uncomment when needed)
  // GOOGLE_CLIENT_ID: z.string().optional(),
  // GOOGLE_CLIENT_SECRET: z.string().optional(),
  // GITHUB_CLIENT_ID: z.string().optional(),
  // GITHUB_CLIENT_SECRET: z.string().optional(),

  // Third-Party Services (uncomment when needed)
  // NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  // SENTRY_AUTH_TOKEN: z.string().optional(),

  // Analytics (uncomment when needed)
  // NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  // NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  // NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),

  // Email Service (uncomment when needed)
  // SMTP_HOST: z.string().optional(),
  // SMTP_PORT: z
  // 	.string()
  // 	.transform((val) => Number.parseInt(val, 10))
  // 	.pipe(z.number().min(1).max(65535))
  // 	.optional(),
  // SMTP_USER: z.string().optional(),
  // SMTP_PASSWORD: z.string().optional(),
  // SMTP_FROM: z.string().email().optional(),

  // AWS S3 (uncomment when needed)
  // AWS_ACCESS_KEY_ID: z.string().optional(),
  // AWS_SECRET_ACCESS_KEY: z.string().optional(),
  // AWS_REGION: z.string().optional(),
  // AWS_S3_BUCKET: z.string().optional(),
});

/**
 * Combined schema for all environment variables
 */
const envSchema = clientSchema.merge(serverSchema);

/**
 * Validate and parse environment variables
 * @returns Validated environment variables with proper types
 * @throws {ZodError} If validation fails, with detailed error messages
 */
function validateEnv() {
  // Parse and validate environment variables
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

/**
 * Validated environment variables with proper TypeScript types
 *
 * All variables are validated at runtime during application startup.
 * TypeScript provides autocomplete and type checking for all env vars.
 */
export const env = validateEnv();

/**
 * Type definition for environment variables (useful for extensions)
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Check if running in production environment
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in development environment
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in test environment
 */
export const isTest = env.NODE_ENV === 'test';
