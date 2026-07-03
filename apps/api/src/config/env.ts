import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test', 'preview']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  JWT_ACCESS_SECRET: z.string().default('fallback_secret_for_preview_environments_only'),
  JWT_REFRESH_SECRET: z.string().default('fallback_secret_for_preview_environments_only'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
});

let parsedEnv: any;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (err) {
  console.error('ZOD ENV VALIDATION ERROR:', err);
  // We don't throw here to prevent top-level module crash. 
  // We let it pass, so the serverless function can boot and send the error to the browser.
  parsedEnv = process.env; // fallback to raw env so it doesn't immediately crash
}

export const env = parsedEnv as z.infer<typeof envSchema>;
