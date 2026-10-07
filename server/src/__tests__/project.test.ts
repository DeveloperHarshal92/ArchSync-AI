import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { User } from '../models/user.model';
import { ProjectModel } from '../models/project.model';
import { env } from '../config/env';

describe('ArchSync AI — F04 Project Management Behavioral Test Suite', () => {
  const userA = {
    name: 'Alice Architect',
    email: 'alice.architect@archsync-project-test.io',
    password: 'Password123!',
  };

  const userB = {
    name: 'Bob Builder',
    email: 'bob.builder@archsync-project-test.io',
    password: 'Password123!',
  };

  let cookieUserA: string;
  let cookieUserB: string;

  function getSetCookie(res: request.Response): string {
    const header = res.headers['set-cookie'];
    if (!header) return '';
    return Array.isArray(header) ? header[0] : String(header);
  }

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    await ProjectModel.deleteMany({});
    await User.deleteMany({ email: { $regex: /@archsync-project-test\.io$/i } });
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await ProjectModel.deleteMany({});
    await User.deleteMany({ email: { $regex: /@archsync-project-test\.io$/i } });

    // Register User A
    const resA = await request(app).post('/api/v1/auth/register').send(userA);
    cookieUserA = getSetCookie(resA);

    // Register User B
    const resB = await request(app).post('/api/v1/auth/register').send(userB);
    cookieUserB = getSetCookie(resB);
  });

  describe('1. Project Creation (POST /api/v1/projects)', () => {
    it('GIVEN an authenticated user provides valid project data, WHEN they submit creation, THEN a project is created with that user as owner', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .set('Cookie', cookieUserA)
        .send({
          name: 'Core Payment Service',
          description: 'Architecture diagram for distributed payment orchestrator',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('project');
      expect(response.body.data.project).toMatchObject({
        name: 'Core Payment Service',
        description: 'Architecture diagram for distributed payment orchestrator',
      });
      expect(response.body.data.project).toHaveProperty('id');
      expect(response.body.data.project).toHaveProperty('ownerId');
      expect(response.body.data.project).toHaveProperty('createdAt');

      // Verify stored in MongoDB
      const persisted = await ProjectModel.findById(response.body.data.project.id);
      expect(persisted).not.toBeNull();
      expect(persisted?.name).toBe('Core Payment Service');
    });

    it('GIVEN an unauthenticated user, WHEN they attempt to create a project, THEN the request is rejected with 401 Unauthorized', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .send({
          name: 'Unauthorized Project',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatchObject({
        code: 'AUTH_REQUIRED',
      });
    });

    it('GIVEN a creation request attempts to inject custom ownerId, WHEN submitted, THEN validation rejects the unexpected property', async () => {
      const fakeOwnerId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Cookie', cookieUserA)
        .send({
          name: 'Hacked Project',
          ownerId: fakeOwnerId,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
    });

    it('GIVEN invalid project data, WHEN submitted, THEN validation fails without creating a project', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .set('Cookie', cookieUserA)
        .send({
          name: '   ', // Whitespace-only name
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
      });

      const count = await ProjectModel.countDocuments();
      expect(count).toBe(0);
    });
  });

  describe('2. Project Listing (GET /api/v1/projects)', () => {
    it('GIVEN an authenticated user has created projects, WHEN requesting project list, THEN only projects owned by that user are returned', async () => {
      // User A creates 2 projects
      await request(app)
        .post('/api/v1/projects')
        .set('Cookie', cookieUserA)
        .send({ name: 'Project A1' });

      await request(app)
        .post('/api/v1/projects')
        .set('Cookie', cookieUserA)
        .send({ name: 'Project A2' });

      // User B creates 1 project
      await request(app)
        .post('/api/v1/projects')
        .set('Cookie', cookieUserB)
        .send({ name: 'Project B1' });

      // User A requests their list
      const responseA = await request(app)
        .get('/api/v1/projects')
        .set('Cookie', cookieUserA);

      expect(responseA.status).toBe(200);
      expect(responseA.body).toHaveProperty('success', true);
      expect(Array.isArray(responseA.body.data.projects)).toBe(true);
      expect(responseA.body.data.projects.length).toBe(2);
      expect(responseA.body.data.projects.map((p: { name: string }) => p.name)).toEqual(
        expect.arrayContaining(['Project A1', 'Project A2'])
      );
      expect(responseA.body.data.projects.some((p: { name: string }) => p.name === 'Project B1')).toBe(false);

      // User B requests their list
      const responseB = await request(app)
        .get('/api/v1/projects')
        .set('Cookie', cookieUserB);

      expect(responseB.status).toBe(200);
      expect(responseB.body.data.projects.length).toBe(1);
      expect(responseB.body.data.projects[0].name).toBe('Project B1');
    });

    it('GIVEN an unauthenticated user, WHEN requesting project list, THEN 401 is returned', async () => {
      const response = await request(app).get('/api/v1/projects');
      expect(response.status).toBe(401);
    });
  });

  describe('3. Single Project Retrieval (GET /api/v1/projects/:projectId)', () => {
    let userAProjectId: string;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/v1/projects')
        .set('Cookie', cookieUserA)
        .send({ name: 'Auth Microservice', description: 'User A private project' });

      userAProjectId = createRes.body.data.project.id;
    });

    it('GIVEN the project owner, WHEN requesting project by ID, THEN the project details are returned', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${userAProjectId}`)
        .set('Cookie', cookieUserA);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.project).toMatchObject({
        id: userAProjectId,
        name: 'Auth Microservice',
        description: 'User A private project',
      });
    });

    it('GIVEN a non-owner user, WHEN requesting another user project by ID, THEN 403 Forbidden is returned', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${userAProjectId}`)
        .set('Cookie', cookieUserB);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('GIVEN a valid ObjectId format that does not exist, WHEN requested, THEN 404 Not Found is returned', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get(`/api/v1/projects/${nonExistentId}`)
        .set('Cookie', cookieUserA);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatchObject({
        code: 'PROJECT_NOT_FOUND',
      });
    });

    it('GIVEN an invalid project ID format, WHEN requested, THEN 400 Validation Error is returned', async () => {
      const response = await request(app)
        .get('/api/v1/projects/not-a-valid-mongo-id')
        .set('Cookie', cookieUserA);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
    });
  });

  describe('4. Project Update (PATCH /api/v1/projects/:projectId)', () => {
    let userAProjectId: string;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/v1/projects')
        .set('Cookie', cookieUserA)
        .send({ name: 'Initial Architecture', description: 'Initial spec' });

      userAProjectId = createRes.body.data.project.id;
    });

    it('GIVEN the project owner provides valid update data, WHEN they update the project, THEN the changes are saved', async () => {
      const response = await request(app)
        .patch(`/api/v1/projects/${userAProjectId}`)
        .set('Cookie', cookieUserA)
        .send({
          name: 'Renamed Architecture',
          description: 'Updated architecture description',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.project).toMatchObject({
        id: userAProjectId,
        name: 'Renamed Architecture',
        description: 'Updated architecture description',
      });

      // Verify in DB
      const updated = await ProjectModel.findById(userAProjectId);
      expect(updated?.name).toBe('Renamed Architecture');
      expect(updated?.description).toBe('Updated architecture description');
    });

    it('GIVEN a non-owner, WHEN attempting to update the project, THEN 403 Forbidden is returned', async () => {
      const response = await request(app)
        .patch(`/api/v1/projects/${userAProjectId}`)
        .set('Cookie', cookieUserB)
        .send({ name: 'Malicious Rename' });

      expect(response.status).toBe(403);
      expect(response.body.error).toMatchObject({
        code: 'FORBIDDEN',
      });

      const unchanged = await ProjectModel.findById(userAProjectId);
      expect(unchanged?.name).toBe('Initial Architecture');
    });

    it('GIVEN an update payload attempting to modify ownerId, WHEN submitted, THEN validation rejects the request', async () => {
      const fakeOwner = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .patch(`/api/v1/projects/${userAProjectId}`)
        .set('Cookie', cookieUserA)
        .send({
          name: 'Valid Name',
          ownerId: fakeOwner,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
    });

    it('GIVEN an empty update payload without editable fields, WHEN submitted, THEN validation rejects it', async () => {
      const response = await request(app)
        .patch(`/api/v1/projects/${userAProjectId}`)
        .set('Cookie', cookieUserA)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
    });
  });

  describe('5. Project Deletion (DELETE /api/v1/projects/:projectId)', () => {
    let userAProjectId: string;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/v1/projects')
        .set('Cookie', cookieUserA)
        .send({ name: 'To Be Deleted' });

      userAProjectId = createRes.body.data.project.id;
    });

    it('GIVEN the project owner, WHEN they delete the project, THEN it is removed and cannot be retrieved', async () => {
      const response = await request(app)
        .delete(`/api/v1/projects/${userAProjectId}`)
        .set('Cookie', cookieUserA);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      // Verify retrieval returns 404
      const getRes = await request(app)
        .get(`/api/v1/projects/${userAProjectId}`)
        .set('Cookie', cookieUserA);

      expect(getRes.status).toBe(404);
    });

    it('GIVEN a non-owner, WHEN attempting to delete the project, THEN 403 Forbidden is returned and project remains intact', async () => {
      const response = await request(app)
        .delete(`/api/v1/projects/${userAProjectId}`)
        .set('Cookie', cookieUserB);

      expect(response.status).toBe(403);
      expect(response.body.error).toMatchObject({
        code: 'FORBIDDEN',
      });

      const stillExists = await ProjectModel.findById(userAProjectId);
      expect(stillExists).not.toBeNull();
    });
  });
});
