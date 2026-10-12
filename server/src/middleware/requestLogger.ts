import morgan from 'morgan';
import { RequestHandler } from 'express';
import { env } from '../config/env';

/**
 * HTTP request logger middleware using morgan.
 * - Uses 'combined' format in production for standardized structured access logs.
 * - Uses 'dev' format in development for concise colored terminal output.
 * - Automatically skips logging in test environment to keep test output clean.
 */
export const requestLogger: RequestHandler = morgan(
  env.NODE_ENV === 'production' ? 'combined' : 'dev',
  {
    skip: () => env.NODE_ENV === 'test',
  }
);
