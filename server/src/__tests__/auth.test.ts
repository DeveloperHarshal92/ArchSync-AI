import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { User } from '../models/user.model';
import { env } from '../config/env';

describe('ArchSync AI — F03 Authentication Behavioral Test Suite', () => {
  const testUser = {
    name: 'Harshal Architect',
    email: 'architect.test@archsync.io',
    password: 'SecurePassword123!',
  };

  function getSetCookieList(res: request.Response): string[] {
    const header = res.headers['set-cookie'];
    if (!header) return [];
    return Array.isArray(header) ? (header as string[]) : [String(header)];
  }

  beforeAll(async () => {
    // Ensure database connection is active for integration tests
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    // Clean up test data and disconnect
    await User.deleteMany({ email: { $regex: /@archsync\.io$/i } });
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clear user test collection between tests for determinism
    await User.deleteMany({ email: { $regex: /@archsync\.io$/i } });
  });

  describe('1. Registration (/api/v1/auth/register)', () => {
    it('GIVEN an unauthenticated user provides valid registration data, WHEN they submit registration, THEN a user is created and an HTTP-only authentication cookie is established', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toMatchObject({
        name: testUser.name,
        email: testUser.email.toLowerCase(),
        role: 'USER',
      });
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('createdAt');

      // Verify HTTP-only cookie is set
      const cookies = getSetCookieList(response);
      expect(cookies.length).toBeGreaterThan(0);
      const authCookie = cookies.find((c) => c.startsWith(`${env.COOKIE_NAME}=`));
      expect(authCookie).toBeDefined();
      expect(authCookie).toContain('HttpOnly');
      expect(authCookie).toContain('Path=/');

      // Verify user is persisted in MongoDB with hashed password
      const savedUser = await User.findOne({ email: testUser.email.toLowerCase() }).select('+passwordHash');
      expect(savedUser).not.toBeNull();
      expect(savedUser?.passwordHash).toBeDefined();
      expect(savedUser?.passwordHash).not.toBe(testUser.password);
    });

    it('GIVEN a user registers with an existing email, WHEN registration is submitted, THEN the API rejects the request with a controlled duplicate-email error', async () => {
      // Pre-register user
      await request(app).post('/api/v1/auth/register').send(testUser);

      // Attempt duplicate registration
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Another User',
          email: testUser.email.toUpperCase(), // Test case-insensitivity
          password: 'AnotherPassword456!',
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatchObject({
        code: 'EMAIL_ALREADY_EXISTS',
      });
      expect(response.body.error.message).toContain('already exists');
    });

    it('GIVEN a user provides invalid registration data, WHEN registration is submitted, THEN validation fails and no user is created', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'A', // Too short (< 2)
          email: 'invalid-email-address',
          password: 'short', // Too short (< 8)
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(Array.isArray(response.body.error.details)).toBe(true);
      expect(response.body.error.details.length).toBeGreaterThanOrEqual(3);

      const count = await User.countDocuments({ email: 'invalid-email-address' });
      expect(count).toBe(0);
    });

    it('GIVEN a user registers successfully, WHEN the response is inspected, THEN passwordHash is not returned', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.data.user.passwordHash).toBeUndefined();
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data).not.toHaveProperty('token'); // JWT must not be in body
    });
  });

  describe('2. Login (/api/v1/auth/login)', () => {
    beforeEach(async () => {
      // Register test user prior to login tests
      await request(app).post('/api/v1/auth/register').send(testUser);
    });

    it('GIVEN a registered user provides valid credentials, WHEN login is submitted, THEN authentication succeeds and an HTTP-only cookie is established', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.user).toMatchObject({
        email: testUser.email.toLowerCase(),
        name: testUser.name,
        role: 'USER',
      });
      expect(response.body.data.user.passwordHash).toBeUndefined();
      expect(response.body.data).not.toHaveProperty('token');

      // Verify HTTP-only cookie is set
      const cookies = getSetCookieList(response);
      expect(cookies.length).toBeGreaterThan(0);
      const authCookie = cookies.find((c) => c.startsWith(`${env.COOKIE_NAME}=`));
      expect(authCookie).toBeDefined();
      expect(authCookie).toContain('HttpOnly');
    });

    it('GIVEN an unauthenticated user provides incorrect credentials, WHEN login is submitted, THEN authentication fails with a controlled invalid credentials error', async () => {
      // Wrong password
      const wrongPasswordResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'IncorrectPassword999!',
        });

      expect(wrongPasswordResponse.status).toBe(401);
      expect(wrongPasswordResponse.body).toHaveProperty('success', false);
      expect(wrongPasswordResponse.body.error).toMatchObject({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });

      // Non-existent email (must return same error message for user enumeration prevention)
      const wrongEmailResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@archsync.io',
          password: 'Password123!',
        });

      expect(wrongEmailResponse.status).toBe(401);
      expect(wrongEmailResponse.body.error).toMatchObject({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    });
  });

  describe('3. Current User Session (/api/v1/auth/me)', () => {
    it('GIVEN an authenticated user sends their session cookie, WHEN requesting current user, THEN their safe user profile is returned', async () => {
      // 1. Register to obtain cookie
      const regResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      const cookieHeader = regResponse.headers['set-cookie'];
      expect(cookieHeader).toBeDefined();

      // 2. Query /api/v1/auth/me with session cookie
      const meResponse = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', cookieHeader);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body).toHaveProperty('success', true);
      expect(meResponse.body.data.user).toMatchObject({
        name: testUser.name,
        email: testUser.email.toLowerCase(),
        role: 'USER',
      });
      expect(meResponse.body.data.user.passwordHash).toBeUndefined();
    });

    it('GIVEN an unauthenticated user sends a request without a cookie, WHEN requesting current user, THEN the request is rejected with UnauthorizedError (401)', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatchObject({
        code: 'AUTH_REQUIRED',
      });
    });
  });

  describe('4. Logout (/api/v1/auth/logout)', () => {
    it('GIVEN an authenticated user logs out, WHEN logout is submitted, THEN the session cookie is cleared', async () => {
      // 1. Register to obtain cookie
      const regResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      const cookieHeader = regResponse.headers['set-cookie'];

      // 2. Perform logout
      const logoutResponse = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', cookieHeader);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body).toHaveProperty('success', true);

      // Verify cookie deletion in Set-Cookie header
      const cookies = getSetCookieList(logoutResponse);
      expect(cookies.length).toBeGreaterThan(0);
      const authCookie = cookies.find((c) => c.startsWith(`${env.COOKIE_NAME}=`));
      expect(authCookie).toBeDefined();
      // Express clearCookie sets max-age=0 or expires in past
      expect(
        authCookie?.includes('Expires=Thu, 01 Jan 1970') ||
        authCookie?.includes('Max-Age=0') ||
        authCookie?.startsWith(`${env.COOKIE_NAME}=;`)
      ).toBe(true);
    });

    it('GIVEN an unauthenticated user calls logout, WHEN submitted, THEN it safely succeeds without error', async () => {
      const response = await request(app).post('/api/v1/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });
});
