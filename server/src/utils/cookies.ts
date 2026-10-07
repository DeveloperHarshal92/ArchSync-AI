import { Request, Response, CookieOptions } from 'express';
import { env } from '../config/env';

/**
 * Cookie options matching RULES.md Section 6 & F03 requirements
 */
export function getAuthCookieOptions(): CookieOptions {
  const isProduction = env.NODE_ENV === 'production';

  return {
    httpOnly: true, // Prevents client-side scripts from reading token (XSS mitigation)
    secure: isProduction, // HTTPS required in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF defense
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  };
}

/**
 * Attaches the HTTP-only JWT cookie to the response
 */
export function setAuthCookie(res: Response, token: string): void {
  res.cookie(env.COOKIE_NAME, token, getAuthCookieOptions());
}

/**
 * Clears the HTTP-only JWT cookie upon logout
 */
export function clearAuthCookie(res: Response): void {
  const options = getAuthCookieOptions();
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
