import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express, { Router } from 'express';
import { z } from 'zod';
import { app } from '../app';
import { validate } from '../middleware/validate';
import { errorHandler } from '../middleware/errorHandler';
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
} from '../utils/errors';
import { env } from '../config/env';

describe('ArchSync AI — F02 Backend Foundation Test Suite', () => {
  describe('1. Health Check Endpoint', () => {
    it('GIVEN the backend is running, WHEN GET /api/v1/health is requested, THEN the server returns HTTP 200 with the standardized success response', async () => {
      const response = await request(app).get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject({
        status: 'healthy',
        service: 'archsync-api',
        version: '0.1.0',
      });
      expect(typeof response.body.data.timestamp).toBe('string');
      expect(typeof response.body.data.uptime).toBe('number');
      expect(typeof response.body.data.environment).toBe('string');
    });
  });

  describe('2. Not Found 404 Handler', () => {
    it('GIVEN an unknown API route is requested, WHEN the request reaches the backend, THEN the server returns the standardized 404 error response', async () => {
      const response = await request(app).get('/api/v1/non-existent-route-404');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatchObject({
        code: 'NOT_FOUND',
      });
      expect(response.body.error.message).toContain('Route not found');
    });
  });

  describe('3. Validation Middleware Foundation', () => {
    it('GIVEN invalid input is passed to a Zod-protected route, WHEN validation executes, THEN the request is rejected with the standardized error structure', async () => {
      // Test app mounting isolated validation route
      const testApp = express();
      testApp.use(express.json());

      const testSchema = {
        body: z.object({
          name: z.string().min(3, 'Name must have at least 3 characters'),
          email: z.string().email('Invalid email address'),
        }),
      };

      testApp.post('/test-validation', validate(testSchema), (_req, res) => {
        res.status(200).json({ success: true, data: { ok: true } });
      });
      testApp.use(errorHandler);

      // 1. Invalid input test
      const invalidResponse = await request(testApp)
        .post('/test-validation')
        .send({ name: 'ab', email: 'not-an-email' });

      expect(invalidResponse.status).toBe(400);
      expect(invalidResponse.body).toHaveProperty('success', false);
      expect(invalidResponse.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed for request parameters or body',
      });
      expect(Array.isArray(invalidResponse.body.error.details)).toBe(true);
      expect(invalidResponse.body.error.details.length).toBeGreaterThanOrEqual(2);

      // 2. Valid input test
      const validResponse = await request(testApp)
        .post('/test-validation')
        .send({ name: 'Valid Project', email: 'architect@archsync.io' });

      expect(validResponse.status).toBe(200);
      expect(validResponse.body).toHaveProperty('success', true);
    });
  });

  describe('4. Centralized Error Handling & Protection', () => {
    it('GIVEN an unexpected server error occurs, WHEN the error reaches the centralized handler, THEN the response uses the standardized error structure without exposing sensitive internals in production mode', async () => {
      const testApp = express();
      const testRouter = Router();

      testRouter.get('/fail', () => {
        throw new Error('Database driver internal stack error');
      });

      testApp.use(testRouter);
      testApp.use(errorHandler);

      // Development / Test mode response check
      const response = await request(testApp).get('/fail');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      });

      // Explicitly verify production behavior does not leak stack trace
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as express.Response;

      const originalEnv = env.NODE_ENV;
      (env as { NODE_ENV: string }).NODE_ENV = 'production';

      try {
        errorHandler(
          new Error('Sensitive database credentials leak test'),
          {} as express.Request,
          mockRes,
          vi.fn()
        );

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected internal server error occurred',
          },
        });
      } finally {
        (env as { NODE_ENV: string }).NODE_ENV = originalEnv;
      }
    });

    it('GIVEN domain AppErrors are thrown, THEN they map to appropriate HTTP status codes and codes', () => {
      expect(new AppError('Custom message', 418, 'TEAPOT')).toMatchObject({ statusCode: 418, code: 'TEAPOT' });
      expect(new BadRequestError()).toMatchObject({ statusCode: 400, code: 'BAD_REQUEST' });
      expect(new UnauthorizedError()).toMatchObject({ statusCode: 401, code: 'UNAUTHORIZED' });
      expect(new ForbiddenError()).toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
      expect(new NotFoundError()).toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
      expect(new ConflictError()).toMatchObject({ statusCode: 409, code: 'CONFLICT' });
      expect(new InternalServerError()).toMatchObject({ statusCode: 500, code: 'INTERNAL_SERVER_ERROR' });
    });
  });

  describe('5. CORS & Security Headers', () => {
    it('GIVEN a request originates from the configured frontend origin, WHEN the backend receives a credentialed request, THEN the appropriate CORS headers are returned', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .set('Origin', env.CLIENT_URL);

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe(env.CLIENT_URL);
      expect(response.headers['access-control-allow-credentials']).toBe('true');
      expect(response.headers).toHaveProperty('content-security-policy');
      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
    });
  });
});
