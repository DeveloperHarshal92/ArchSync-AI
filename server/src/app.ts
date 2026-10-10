import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { apiV1Router } from './routes';
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';

/**
 * Extracts normalized allowed origins from CLIENT_URL configuration
 */
export function getAllowedOrigins(): string[] {
  return env.CLIENT_URL.split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

/**
 * Creates and configures the Express application
 */
export function createApp(): Application {
  const app: Application = express();

  // Configure trust proxy for reverse-proxy deployments (Render, Cloudflare, etc.)
  if (env.NODE_ENV === 'production' || env.TRUST_PROXY) {
    app.set('trust proxy', 1);
  }

  // Security headers via Helmet
  app.use(helmet());

  // CORS configuration matching RULES.md Section 6 & 8 and F15 requirements
  const allowedOrigins = getAllowedOrigins();
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!requestOrigin) {
          return callback(null, true);
        }
        const normalizedRequestOrigin = requestOrigin.trim().replace(/\/+$/, '');
        if (allowedOrigins.includes(normalizedRequestOrigin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );


  // Cookie parsing middleware
  app.use(cookieParser());

  // Body parsing middleware
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Base API v1 routing
  app.use('/api/v1', apiV1Router);

  // Catch-all 404 handler
  app.use(notFoundHandler);

  // Centralized error handling
  app.use(errorHandler);

  return app;
}

export const app: Application = createApp();
