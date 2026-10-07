import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { env } from '../config/env';
import { User } from '../models/user.model';
import { ProjectModel } from '../models/project.model';
import { ProjectMemberModel } from '../models/projectMember.model';
import { ArchitectureModel } from '../models/architecture.model';
import { validateArchitecture } from '../validation';
import { ArchitectureValidationService } from '../services/architectureValidation.service';

describe('ArchSync AI — F11 Architecture Validation & Rules Engine Suite', () => {
  const ownerCredentials = {
    name: 'Validation Owner',
    email: 'owner@val-test.io',
    password: 'Password123!',
  };

  const editorCredentials = {
    name: 'Validation Editor',
    email: 'editor@val-test.io',
    password: 'Password123!',
  };

  const viewerCredentials = {
    name: 'Validation Viewer',
    email: 'viewer@val-test.io',
    password: 'Password123!',
  };

  const outsiderCredentials = {
    name: 'Validation Outsider',
    email: 'outsider@val-test.io',
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

    // Register test users
    const registerUser = async (creds: typeof ownerCredentials) => {
      const res = await request(app).post('/api/v1/auth/register').send(creds);
      return extractCookie(res);
    };

    ownerCookie = await registerUser(ownerCredentials);
    editorCookie = await registerUser(editorCredentials);
    viewerCookie = await registerUser(viewerCredentials);
    outsiderCookie = await registerUser(outsiderCredentials);

    // Get user IDs
    const editorUser = await User.findOne({ email: editorCredentials.email });
    const viewerUser = await User.findOne({ email: viewerCredentials.email });

    // Create a shared project under owner
    const projRes = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', ownerCookie)
      .send({
        name: 'Validation Test Project',
        description: 'Testing F11 Validation Rules Engine',
      });
    testProjectId = projRes.body.data.project.id;

    // Add editor and viewer memberships
    await ProjectMemberModel.create({
      projectId: new mongoose.Types.ObjectId(testProjectId),
      userId: editorUser!._id,
      role: 'EDITOR',
    });

    await ProjectMemberModel.create({
      projectId: new mongoose.Types.ObjectId(testProjectId),
      userId: viewerUser!._id,
      role: 'VIEWER',
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@val-test\.io$/i } });
    if (testProjectId) {
      await ProjectModel.deleteMany({ _id: new mongoose.Types.ObjectId(testProjectId) });
      await ProjectMemberModel.deleteMany({ projectId: new mongoose.Types.ObjectId(testProjectId) });
      await ArchitectureModel.deleteMany({ projectId: new mongoose.Types.ObjectId(testProjectId) });
    }
  });

  // =========================================================================
  // 1. Pure Rules Engine Unit Tests
  // =========================================================================

  describe('1. Pure Rules Engine Determinism & Core Rules', () => {
    it('1. GIVEN an empty architecture, WHEN validation runs, THEN valid = true and issues = []', () => {
      const result = validateArchitecture({ nodes: [], edges: [] });
      expect(result.valid).toBe(true);
      expect(result.issues).toEqual([]);
      expect(result.validatedAt).toBeDefined();
    });

    it('2. GIVEN a valid connected graph, WHEN validation runs, THEN valid = true and issues = []', () => {
      const result = validateArchitecture({
        nodes: [
          { id: 'client-1', type: 'web-app', position: { x: 0, y: 0 }, data: { label: 'Web UI' } },
          { id: 'api-1', type: 'api-gateway', position: { x: 100, y: 0 }, data: { label: 'API Gateway' } },
          { id: 'db-1', type: 'database', position: { x: 200, y: 0 }, data: { label: 'Postgres' } },
        ],
        edges: [
          { id: 'edge-1', source: 'client-1', target: 'api-1' },
          { id: 'edge-2', source: 'api-1', target: 'db-1' },
        ],
      });

      expect(result.valid).toBe(true);
      expect(result.issues).toEqual([]);
    });

    it('3. GIVEN missing source or target node, THEN INVALID_EDGE ERROR is returned', () => {
      const result = validateArchitecture({
        nodes: [{ id: 'srv-1', type: 'server', position: { x: 0, y: 0 }, data: { label: 'Server' } }],
        edges: [
          { id: 'edge-missing-src', source: 'non-existent-src', target: 'srv-1' },
          { id: 'edge-missing-tgt', source: 'srv-1', target: 'non-existent-tgt' },
        ],
      });

      expect(result.valid).toBe(false);
      const errors = result.issues.filter((i) => i.code === 'INVALID_EDGE');
      expect(errors.length).toBe(2);
      expect(errors[0].severity).toBe('ERROR');
      expect(errors[1].severity).toBe('ERROR');
    });

    it('4. GIVEN self-loop edge where source === target, THEN INVALID_EDGE ERROR is returned', () => {
      const result = validateArchitecture({
        nodes: [{ id: 'node-self', type: 'server', position: { x: 0, y: 0 }, data: { label: 'Server' } }],
        edges: [{ id: 'edge-self', source: 'node-self', target: 'node-self' }],
      });

      expect(result.valid).toBe(false);
      const issue = result.issues.find((i) => i.code === 'INVALID_EDGE');
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe('ERROR');
      expect(issue?.message).toContain('Self-loop');
      expect(issue?.edgeIds).toContain('edge-self');
      expect(issue?.nodeIds).toContain('node-self');
    });

    it('5. GIVEN duplicate edge IDs, THEN INVALID_EDGE ERROR is returned', () => {
      const result = validateArchitecture({
        nodes: [
          { id: 'n1', type: 'client', position: { x: 0, y: 0 }, data: { label: 'Client' } },
          { id: 'n2', type: 'server', position: { x: 50, y: 50 }, data: { label: 'Server' } },
        ],
        edges: [
          { id: 'dup-edge', source: 'n1', target: 'n2' },
          { id: 'dup-edge', source: 'n2', target: 'n1' },
        ],
      });

      expect(result.valid).toBe(false);
      const issue = result.issues.find((i) => i.code === 'INVALID_EDGE');
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe('ERROR');
      expect(issue?.message).toContain('Duplicate edge ID');
    });

    it('6. GIVEN disconnected node with 0 connections, THEN DISCONNECTED_NODE WARNING is returned', () => {
      const result = validateArchitecture({
        nodes: [
          { id: 'n1', type: 'client', position: { x: 0, y: 0 }, data: { label: 'Web' } },
          { id: 'n2', type: 'server', position: { x: 50, y: 50 }, data: { label: 'API' } },
          { id: 'n3-isolated', type: 'cache', position: { x: 100, y: 100 }, data: { label: 'Redis Cache' } },
        ],
        edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
      });

      // Disconnected node is a WARNING, does not invalidate graph
      expect(result.valid).toBe(true);
      const issue = result.issues.find((i) => i.code === 'DISCONNECTED_NODE');
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe('WARNING');
      expect(issue?.nodeIds).toContain('n3-isolated');
      expect(issue?.message).toContain('Redis Cache');
    });

    it('7. GIVEN directed cycle A -> B -> C -> A, THEN CIRCULAR_DEPENDENCY WARNING is returned', () => {
      const result = validateArchitecture({
        nodes: [
          { id: 'a', type: 'microservice', position: { x: 0, y: 0 }, data: { label: 'Service A' } },
          { id: 'b', type: 'microservice', position: { x: 50, y: 0 }, data: { label: 'Service B' } },
          { id: 'c', type: 'microservice', position: { x: 100, y: 0 }, data: { label: 'Service C' } },
        ],
        edges: [
          { id: 'e1', source: 'a', target: 'b' },
          { id: 'e2', source: 'b', target: 'c' },
          { id: 'e3', source: 'c', target: 'a' },
        ],
      });

      expect(result.valid).toBe(true); // Warnings do not make graph invalid
      const cycleIssue = result.issues.find((i) => i.code === 'CIRCULAR_DEPENDENCY');
      expect(cycleIssue).toBeDefined();
      expect(cycleIssue?.severity).toBe('WARNING');
      expect(cycleIssue?.nodeIds).toEqual(['a', 'b', 'c']);
      expect(cycleIssue?.message).toContain('a -> b -> c -> a');
    });

    it('8. GIVEN multiple cycles, THEN cycles are deduplicated and canonicalized', () => {
      const result = validateArchitecture({
        nodes: [
          { id: 's1', type: 'server', position: { x: 0, y: 0 }, data: { label: 'S1' } },
          { id: 's2', type: 'server', position: { x: 10, y: 0 }, data: { label: 'S2' } },
        ],
        edges: [
          { id: 'e1', source: 's1', target: 's2' },
          { id: 'e2', source: 's2', target: 's1' },
        ],
      });

      const cycleIssues = result.issues.filter((i) => i.code === 'CIRCULAR_DEPENDENCY');
      // Should report exactly 1 cycle issue, not multiple rotations of the same cycle
      expect(cycleIssues.length).toBe(1);
      expect(cycleIssues[0].nodeIds).toEqual(['s1', 's2']);
    });

    it('9. GIVEN empty or missing node label, THEN MISSING_CONFIGURATION ERROR is returned', () => {
      const result = validateArchitecture({
        nodes: [
          { id: 'bad-label-node', type: 'server', position: { x: 0, y: 0 }, data: { label: '   ' } },
        ],
        edges: [],
      });

      expect(result.valid).toBe(false);
      const configIssue = result.issues.find((i) => i.code === 'MISSING_CONFIGURATION');
      expect(configIssue).toBeDefined();
      expect(configIssue?.severity).toBe('ERROR');
      expect(configIssue?.message).toContain('empty or missing label');
    });

    it('10. GIVEN node declaring requiresConnection in metadata without edges, THEN MISSING_CONNECTION is returned', () => {
      const result = validateArchitecture({
        nodes: [
          {
            id: 'gateway-1',
            type: 'api-gateway',
            position: { x: 0, y: 0 },
            data: { label: 'API Gateway', metadata: { requiresConnection: true } },
          },
        ],
        edges: [],
      });

      const issue = result.issues.find((i) => i.code === 'MISSING_CONNECTION');
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe('WARNING');
      expect(issue?.nodeIds).toContain('gateway-1');
    });

    it('11. GIVEN identical input, WHEN validated repeatedly, THEN output ordering is deterministic', () => {
      const testGraph = {
        nodes: [
          { id: 'z-node', type: 'server', position: { x: 0, y: 0 }, data: { label: 'Z' } },
          { id: 'a-node', type: 'server', position: { x: 0, y: 0 }, data: { label: 'A' } },
          { id: 'bad-node', type: 'database', position: { x: 0, y: 0 }, data: { label: '' } },
        ],
        edges: [
          { id: 'e-bad', source: 'missing-source', target: 'a-node' },
          { id: 'e-loop', source: 'z-node', target: 'z-node' },
        ],
      };

      const result1 = validateArchitecture(testGraph);
      const result2 = validateArchitecture(testGraph);

      expect(result1.valid).toBe(result2.valid);
      expect(result1.issues.length).toBe(result2.issues.length);

      for (let i = 0; i < result1.issues.length; i++) {
        expect(result1.issues[i].code).toBe(result2.issues[i].code);
        expect(result1.issues[i].severity).toBe(result2.issues[i].severity);
        expect(result1.issues[i].message).toBe(result2.issues[i].message);
        expect(result1.issues[i].nodeIds).toEqual(result2.issues[i].nodeIds);
      }
    });

    it('12. GIVEN input graph, WHEN validated, THEN original data is not mutated', () => {
      const originalNodes = [
        { id: 'n1', type: 'server', position: { x: 0, y: 0 }, data: { label: 'Server 1' } },
      ];
      const originalEdges = [
        { id: 'e1', source: 'n1', target: 'missing-target' },
      ];

      const nodesCopy = JSON.parse(JSON.stringify(originalNodes));
      const edgesCopy = JSON.parse(JSON.stringify(originalEdges));

      validateArchitecture({ nodes: originalNodes, edges: originalEdges });

      expect(originalNodes).toEqual(nodesCopy);
      expect(originalEdges).toEqual(edgesCopy);
    });

    it('13. GIVEN ArchitectureValidationService.validateGraph delegation, THEN behavior matches validateArchitecture', () => {
      const graph = {
        nodes: [{ id: 'n1', type: 'server', position: { x: 0, y: 0 }, data: { label: 'Server' } }],
        edges: [{ id: 'e1', source: 'n1', target: 'missing' }],
      };

      const directResult = validateArchitecture(graph);
      const serviceResult = ArchitectureValidationService.validateGraph(graph);

      expect(serviceResult.valid).toBe(directResult.valid);
      expect(serviceResult.issues.length).toBe(directResult.issues.length);
    });
  });

  // =========================================================================
  // 2. API Validation Endpoint (POST /api/v1/projects/:projectId/architecture/validate)
  // =========================================================================

  describe('2. POST /api/v1/projects/:projectId/architecture/validate Endpoint', () => {
    it('14. GIVEN unauthenticated request, WHEN validate is called, THEN 401 Unauthorized is returned', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${testProjectId}/architecture/validate`)
        .send({});

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('15. GIVEN non-member outsider, WHEN validate is called, THEN 403 Forbidden is returned', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${testProjectId}/architecture/validate`)
        .set('Cookie', outsiderCookie)
        .send({});

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('16. GIVEN invalid projectId format, WHEN validate is called, THEN 400 Validation Error is returned', async () => {
      const res = await request(app)
        .post('/api/v1/projects/invalid-id-format/architecture/validate')
        .set('Cookie', ownerCookie)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('17. GIVEN non-existent project ID, WHEN validate is called, THEN 404/403 is returned', async () => {
      const fakeId = new mongoose.Types.ObjectId().toHexString();
      const res = await request(app)
        .post(`/api/v1/projects/${fakeId}/architecture/validate`)
        .set('Cookie', ownerCookie)
        .send({});

      expect([403, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('18. GIVEN owner, WHEN validating persisted architecture, THEN 200 with validation result is returned', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${testProjectId}/architecture/validate`)
        .set('Cookie', ownerCookie)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(typeof res.body.data.valid).toBe('boolean');
      expect(Array.isArray(res.body.data.issues)).toBe(true);
      expect(res.body.data.validatedAt).toBeDefined();
    });

    it('19. GIVEN editor, WHEN validating persisted architecture, THEN 200 is returned', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${testProjectId}/architecture/validate`)
        .set('Cookie', editorCookie)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('20. GIVEN viewer, WHEN validating architecture, THEN 200 is returned (viewers can validate)', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${testProjectId}/architecture/validate`)
        .set('Cookie', viewerCookie)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('21. GIVEN draft graph in request body, WHEN validate is called, THEN draft graph is evaluated without database mutation', async () => {
      const draftGraph = {
        nodes: [
          { id: 'draft-1', type: 'server', position: { x: 0, y: 0 }, data: { label: 'Draft Server' } },
          { id: 'draft-2', type: 'database', position: { x: 10, y: 10 }, data: { label: 'Draft DB' } },
        ],
        edges: [
          { id: 'draft-edge-invalid', source: 'draft-1', target: 'non-existent-node' },
        ],
      };

      const res = await request(app)
        .post(`/api/v1/projects/${testProjectId}/architecture/validate`)
        .set('Cookie', editorCookie)
        .send(draftGraph);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.valid).toBe(false);
      expect(res.body.data.issues.some((i: any) => i.code === 'INVALID_EDGE')).toBe(true);

      // Verify the persisted database architecture was NOT modified
      const getRes = await request(app)
        .get(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', ownerCookie);

      expect(getRes.status).toBe(200);
      // Persisted architecture does not have the draft nodes
      const persistedNodeIds = getRes.body.data.architecture.nodes.map((n: any) => n.id);
      expect(persistedNodeIds).not.toContain('draft-1');
    });

    it('22. GIVEN validation execution, THEN architecture version remains unchanged', async () => {
      const beforeRes = await request(app)
        .get(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', ownerCookie);
      const versionBefore = beforeRes.body.data.architecture.version;

      await request(app)
        .post(`/api/v1/projects/${testProjectId}/architecture/validate`)
        .set('Cookie', ownerCookie)
        .send({});

      const afterRes = await request(app)
        .get(`/api/v1/projects/${testProjectId}/architecture`)
        .set('Cookie', ownerCookie);
      const versionAfter = afterRes.body.data.architecture.version;

      expect(versionAfter).toBe(versionBefore);
    });
  });
});
