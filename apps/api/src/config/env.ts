import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const envSchema = z.object({
  DATABASE_URL: z.string().default('postgresql://localhost:5432/frms'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.string().default('development'),
  LOG_LEVEL: z.string().default('info'),
  JWT_ACCESS_SECRET: z.string().default('fallback_secret_for_preview_environments_only'),
  JWT_REFRESH_SECRET: z.string().default('fallback_secret_for_preview_environments_only'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_MAX: z.coerce.number().default(1000),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
});

let parsedEnv: any;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (err) {
  console.error('ZOD ENV VALIDATION ERROR:', err);
  parsedEnv = {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/frms',
    PORT: 3000,
    HOST: '0.0.0.0',
    NODE_ENV: process.env.NODE_ENV || 'development',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'fallback_secret_for_preview_environments_only',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback_secret_for_preview_environments_only',
    ACCESS_TOKEN_EXPIRES_IN: '15m',
    REFRESH_TOKEN_EXPIRES_IN: '7d',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    RATE_LIMIT_MAX: 1000,
    RATE_LIMIT_WINDOW_MS: 60000,
  };
}

export const env = parsedEnv as z.infer<typeof envSchema>;
