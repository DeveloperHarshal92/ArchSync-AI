import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Async wrapper catching rejected promises and routing them to the error middleware
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
