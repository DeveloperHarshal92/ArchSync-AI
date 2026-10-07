import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { env } from '../config/env';
import { User } from '../models/user.model';
import { ProjectModel } from '../models/project.model';
import { ProjectMemberModel } from '../models/projectMember.model';
import { ProjectInvitationModel } from '../models/projectInvitation.model';
import { ArchitectureModel } from '../models/architecture.model';
import { ArchitectureValidationService } from '../services/architectureValidation.service';
import { architectureNodeSchema, architectureEdgeSchema, architectureViewportSchema } from '../validators/architecture.validator';
import { ArchitectureNodeType } from '@archsync/shared';

describe('ArchSync AI — F06 Architecture Data Model Behavioral Test Suite', () => {
  const ownerCredentials = {
    name: 'Owner Architect',
    email: 'owner@archsync-arch-test.io',
    password: 'Password123!',
  };

  const editorCredentials = {
    name: 'Editor Architect',
    email: 'editor@archsync-arch-test.io',
    password: 'Password123!',
  };

  const viewerCredentials = {
    name: 'Viewer Auditor',
    email: 'viewer@archsync-arch-test.io',
    password: 'Password123!',
  };

  const outsiderCredentials = {
    name: 'Outsider User',
    email: 'outsider@archsync-arch-test.io',
    password: 'Password123!',
  };

  let ownerCookie: string;
  let editorCookie: string;
  let viewerCookie: string;
  let outsiderCookie: string;
  let testProjectId: string;

  const extractCookie = (res: request.Response): string => {
    const setCookie = res.headers['set-cookie'];
    if (!setCookie) return '';
    return Array.isArray(setCookie) ? setCookie[0] : setCookie;
  };

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@archsync-arch-test\.io$/i } });
    await ProjectModel.deleteMany({});
    await ProjectMemberModel.deleteMany({});
    await ProjectInvitationModel.deleteMany({});
    await ArchitectureModel.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await ArchitectureModel.deleteMany({});
    await ProjectMemberModel.deleteMany({});
    await ProjectInvitationModel.deleteMany({});
    await ProjectModel.deleteMany({});
    await User.deleteMany({ email: { $regex: /@archsync-arch-test\.io$/i } });

    // 1. Register Owner
    const regOwner = await request(app).post('/api/v1/auth/register').send(ownerCredentials);
    ownerCookie = extractCookie(regOwner);

    // 2. Register Editor
    const regEditor = await request(app).post('/api/v1/auth/register').send(editorCredentials);
    editorCookie = extractCookie(regEditor);

    // 3. Register Viewer
    const regViewer = await request(app).post('/api/v1/auth/register').send(viewerCredentials);
    viewerCookie = extractCookie(regViewer);

    // 4. Register Outsider
    const regOutsider = await request(app).post('/api/v1/auth/register').send(outsiderCredentials);
    outsiderCookie = extractCookie(regOutsider);

    // 5. Owner creates project
    const createProjectRes = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', ownerCookie)
      .send({ name: 'Architecture System Alpha' });
    testProjectId = createProjectRes.body.data.project.id;

    // 6. Owner invites Editor, Editor accepts
    const inviteEditorRes = await request(app)
      .post(`/api/v1/projects/${testProjectId}/invitations`)
      .set('Cookie', ownerCookie)
      .send({ email: editorCredentials.email, role: 'EDITOR' });
    const editorInviteId = inviteEditorRes.body.data.invitation.id;

    await request(app)
      .post(`/api/v1/invitations/${editorInviteId}/accept`)
      .set('Cookie', editorCookie);

    // 7. Owner invites Viewer, Viewer accepts
    const inviteViewerRes = await request(app)
      .post(`/api/v1/projects/${testProjectId}/invitations`)
      .set('Cookie', ownerCookie)
      .send({ email: viewerCredentials.email, role: 'VIEWER' });
    const viewerInviteId = inviteViewerRes.body.data.invitation.id;

    await request(app)
      .post(`/api/v1/invitations/${viewerInviteId}/accept`)
      .set('Cookie', viewerCookie);
  });

  describe('1. Architecture Retrieval & Default Initialization', () => {
    it('1. GIVEN project member with access and no architecture, WHEN GET architecture, THEN an empty valid architecture is returned', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', ownerCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.architecture).toMatchObject({
        projectId: testProjectId,
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        version: 1,
      });
      expect(res.body.data.validation).toBeDefined();
      expect(res.body.data.validation.valid).toBe(true);
    });

    it('2. GIVEN project, WHEN architecture is initialized, THEN version is 1', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', editorCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.architecture.version).toBe(1);
    });
  });

  describe('2. Project Authorization & Role Boundaries', () => {
    it('3. GIVEN OWNER, WHEN GET architecture, THEN access succeeds', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', ownerCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('4. GIVEN EDITOR, WHEN GET architecture, THEN access succeeds', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', editorCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('5. GIVEN VIEWER, WHEN GET architecture, THEN access succeeds', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', viewerCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('6. GIVEN unrelated user, WHEN GET architecture, THEN 403 is returned', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', outsiderCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('7. GIVEN OWNER, WHEN updating architecture, THEN update succeeds', async () => {
      const res = await request(app)
        .put(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', ownerCookie)
        .send({
          nodes: [
            {
              id: 'node-client-1',
              type: 'web-app',
              position: { x: 100, y: 150 },
              data: { label: 'Frontend Client' },
            },
          ],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          version: 1,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.architecture.version).toBe(2);
      expect(res.body.data.architecture.nodes).toHaveLength(1);
    });

    it('8. GIVEN EDITOR, WHEN updating architecture, THEN update succeeds', async () => {
      const res = await request(app)
        .put(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', editorCookie)
        .send({
          nodes: [
            {
              id: 'node-server-1',
              type: 'server',
              position: { x: 250, y: 300 },
              data: { label: 'Core Server' },
            },
          ],
          edges: [],
          viewport: { x: 10, y: 20, zoom: 1.5 },
          version: 1,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.architecture.version).toBe(2);
    });

    it('9. GIVEN VIEWER, WHEN updating architecture, THEN 403 is returned', async () => {
      const res = await request(app)
        .put(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', viewerCookie)
        .send({
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          version: 1,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Node Validation', () => {
    it('10. GIVEN valid node, WHEN validating architecture, THEN node is accepted', () => {
      const validNode = {
        id: 'gateway-1',
        type: 'api-gateway' as ArchitectureNodeType,
        position: { x: 100, y: 200 },
        width: 180,
        height: 60,
        data: {
          label: 'Kong API Gateway',
          technology: 'Kong / Nginx',
          description: 'Edge reverse proxy',
        },
      };

      const result = architectureNodeSchema.safeParse(validNode);
      expect(result.success).toBe(true);
    });

    it('11. GIVEN unsupported node type, THEN validation fails', () => {
      const invalidNode = {
        id: 'node-unknown',
        type: 'non-existent-type',
        position: { x: 0, y: 0 },
        data: { label: 'Invalid' },
      };

      const result = architectureNodeSchema.safeParse(invalidNode);
      expect(result.success).toBe(false);
    });

    it('12. GIVEN empty node label, THEN validation fails', () => {
      const emptyLabelNode = {
        id: 'node-empty',
        type: 'database',
        position: { x: 0, y: 0 },
        data: { label: '   ' },
      };

      const result = architectureNodeSchema.safeParse(emptyLabelNode);
      expect(result.success).toBe(false);
    });

    it('13. GIVEN duplicate node IDs, THEN graph validation fails', () => {
      const validation = ArchitectureValidationService.validateGraph({
        nodes: [
          { id: 'node-1', type: 'server', position: { x: 0, y: 0 }, data: { label: 'Node A' } },
          { id: 'node-1', type: 'database', position: { x: 50, y: 50 }, data: { label: 'Node B' } },
        ],
        edges: [],
      });

      expect(validation.valid).toBe(false);
      expect(validation.issues.some((i) => i.code === 'INVALID_NODE')).toBe(true);
    });

    it('14. GIVEN invalid node dimensions, THEN validation fails', () => {
      const negativeWidthNode = {
        id: 'node-dim',
        type: 'cache',
        position: { x: 0, y: 0 },
        width: -50,
        data: { label: 'Redis' },
      };

      const result = architectureNodeSchema.safeParse(negativeWidthNode);
      expect(result.success).toBe(false);
    });
  });

  describe('4. Edge Validation', () => {
    it('15. GIVEN valid edge, THEN edge is accepted', () => {
      const validEdge = {
        id: 'edge-1',
        source: 'node-a',
        target: 'node-b',
        type: 'animated' as const,
        label: 'HTTP/REST',
      };

      const result = architectureEdgeSchema.safeParse(validEdge);
      expect(result.success).toBe(true);
    });

    it('16. GIVEN missing source node, THEN INVALID_EDGE is returned', () => {
      const validation = ArchitectureValidationService.validateGraph({
        nodes: [{ id: 'node-b', type: 'server', position: { x: 0, y: 0 }, data: { label: 'B' } }],
        edges: [{ id: 'edge-1', source: 'missing-node-a', target: 'node-b' }],
      });

      expect(validation.valid).toBe(false);
      const issue = validation.issues.find((i) => i.code === 'INVALID_EDGE');
      expect(issue).toBeDefined();
      expect(issue?.message).toContain('missing source node');
    });

    it('17. GIVEN missing target node, THEN INVALID_EDGE is returned', () => {
      const validation = ArchitectureValidationService.validateGraph({
        nodes: [{ id: 'node-a', type: 'server', position: { x: 0, y: 0 }, data: { label: 'A' } }],
        edges: [{ id: 'edge-1', source: 'node-a', target: 'missing-node-b' }],
      });

      expect(validation.valid).toBe(false);
      const issue = validation.issues.find((i) => i.code === 'INVALID_EDGE');
      expect(issue).toBeDefined();
      expect(issue?.message).toContain('missing target node');
    });

    it('18. GIVEN self-loop, THEN INVALID_EDGE is returned', () => {
      const selfLoopEdge = {
        id: 'edge-self',
        source: 'node-a',
        target: 'node-a',
      };

      const parseResult = architectureEdgeSchema.safeParse(selfLoopEdge);
      expect(parseResult.success).toBe(false);

      const graphValidation = ArchitectureValidationService.validateGraph({
        nodes: [{ id: 'node-a', type: 'server', position: { x: 0, y: 0 }, data: { label: 'A' } }],
        edges: [selfLoopEdge],
      });
      expect(graphValidation.valid).toBe(false);
      expect(graphValidation.issues.some((i) => i.code === 'INVALID_EDGE')).toBe(true);
    });

    it('19. GIVEN duplicate edge IDs, THEN graph validation fails', () => {
      const validation = ArchitectureValidationService.validateGraph({
        nodes: [
          { id: 'node-a', type: 'server', position: { x: 0, y: 0 }, data: { label: 'A' } },
          { id: 'node-b', type: 'database', position: { x: 10, y: 10 }, data: { label: 'B' } },
        ],
        edges: [
          { id: 'edge-dup', source: 'node-a', target: 'node-b' },
          { id: 'edge-dup', source: 'node-b', target: 'node-a' },
        ],
      });

      expect(validation.valid).toBe(false);
      expect(validation.issues.some((i) => i.code === 'INVALID_EDGE' && i.message.includes('Duplicate edge ID'))).toBe(true);
    });

    it('20. GIVEN unsupported edge type, THEN validation fails', () => {
      const invalidTypeEdge = {
        id: 'edge-invalid-type',
        source: 'node-a',
        target: 'node-b',
        type: 'unsupported-style',
      };

      const result = architectureEdgeSchema.safeParse(invalidTypeEdge);
      expect(result.success).toBe(false);
    });
  });

  describe('5. Graph Analysis & Integrity Engine', () => {
    it('21. GIVEN isolated node, THEN DISCONNECTED_NODE warning is generated', () => {
      const validation = ArchitectureValidationService.validateGraph({
        nodes: [
          { id: 'node-connected-1', type: 'server', position: { x: 0, y: 0 }, data: { label: 'Server' } },
          { id: 'node-connected-2', type: 'database', position: { x: 10, y: 10 }, data: { label: 'DB' } },
          { id: 'node-isolated', type: 'cache', position: { x: 20, y: 20 }, data: { label: 'Standalone Cache' } },
        ],
        edges: [
          { id: 'edge-1', source: 'node-connected-1', target: 'node-connected-2' },
        ],
      });

      // Disconnected node is a WARNING, not an ERROR
      expect(validation.valid).toBe(true);
      const disconnectedIssue = validation.issues.find((i) => i.code === 'DISCONNECTED_NODE');
      expect(disconnectedIssue).toBeDefined();
      expect(disconnectedIssue?.severity).toBe('WARNING');
      expect(disconnectedIssue?.nodeIds).toContain('node-isolated');
    });

    it('22. GIVEN directed cycle, THEN CIRCULAR_DEPENDENCY warning is generated', () => {
      const validation = ArchitectureValidationService.validateGraph({
        nodes: [
          { id: 'srv-a', type: 'microservice', position: { x: 0, y: 0 }, data: { label: 'Service A' } },
          { id: 'srv-b', type: 'microservice', position: { x: 10, y: 10 }, data: { label: 'Service B' } },
          { id: 'srv-c', type: 'microservice', position: { x: 20, y: 20 }, data: { label: 'Service C' } },
        ],
        edges: [
          { id: 'e1', source: 'srv-a', target: 'srv-b' },
          { id: 'e2', source: 'srv-b', target: 'srv-c' },
          { id: 'e3', source: 'srv-c', target: 'srv-a' }, // Directed cycle A -> B -> C -> A
        ],
      });

      expect(validation.valid).toBe(true); // Warnings do not invalidate graph
      const cycleIssue = validation.issues.find((i) => i.code === 'CIRCULAR_DEPENDENCY');
      expect(cycleIssue).toBeDefined();
      expect(cycleIssue?.severity).toBe('WARNING');
      expect(cycleIssue?.nodeIds).toEqual(expect.arrayContaining(['srv-a', 'srv-b', 'srv-c']));
    });

    it('23. GIVEN acyclic graph, THEN no circular dependency issue is generated', () => {
      const validation = ArchitectureValidationService.validateGraph({
        nodes: [
          { id: 'srv-1', type: 'web-app', position: { x: 0, y: 0 }, data: { label: 'Web' } },
          { id: 'srv-2', type: 'api-gateway', position: { x: 10, y: 10 }, data: { label: 'Gateway' } },
          { id: 'srv-3', type: 'database', position: { x: 20, y: 20 }, data: { label: 'DB' } },
        ],
        edges: [
          { id: 'e1', source: 'srv-1', target: 'srv-2' },
          { id: 'e2', source: 'srv-2', target: 'srv-3' },
        ],
      });

      expect(validation.issues.some((i) => i.code === 'CIRCULAR_DEPENDENCY')).toBe(false);
    });
  });

  describe('6. Viewport Validation', () => {
    it('24. GIVEN valid viewport, THEN it is accepted', () => {
      const validViewport = { x: 150, y: -80, zoom: 1.25 };
      const result = architectureViewportSchema.safeParse(validViewport);
      expect(result.success).toBe(true);
    });

    it('25. GIVEN zoom below 0.1 or above 4, THEN validation fails', () => {
      const tooSmall = { x: 0, y: 0, zoom: 0.05 };
      const tooLarge = { x: 0, y: 0, zoom: 5.5 };

      expect(architectureViewportSchema.safeParse(tooSmall).success).toBe(false);
      expect(architectureViewportSchema.safeParse(tooLarge).success).toBe(false);
    });
  });

  describe('7. Versioning & Optimistic Concurrency Control', () => {
    it('26. GIVEN current version 1, WHEN update uses version 1, THEN update succeeds and version becomes 2', async () => {
      const res = await request(app)
        .put(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', ownerCookie)
        .send({
          nodes: [{ id: 'n1', type: 'server', position: { x: 0, y: 0 }, data: { label: 'S1' } }],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          version: 1,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.architecture.version).toBe(2);
    });

    it('27. GIVEN current version 2, WHEN update uses stale version 1, THEN 409 VERSION_CONFLICT is returned', async () => {
      // 1. Advance to version 2
      await request(app)
        .put(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', ownerCookie)
        .send({
          nodes: [{ id: 'n1', type: 'server', position: { x: 0, y: 0 }, data: { label: 'S1' } }],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          version: 1,
        });

      // 2. Submit stale update with version 1
      const staleRes = await request(app)
        .put(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', editorCookie)
        .send({
          nodes: [{ id: 'n2', type: 'database', position: { x: 10, y: 10 }, data: { label: 'DB' } }],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          version: 1,
        });

      expect(staleRes.status).toBe(409);
      expect(staleRes.body.success).toBe(false);
      expect(staleRes.body.error.code).toBe('VERSION_CONFLICT');
    });

    it('28. GIVEN repeated stale update, THEN newer architecture is not overwritten', async () => {
      // Advance to version 2 with specific node
      await request(app)
        .put(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', ownerCookie)
        .send({
          nodes: [{ id: 'persisted-node', type: 'queue', position: { x: 0, y: 0 }, data: { label: 'Kafka' } }],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          version: 1,
        });

      // Stale attempt
      await request(app)
        .put(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', editorCookie)
        .send({
          nodes: [{ id: 'stale-node', type: 'server', position: { x: 0, y: 0 }, data: { label: 'Stale' } }],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          version: 1,
        });

      // Fetch architecture and verify it was not overwritten
      const getRes = await request(app)
        .get(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', ownerCookie);

      expect(getRes.body.data.architecture.version).toBe(2);
      expect(getRes.body.data.architecture.nodes[0].id).toBe('persisted-node');
    });
  });

  describe('8. Safe Serialization & Contract Integrity', () => {
    it('29. GIVEN architecture document, WHEN returned through API, THEN raw Mongo/Mongoose internals are not exposed', async () => {
      await request(app)
        .put(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', ownerCookie)
        .send({
          nodes: [{ id: 'n-1', type: 'client', position: { x: 0, y: 0 }, data: { label: 'Client' } }],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          version: 1,
        });

      const res = await request(app)
        .get(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', ownerCookie);

      const arch = res.body.data.architecture;
      expect(arch._id).toBeUndefined();
      expect(arch.__v).toBeUndefined();
      expect(arch.nodes[0]._id).toBeUndefined();
    });

    it('30. GIVEN architecture, WHEN serialized, THEN public contract matches shared Architecture type', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', ownerCookie);

      const arch = res.body.data.architecture;
      expect(arch).toHaveProperty('projectId');
      expect(arch).toHaveProperty('nodes');
      expect(arch).toHaveProperty('edges');
      expect(arch).toHaveProperty('viewport');
      expect(arch).toHaveProperty('version');
      expect(arch).toHaveProperty('createdAt');
      expect(arch).toHaveProperty('updatedAt');
      expect(typeof arch.version).toBe('number');
      expect(typeof arch.projectId).toBe('string');
    });
  });
});
