import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { User } from '../models/user.model';
import { ProjectModel } from '../models/project.model';
import { ProjectMemberModel } from '../models/projectMember.model';
import { ProjectInvitationModel } from '../models/projectInvitation.model';
import { env } from '../config/env';

describe('ArchSync AI — F05 Project Membership & Invitations Behavioral Test Suite', () => {
  const ownerUser = {
    name: 'Owen Owner',
    email: 'owner@archsync-member-test.io',
    password: 'Password123!',
  };

  const editorUser = {
    name: 'Eddie Editor',
    email: 'editor@archsync-member-test.io',
    password: 'Password123!',
  };

  const viewerUser = {
    name: 'Vicki Viewer',
    email: 'viewer@archsync-member-test.io',
    password: 'Password123!',
  };

  const outsiderUser = {
    name: 'Otto Outsider',
    email: 'outsider@archsync-member-test.io',
    password: 'Password123!',
  };

  let ownerCookie: string;
  let editorCookie: string;
  let viewerCookie: string;
  let outsiderCookie: string;

  let ownerId: string;
  let editorId: string;
  let viewerId: string;

  let projectId: string;

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
    await ProjectInvitationModel.deleteMany({});
    await ProjectMemberModel.deleteMany({});
    await ProjectModel.deleteMany({});
    await User.deleteMany({ email: { $regex: /@archsync-member-test\.io$/i } });
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await ProjectInvitationModel.deleteMany({});
    await ProjectMemberModel.deleteMany({});
    await ProjectModel.deleteMany({});
    await User.deleteMany({ email: { $regex: /@archsync-member-test\.io$/i } });

    // Register all 4 users
    const resOwner = await request(app).post('/api/v1/auth/register').send(ownerUser);
    ownerCookie = getSetCookie(resOwner);
    ownerId = resOwner.body.data.user.id;

    const resEditor = await request(app).post('/api/v1/auth/register').send(editorUser);
    editorCookie = getSetCookie(resEditor);
    editorId = resEditor.body.data.user.id;

    const resViewer = await request(app).post('/api/v1/auth/register').send(viewerUser);
    viewerCookie = getSetCookie(resViewer);
    viewerId = resViewer.body.data.user.id;

    const resOutsider = await request(app).post('/api/v1/auth/register').send(outsiderUser);
    outsiderCookie = getSetCookie(resOutsider);

    // Create a base project by Owner
    const createRes = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', ownerCookie)
      .send({ name: 'Architecture System Alpha', description: 'Base collaborative project' });

    projectId = createRes.body.data.project.id;
  });

  describe('1. Membership Creation & Automatic Owner Binding', () => {
    it('GIVEN a newly created project, WHEN project creation completes, THEN an OWNER ProjectMember exists', async () => {
      const member = await ProjectMemberModel.findOne({
        projectId: new mongoose.Types.ObjectId(projectId),
        userId: new mongoose.Types.ObjectId(ownerId),
      });

      expect(member).not.toBeNull();
      expect(member?.role).toBe('OWNER');
    });
  });

  describe('2. Member Listing (GET /api/v1/projects/:projectId/members)', () => {
    it('GIVEN owner, WHEN GET members, THEN owner membership with safe user profile is returned', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${projectId}/members`)
        .set('Cookie', ownerCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data.members)).toBe(true);
      expect(res.body.data.members.length).toBe(1);
      expect(res.body.data.members[0]).toMatchObject({
        role: 'OWNER',
        userId: ownerId,
        user: {
          name: ownerUser.name,
          email: ownerUser.email.toLowerCase(),
        },
      });
      expect(res.body.data.members[0].user).not.toHaveProperty('passwordHash');
    });

    it('GIVEN unrelated user, WHEN GET members, THEN access is denied with 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${projectId}/members`)
        .set('Cookie', outsiderCookie);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('3. Invitation Creation (POST /api/v1/projects/:projectId/invitations)', () => {
    it('GIVEN owner and valid email, WHEN POST invitation, THEN invitation is created as PENDING', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/invitations`)
        .set('Cookie', ownerCookie)
        .send({
          email: editorUser.email,
          role: 'EDITOR',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data.invitation).toMatchObject({
        projectId,
        invitedEmail: editorUser.email.toLowerCase(),
        role: 'EDITOR',
        status: 'PENDING',
      });
      expect(res.body.data.invitation).toHaveProperty('expiresAt');
    });

    it('GIVEN editor attempts to create invitation, WHEN requested, THEN request is rejected with 403 Forbidden', async () => {
      // Add editor directly as member
      await ProjectMemberModel.create({
        projectId: new mongoose.Types.ObjectId(projectId),
        userId: new mongoose.Types.ObjectId(editorId),
        role: 'EDITOR',
      });

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/invitations`)
        .set('Cookie', editorCookie)
        .send({
          email: 'newuser@archsync-member-test.io',
          role: 'VIEWER',
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('GIVEN invitation role OWNER, WHEN creating invitation, THEN request is rejected with 400 Validation Error', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/invitations`)
        .set('Cookie', ownerCookie)
        .send({
          email: 'someone@archsync-member-test.io',
          role: 'OWNER',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
    });

    it('GIVEN existing member, WHEN inviting same user, THEN request is rejected with 409 Conflict', async () => {
      // Owner is already a member
      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/invitations`)
        .set('Cookie', ownerCookie)
        .send({
          email: ownerUser.email,
          role: 'EDITOR',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatchObject({
        code: 'ALREADY_MEMBER',
      });
    });

    it('GIVEN duplicate pending invitation, WHEN creating invitation again, THEN request is rejected with 409 Conflict', async () => {
      // Send first invitation
      await request(app)
        .post(`/api/v1/projects/${projectId}/invitations`)
        .set('Cookie', ownerCookie)
        .send({
          email: viewerUser.email,
          role: 'VIEWER',
        });

      // Send second invitation to same email
      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/invitations`)
        .set('Cookie', ownerCookie)
        .send({
          email: viewerUser.email,
          role: 'VIEWER',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatchObject({
        code: 'INVITATION_ALREADY_EXISTS',
      });
    });
  });

  describe('4. Invitation Acceptance & Rejection', () => {
    let invitationId: string;

    beforeEach(async () => {
      const inviteRes = await request(app)
        .post(`/api/v1/projects/${projectId}/invitations`)
        .set('Cookie', ownerCookie)
        .send({
          email: editorUser.email,
          role: 'EDITOR',
        });

      invitationId = inviteRes.body.data.invitation.id;
    });

    it('GIVEN matching authenticated user, WHEN accepting valid invitation, THEN ProjectMember is created and status becomes ACCEPTED', async () => {
      const res = await request(app)
        .post(`/api/v1/invitations/${invitationId}/accept`)
        .set('Cookie', editorCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data.member).toMatchObject({
        projectId,
        userId: editorId,
        role: 'EDITOR',
      });

      // Verify invitation status changed
      const updatedInv = await ProjectInvitationModel.findById(invitationId);
      expect(updatedInv?.status).toBe('ACCEPTED');

      // Verify member exists in DB
      const member = await ProjectMemberModel.findOne({
        projectId: new mongoose.Types.ObjectId(projectId),
        userId: new mongoose.Types.ObjectId(editorId),
      });
      expect(member).not.toBeNull();
      expect(member?.role).toBe('EDITOR');
    });

    it('GIVEN wrong authenticated email, WHEN accepting invitation, THEN request is rejected with 403 Forbidden', async () => {
      // Outsider attempts to accept invitation addressed to Editor
      const res = await request(app)
        .post(`/api/v1/invitations/${invitationId}/accept`)
        .set('Cookie', outsiderCookie);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('GIVEN expired invitation, WHEN accepting, THEN status becomes EXPIRED and acceptance fails with 400', async () => {
      // Manually set expiration to yesterday
      await ProjectInvitationModel.findByIdAndUpdate(invitationId, {
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      });

      const res = await request(app)
        .post(`/api/v1/invitations/${invitationId}/accept`)
        .set('Cookie', editorCookie);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatchObject({
        code: 'INVITATION_EXPIRED',
      });

      const updatedInv = await ProjectInvitationModel.findById(invitationId);
      expect(updatedInv?.status).toBe('EXPIRED');
    });

    it('GIVEN already accepted invitation, WHEN accepting again, THEN request is rejected safely', async () => {
      // First accept
      await request(app)
        .post(`/api/v1/invitations/${invitationId}/accept`)
        .set('Cookie', editorCookie);

      // Second accept
      const res = await request(app)
        .post(`/api/v1/invitations/${invitationId}/accept`)
        .set('Cookie', editorCookie);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatchObject({
        code: 'INVITATION_NOT_PENDING',
      });

      // Verify only 1 membership created
      const count = await ProjectMemberModel.countDocuments({
        projectId: new mongoose.Types.ObjectId(projectId),
        userId: new mongoose.Types.ObjectId(editorId),
      });
      expect(count).toBe(1);
    });

    it('GIVEN matching user, WHEN rejecting pending invitation, THEN status becomes REJECTED', async () => {
      const res = await request(app)
        .post(`/api/v1/invitations/${invitationId}/reject`)
        .set('Cookie', editorCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.invitation.status).toBe('REJECTED');

      const updatedInv = await ProjectInvitationModel.findById(invitationId);
      expect(updatedInv?.status).toBe('REJECTED');
    });

    it('GIVEN wrong user, WHEN rejecting invitation, THEN request is rejected with 403 Forbidden', async () => {
      const res = await request(app)
        .post(`/api/v1/invitations/${invitationId}/reject`)
        .set('Cookie', outsiderCookie);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('5. Member Role Management & Removal', () => {
    beforeEach(async () => {
      // Add editor and viewer memberships directly
      await ProjectMemberModel.create({
        projectId: new mongoose.Types.ObjectId(projectId),
        userId: new mongoose.Types.ObjectId(editorId),
        role: 'EDITOR',
      });

      await ProjectMemberModel.create({
        projectId: new mongoose.Types.ObjectId(projectId),
        userId: new mongoose.Types.ObjectId(viewerId),
        role: 'VIEWER',
      });
    });

    it('GIVEN owner, WHEN changing editor to viewer, THEN role changes', async () => {
      const res = await request(app)
        .patch(`/api/v1/projects/${projectId}/members/${editorId}`)
        .set('Cookie', ownerCookie)
        .send({ role: 'VIEWER' });

      expect(res.status).toBe(200);
      expect(res.body.data.member.role).toBe('VIEWER');

      const updated = await ProjectMemberModel.findOne({
        projectId: new mongoose.Types.ObjectId(projectId),
        userId: new mongoose.Types.ObjectId(editorId),
      });
      expect(updated?.role).toBe('VIEWER');
    });

    it('GIVEN editor attempts to change role, WHEN requested, THEN 403 Forbidden is returned', async () => {
      const res = await request(app)
        .patch(`/api/v1/projects/${projectId}/members/${viewerId}`)
        .set('Cookie', editorCookie)
        .send({ role: 'EDITOR' });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('GIVEN owner attempting to demote themselves, THEN request is rejected with 400', async () => {
      const res = await request(app)
        .patch(`/api/v1/projects/${projectId}/members/${ownerId}`)
        .set('Cookie', ownerCookie)
        .send({ role: 'VIEWER' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatchObject({
        code: 'CANNOT_MODIFY_OWNER_ROLE',
      });
    });

    it('GIVEN owner, WHEN removing editor, THEN membership is deleted', async () => {
      const res = await request(app)
        .delete(`/api/v1/projects/${projectId}/members/${editorId}`)
        .set('Cookie', ownerCookie);

      expect(res.status).toBe(200);

      const member = await ProjectMemberModel.findOne({
        projectId: new mongoose.Types.ObjectId(projectId),
        userId: new mongoose.Types.ObjectId(editorId),
      });
      expect(member).toBeNull();
    });

    it('GIVEN editor attempting to remove member, THEN 403 Forbidden is returned', async () => {
      const res = await request(app)
        .delete(`/api/v1/projects/${projectId}/members/${viewerId}`)
        .set('Cookie', editorCookie);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('GIVEN owner attempting to remove themselves, THEN request is rejected with 400', async () => {
      const res = await request(app)
        .delete(`/api/v1/projects/${projectId}/members/${ownerId}`)
        .set('Cookie', ownerCookie);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatchObject({
        code: 'CANNOT_REMOVE_OWNER',
      });
    });
  });

  describe('6. Project Access Regression & Permission Matrix', () => {
    beforeEach(async () => {
      // Add editor and viewer
      await ProjectMemberModel.create({
        projectId: new mongoose.Types.ObjectId(projectId),
        userId: new mongoose.Types.ObjectId(editorId),
        role: 'EDITOR',
      });

      await ProjectMemberModel.create({
        projectId: new mongoose.Types.ObjectId(projectId),
        userId: new mongoose.Types.ObjectId(viewerId),
        role: 'VIEWER',
      });
    });

    it('GIVEN editor, WHEN retrieving project, THEN access succeeds and returns access role', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .set('Cookie', editorCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.project.access.role).toBe('EDITOR');
    });

    it('GIVEN viewer, WHEN retrieving project, THEN access succeeds and returns access role', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .set('Cookie', viewerCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.project.access.role).toBe('VIEWER');
    });

    it('GIVEN editor, WHEN updating project metadata, THEN update succeeds', async () => {
      const res = await request(app)
        .patch(`/api/v1/projects/${projectId}`)
        .set('Cookie', editorCookie)
        .send({ name: 'Updated by Editor' });

      expect(res.status).toBe(200);
      expect(res.body.data.project.name).toBe('Updated by Editor');
    });

    it('GIVEN viewer, WHEN updating project metadata, THEN request is rejected with 403 Forbidden', async () => {
      const res = await request(app)
        .patch(`/api/v1/projects/${projectId}`)
        .set('Cookie', viewerCookie)
        .send({ name: 'Malicious Viewer Update' });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('GIVEN editor attempts to delete project, THEN request is rejected with 403 Forbidden', async () => {
      const res = await request(app)
        .delete(`/api/v1/projects/${projectId}`)
        .set('Cookie', editorCookie);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatchObject({
        code: 'FORBIDDEN',
      });

      const stillExists = await ProjectModel.findById(projectId);
      expect(stillExists).not.toBeNull();
    });

    it('GIVEN unrelated user, WHEN accessing project, THEN 403 Forbidden is returned', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .set('Cookie', outsiderCookie);

      expect(res.status).toBe(403);
    });

    it('GIVEN user who is editor on project, WHEN listing projects, THEN project appears in their list', async () => {
      const res = await request(app)
        .get('/api/v1/projects')
        .set('Cookie', editorCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.projects.some((p: { id: string }) => p.id === projectId)).toBe(true);
      const proj = res.body.data.projects.find((p: { id: string }) => p.id === projectId);
      expect(proj.access.role).toBe('EDITOR');
    });
  });

  describe('7. User Invitations Privacy (GET /api/v1/invitations)', () => {
    beforeEach(async () => {
      // Invite editor and viewer
      await request(app)
        .post(`/api/v1/projects/${projectId}/invitations`)
        .set('Cookie', ownerCookie)
        .send({ email: editorUser.email, role: 'EDITOR' });

      await request(app)
        .post(`/api/v1/projects/${projectId}/invitations`)
        .set('Cookie', ownerCookie)
        .send({ email: viewerUser.email, role: 'VIEWER' });
    });

    it('GIVEN editor user, WHEN GET /invitations, THEN only invitations intended for editor are returned', async () => {
      const res = await request(app)
        .get('/api/v1/invitations')
        .set('Cookie', editorCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.invitations.length).toBe(1);
      expect(res.body.data.invitations[0].invitedEmail).toBe(editorUser.email.toLowerCase());
      expect(res.body.data.invitations[0].projectName).toBe('Architecture System Alpha');
      expect(res.body.data.invitations[0].inviterName).toBe(ownerUser.name);
    });

    it('GIVEN outsider user with no invitations, WHEN GET /invitations, THEN empty array is returned', async () => {
      const res = await request(app)
        .get('/api/v1/invitations')
        .set('Cookie', outsiderCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.invitations).toEqual([]);
    });
  });
});
