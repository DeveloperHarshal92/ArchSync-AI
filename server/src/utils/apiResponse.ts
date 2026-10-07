import { Response } from 'express';
import { ApiSuccessResponse, ApiErrorResponse } from '@archsync/shared';

/**
 * Sends a standard success response matching RULES.md Section 9
 */
export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response {
  const payload: ApiSuccessResponse<T> = {
    success: true,
    data,
  };
  return res.status(statusCode).json(payload);
}

/**
 * Sends a standard error response matching RULES.md Section 9
 */
export function sendError(
  res: Response,
  message: string,
  code = 'INTERNAL_ERROR',
  statusCode = 500,
  details?: unknown
): Response {
  const payload: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
  return res.status(statusCode).json(payload);
}
