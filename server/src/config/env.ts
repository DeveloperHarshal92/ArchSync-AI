import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from current directory, workspace root, and server directory
dotenv.config(); // cwd
dotenv.config({ path: path.resolve(__dirname, '../../../.env') }); // root from src/config
dotenv.config({ path: path.resolve(process.cwd(), '../.env') }); // parent if run from server/
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // server root from src/config

export const DEFAULT_DEV_JWT_SECRET = 'archsync_jwt_secret_dev_key_super_secure_32chars';

export const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(5000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CLIENT_URL: z.string().default('http://localhost:5173'),
    MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/archsync'),
    JWT_SECRET: z.string().default(DEFAULT_DEV_JWT_SECRET),
    JWT_EXPIRES_IN: z.string().default('7d'),
    COOKIE_NAME: z.string().default('auth_token'),
    COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).optional(),
    COOKIE_SECURE: z.coerce.boolean().optional(),
    TRUST_PROXY: z.coerce.boolean().default(false),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
    AI_API_KEY: z.string().optional(),
    AI_MODEL: z.string().default('gemini-2.5-flash'),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production') {
      if (!data.JWT_SECRET || data.JWT_SECRET === DEFAULT_DEV_JWT_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_SECRET'],
          message:
            'In production, JWT_SECRET must be explicitly set and cannot use the development default secret',
        });
      } else if (data.JWT_SECRET.length < 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_SECRET'],
          message: 'In production, JWT_SECRET must be at least 32 characters long',
        });
      }
    } else {
      if (data.JWT_SECRET && data.JWT_SECRET.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_SECRET'],
          message: 'JWT_SECRET must be at least 10 characters long',
        });
      }
    }
  });

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(rawEnv: Record<string, unknown> = process.env): EnvConfig {
  const result = envSchema.safeParse(rawEnv);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Environment configuration validation failed:\n${errorDetails}`);
  }
  return result.data;
}

let parsedEnv: EnvConfig;
try {
  parsedEnv = validateEnv(process.env);
} catch (error) {
  console.error('[ArchSync AI] FATAL: Invalid environment configuration:');
  if (error instanceof Error) {
    console.error(error.message);
  }
  throw error;
}

export const env: EnvConfig = parsedEnv;

