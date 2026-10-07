import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from current directory, workspace root, and server directory
dotenv.config(); // cwd
dotenv.config({ path: path.resolve(__dirname, '../../../.env') }); // root from src/config
dotenv.config({ path: path.resolve(process.cwd(), '../.env') }); // parent if run from server/
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // server root from src/config

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/archsync'),
  JWT_SECRET: z
    .string()
    .min(10, 'JWT_SECRET must be at least 10 characters long')
    .default('archsync_jwt_secret_dev_key_super_secure_32chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_NAME: z.string().default('auth_token'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default('gemini-2.5-flash'),
});

export type EnvConfig = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[ArchSync AI] FATAL: Invalid environment configuration:');
  parsed.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  });
  throw new Error('Environment configuration validation failed');
}

export const env: EnvConfig = parsed.data;
