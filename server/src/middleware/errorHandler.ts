import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/apiResponse';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

/**
 * Centralized application error handling middleware matching RULES.md Section 9
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle explicit domain AppError
  if (err instanceof AppError) {
    sendError(res, err.message, err.code, err.statusCode, err.details);
    return;
  }

  // Handle Zod schema validation errors
  if (err instanceof ZodError) {
    const issues = err.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
      rule: i.code,
    }));
    sendError(res, 'Validation failed for request parameters or body', 'VALIDATION_ERROR', 400, issues);
    return;
  }

  // Handle malformed JSON request bodies
  if (err instanceof SyntaxError && 'status' in err && (err as { status: unknown }).status === 400) {
    sendError(res, 'Malformed JSON in request body', 'INVALID_JSON', 400);
    return;
  }

  // Handle unexpected internal server errors
  const isProduction = env.NODE_ENV === 'production';
  const errorMessage = isProduction
    ? 'An unexpected internal server error occurred'
    : (err instanceof Error ? err.message : String(err));

  const debugDetails = isProduction
    ? undefined
    : (err instanceof Error ? { stack: err.stack } : { raw: err });

  sendError(res, errorMessage, 'INTERNAL_SERVER_ERROR', 500, debugDetails);
}
