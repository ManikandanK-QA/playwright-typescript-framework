import { z } from 'zod';

/**
 * Environment configuration is validated once, at startup.
 *
 * A typo in a URL or an unsupported log level fails the run immediately with a
 * readable message instead of silently falling back or producing a confusing
 * timeout three minutes later.
 */
const absoluteUrl = z
  .string()
  .regex(/^https?:\/\/\S+$/i, 'must be an absolute http(s) URL (e.g. https://example.com)');

const EnvSchema = z.object({
  BASE_URL: absoluteUrl.default('https://www.saucedemo.com'),
  API_BASE_URL: absoluteUrl.default('https://restful-booker.herokuapp.com'),

  SAUCE_USERNAME: z.string().min(1).default('standard_user'),
  SAUCE_PASSWORD: z.string().min(1).default('secret_sauce'),

  BOOKER_USERNAME: z.string().min(1).default('admin'),
  BOOKER_PASSWORD: z.string().min(1).default('password123'),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof EnvSchema>;

function loadEnv(source: NodeJS.ProcessEnv): Env {
  const parsed = EnvSchema.safeParse(source);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  return parsed.data;
}

export const env = loadEnv(process.env);

export function normalizeUrl(value: string): string {
  return value.replace(/\/+$/, '');
}
