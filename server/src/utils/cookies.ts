import { Request, Response, CookieOptions } from 'express';
import { env } from '../config/env';

/**
 * Cookie options matching RULES.md Section 6 & F03 requirements
 */
export function getAuthCookieOptions(customEnv?: Partial<typeof env>): CookieOptions {
  const currentEnv = customEnv || env;
  const isProduction = currentEnv.NODE_ENV === 'production';

  // Determine SameSite policy:
  // 1. Explicit COOKIE_SAME_SITE if configured ('none' | 'lax' | 'strict')
  // 2. In production, default to 'none' for cross-site (Vercel frontend <-> Render backend) deployments
  // 3. In development/test, default to 'lax' for same-site localhost access
  const sameSite: 'none' | 'lax' | 'strict' =
    currentEnv.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');

  // Determine Secure flag:
  // Browsers reject SameSite=None unless Secure=true is also set.
  // In production, Secure is always true unless explicitly overridden.
  const secure =
    currentEnv.COOKIE_SECURE !== undefined
      ? currentEnv.COOKIE_SECURE
      : sameSite === 'none' || isProduction;

  return {
    httpOnly: true, // Prevents client-side scripts from reading token (XSS mitigation)
    secure,
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  };
}

/**
 * Attaches the HTTP-only JWT cookie to the response
 */
export function setAuthCookie(res: Response, token: string, customEnv?: Partial<typeof env>): void {
  res.cookie(env.COOKIE_NAME, token, getAuthCookieOptions(customEnv));
}

/**
 * Clears the HTTP-only JWT cookie upon logout
 */
export function clearAuthCookie(res: Response, customEnv?: Partial<typeof env>): void {
  const options = getAuthCookieOptions(customEnv);
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  });
}

/**
 * Extracts authentication token from incoming request cookies
 */
export function getAuthTokenFromRequest(req: Request): string | undefined {
  if (req.cookies && typeof req.cookies === 'object' && req.cookies[env.COOKIE_NAME]) {
    return req.cookies[env.COOKIE_NAME];
  }
  return undefined;
}

