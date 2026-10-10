import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import mongoose, { Types } from 'mongoose';
import { app } from '../app';
import { env, validateEnv, DEFAULT_DEV_JWT_SECRET } from '../config/env';
import { getAuthCookieOptions } from '../utils/cookies';
import { authRateLimiter } from '../middleware/rateLimiter';
import { dbManager } from '../config/database';
import { geminiProvider } from '../ai/providers/gemini.provider';
import { architectureService } from '../services/architecture.service';
import { ArchitectureModel } from '../models/architecture.model';
import { ProjectModel } from '../models/project.model';
import { ProjectMemberModel } from '../models/projectMember.model';
import { User } from '../models/user.model';
import { hashPassword } from '../utils/password';

describe('ArchSync AI — F15 Production Hardening Test Suite', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@example\.com$/i } });
    await ProjectModel.deleteMany({ name: 'Concurrency Test Project' });
    await ArchitectureModel.deleteMany({});
    await ProjectMemberModel.deleteMany({});
    await mongoose.disconnect();
  });

  describe('1. Production Cookie Security & SameSite Policy', () => {
    it('GIVEN production environment without custom override, THEN default to SameSite=none and Secure=true', () => {
      const options = getAuthCookieOptions({
        NODE_ENV: 'production',
      });

      expect(options.httpOnly).toBe(true);
      expect(options.secure).toBe(true);
      expect(options.sameSite).toBe('none');
      expect(options.path).toBe('/');
    });

    it('GIVEN production environment with explicit COOKIE_SAME_SITE=lax, THEN respect configuration', () => {
      const options = getAuthCookieOptions({
        NODE_ENV: 'production',
        COOKIE_SAME_SITE: 'lax',
      });

      expect(options.sameSite).toBe('lax');
      expect(options.secure).toBe(true);
      expect(options.httpOnly).toBe(true);
    });

    it('GIVEN development environment, THEN default to SameSite=lax and Secure=false', () => {
      const options = getAuthCookieOptions({
        NODE_ENV: 'development',
      });

      expect(options.httpOnly).toBe(true);
      expect(options.secure).toBe(false);
      expect(options.sameSite).toBe('lax');
    });

    it('GIVEN explicit SameSite=none in any environment, THEN Secure must be forced to true', () => {
      const options = getAuthCookieOptions({
        NODE_ENV: 'development',
        COOKIE_SAME_SITE: 'none',
      });

      expect(options.sameSite).toBe('none');
      expect(options.secure).toBe(true);
    });
  });

  describe('2. Strict Production JWT_SECRET Validation', () => {
    it('GIVEN production environment with missing JWT_SECRET, THEN validation fails', () => {
      expect(() => {
        validateEnv({
          NODE_ENV: 'production',
          CLIENT_URL: 'https://archsync.vercel.app',
          MONGODB_URI: 'mongodb://localhost:27017/test',
        });
      }).toThrow('In production, JWT_SECRET must be explicitly set and cannot use the development default secret');
    });

    it('GIVEN production environment with default development JWT_SECRET, THEN validation fails', () => {
      expect(() => {
        validateEnv({
          NODE_ENV: 'production',
          JWT_SECRET: DEFAULT_DEV_JWT_SECRET,
          CLIENT_URL: 'https://archsync.vercel.app',
          MONGODB_URI: 'mongodb://localhost:27017/test',
        });
      }).toThrow('cannot use the development default secret');
    });

    it('GIVEN production environment with short JWT_SECRET (< 32 chars), THEN validation fails', () => {
      expect(() => {
        validateEnv({
          NODE_ENV: 'production',
          JWT_SECRET: 'short_secret_under_32_chars',
          CLIENT_URL: 'https://archsync.vercel.app',
          MONGODB_URI: 'mongodb://localhost:27017/test',
        });
      }).toThrow('must be at least 32 characters long');
    });

    it('GIVEN production environment with valid 32+ character JWT_SECRET, THEN validation succeeds', () => {
      const validConfig = validateEnv({
        NODE_ENV: 'production',
        JWT_SECRET: 'a_very_strong_production_secret_key_with_sufficient_entropy_64chars',
        CLIENT_URL: 'https://archsync.vercel.app',
        MONGODB_URI: 'mongodb://localhost:27017/test',
      });

      expect(validConfig.NODE_ENV).toBe('production');
      expect(validConfig.JWT_SECRET).toBe('a_very_strong_production_secret_key_with_sufficient_entropy_64chars');
    });

    it('GIVEN development environment without explicit JWT_SECRET, THEN fallback default is permitted', () => {
      const devConfig = validateEnv({
        NODE_ENV: 'development',
        CLIENT_URL: 'http://localhost:5173',
      });

      expect(devConfig.JWT_SECRET).toBe(DEFAULT_DEV_JWT_SECRET);
    });
  });

  describe('3. Authentication Rate Limiting', () => {
    beforeEach(() => {
      authRateLimiter.reset();
    });

    afterEach(() => {
      authRateLimiter.reset();
    });

    it('GIVEN authentication requests within limit, THEN requests proceed normally', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('x-test-rate-limit', 'true')
        .send({ email: 'nonexistent@example.com', password: 'Password123!' });

      expect(res.headers).toHaveProperty('ratelimit-limit');
      expect(res.headers).toHaveProperty('ratelimit-remaining');
      // Should be 401 invalid credentials, NOT 429
      expect(res.status).toBe(401);
    });

    it('GIVEN authentication requests exceeding limit (10 requests), THEN returns HTTP 429 RATE_LIMITED', async () => {
      // Send 10 requests to reach limit
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .set('x-test-rate-limit', 'true')
          .send({ email: 'test@example.com', password: 'Password123!' });
      }

      // 11th request must be rejected with HTTP 429
      const rateLimitedRes = await request(app)
        .post('/api/v1/auth/login')
        .set('x-test-rate-limit', 'true')
        .send({ email: 'test@example.com', password: 'Password123!' });

      expect(rateLimitedRes.status).toBe(429);
      expect(rateLimitedRes.body.success).toBe(false);
      expect(rateLimitedRes.body.error.code).toBe('AUTH_RATE_LIMITED');
      expect(rateLimitedRes.headers).toHaveProperty('retry-after');
    });

  });

  describe('4. Health, Liveness, and Readiness Endpoints', () => {
    it('GET /api/v1/health/live returns HTTP 200 with alive status', async () => {
      const res = await request(app).get('/api/v1/health/live');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('alive');
      expect(res.body.data.service).toBe('archsync-api');
    });

    it('GET /api/v1/health/ready returns HTTP 200 when database is connected', async () => {
      const res = await request(app).get('/api/v1/health/ready');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ready).toBe(true);
      expect(res.body.data.database).toBe('connected');
    });

    it('GET /api/v1/health/ready returns HTTP 503 when database is not connected', async () => {
      // Mock getState to report disconnected
      const getStateSpy = vi.spyOn(dbManager, 'getState').mockReturnValue('disconnected');

      const res = await request(app).get('/api/v1/health/ready');

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('SERVICE_NOT_READY');
      expect(res.body.error.details.ready).toBe(false);

      getStateSpy.mockRestore();
    });

    it('GET /api/v1/health returns complete status with database state', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
      expect(res.body.data.database).toBe('connected');
    });
  });

  describe('5. Gemini Provider Header Transmission', () => {
    it('GIVEN Gemini API request, THEN API key is passed in x-goog-api-key header and NOT in URL query string', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      let capturedHeaders: Record<string, string> = {};

      global.fetch = vi.fn().mockImplementation((url: string, init: RequestInit) => {
        capturedUrl = url;
        capturedHeaders = init.headers as Record<string, string>;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              candidates: [
                {
                  content: {
                    parts: [{ text: JSON.stringify({ summary: 'Analysis completed', findings: [], recommendations: [], risks: [], assumptions: [], confidence: 'HIGH' }) }],
                  },
                },
              ],
            }),
        });
      });

      try {
        const customProvider = new (geminiProvider.constructor as any)('test_gemini_api_key_12345');
        await customProvider.generateResponse({
          systemInstruction: 'Test instruction',
          prompt: 'Test prompt',
        });

        // 1. URL must NOT contain the secret API key in query parameters
        expect(capturedUrl).not.toContain('?key=');
        expect(capturedUrl).not.toContain('test_gemini_api_key_12345');

        // 2. Secret API key MUST be transmitted via the x-goog-api-key header
        expect(capturedHeaders['x-goog-api-key']).toBe('test_gemini_api_key_12345');
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('6. Atomic Architecture Version Concurrency Control', () => {
    let testUserId: string;
    let testProjectId: string;

    beforeEach(async () => {
      const passwordHash = await hashPassword('Password123!');
      const user = await User.create({
        name: 'Hardening User',
        email: `hardening-${Date.now()}@example.com`,
        passwordHash,
      });
      testUserId = user.id;

      const project = await ProjectModel.create({
        name: 'Concurrency Test Project',
        ownerId: new Types.ObjectId(testUserId),
      });
      testProjectId = project.id;

      await ProjectMemberModel.create({
        projectId: project._id,
        userId: user._id,
        role: 'OWNER',
        joinedAt: new Date(),
      });

      // Seed architecture at version 1
      await ArchitectureModel.create({
        projectId: project._id,
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        version: 1,
      });
    });

    it('GIVEN two competing writes with the same base version, THEN only one succeeds and the other receives 409 VERSION_CONFLICT', async () => {
      const nodeA = {
        id: 'node-a',
        type: 'server' as const,
        position: { x: 100, y: 100 },
        data: { label: 'Node A' },
      };
      const nodeB = {
        id: 'node-b',
        type: 'database' as const,
        position: { x: 200, y: 200 },
        data: { label: 'Node B' },
      };

      // Both requests submit version: 1
      const writeA = architectureService.replaceArchitecture(testUserId, testProjectId, {
        nodes: [nodeA],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        version: 1,
      });

      const writeB = architectureService.replaceArchitecture(testUserId, testProjectId, {
        nodes: [nodeB],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        version: 1,
      });

      const results = await Promise.allSettled([writeA, writeB]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      // Exactly one write must succeed
      expect(fulfilled).toHaveLength(1);
      // Exactly one write must fail with VERSION_CONFLICT
      expect(rejected).toHaveLength(1);

      const rejectedReason = (rejected[0] as PromiseRejectedResult).reason;
      expect(rejectedReason.code).toBe('VERSION_CONFLICT');
      expect(rejectedReason.statusCode).toBe(409);

      // Verify the persisted document advanced to version 2
      const finalDoc = await ArchitectureModel.findOne({ projectId: new Types.ObjectId(testProjectId) });
      expect(finalDoc?.version).toBe(2);
    });
  });
});
