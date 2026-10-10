import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';
import { env } from '../config/env';

export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  code?: string;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * In-memory rate limiting middleware.
 * NOTE: Operates per process instance. In a horizontally scaled cluster,
 * a shared store such as Redis is required for global limits.
 */
export class InMemoryRateLimiter {
  private readonly records = new Map<string, RateLimitRecord>();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly message: string;
  private readonly code: string;
  private readonly keyGenerator: (req: Request) => string;
  private readonly skip: (req: Request) => boolean;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
    this.message = options.message || 'Too many requests. Please try again later.';
    this.code = options.code || 'RATE_LIMITED';
    this.keyGenerator = options.keyGenerator || ((req: Request) => req.ip || req.socket.remoteAddress || 'unknown');
    this.skip =
      options.skip ||
      ((req: Request) =>
        (process.env.VITEST === 'true' ||
          process.env.NODE_ENV === 'test' ||
          env.NODE_ENV === 'test') &&
        req.headers['x-test-rate-limit'] !== 'true');

    // Periodic cleanup of expired records every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.purgeExpired();
    }, 5 * 60 * 1000);
    this.cleanupInterval.unref();
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (this.skip(req)) {
        return next();
      }

      const key = this.keyGenerator(req);
      const now = Date.now();
      const existing = this.records.get(key);


      if (!existing || now >= existing.resetAt) {
        const record: RateLimitRecord = {
          count: 1,
          resetAt: now + this.windowMs,
        };
        this.records.set(key, record);

        this.setHeaders(res, record);
        return next();
      }

      if (existing.count >= this.maxRequests) {
        const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
        res.setHeader('Retry-After', String(retryAfterSeconds));
        this.setHeaders(res, existing);

        sendError(res, this.message, this.code, 429, {
          retryAfter: retryAfterSeconds,
          limit: this.maxRequests,
        });
        return;
      }

      existing.count += 1;
      this.setHeaders(res, existing);
      return next();
    };
  }

  private setHeaders(res: Response, record: RateLimitRecord): void {
    const remaining = Math.max(0, this.maxRequests - record.count);
    const resetTimeSeconds = Math.ceil(record.resetAt / 1000);

    res.setHeader('RateLimit-Limit', String(this.maxRequests));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(resetTimeSeconds));
  }

  private purgeExpired(): void {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (now >= record.resetAt) {
        this.records.delete(key);
      }
    }
  }

  /**
   * Resets rate limiter records (useful for test isolation)
   */
  public reset(): void {
    this.records.clear();
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.records.clear();
  }
}

/**
 * Authentication rate limiter: 10 attempts per 15 minutes per IP
 */
export const authRateLimiter = new InMemoryRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
  code: 'AUTH_RATE_LIMITED',
});
