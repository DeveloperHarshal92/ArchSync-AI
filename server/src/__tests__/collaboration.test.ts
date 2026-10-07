import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import http from 'http';
import request from 'supertest';
import mongoose from 'mongoose';
import { io as ClientSocket, Socket as ClientSocketType } from 'socket.io-client';
import { app } from '../app';
import { env } from '../config/env';
import { initSocketServer, closeSocketServer } from '../sockets';
import { resetRoomsState } from '../sockets/rooms';
import { User } from '../models/user.model';
import { ProjectModel } from '../models/project.model';
import { ProjectMemberModel } from '../models/projectMember.model';
import { ArchitectureModel } from '../models/architecture.model';
import { ArchitectureNode, ArchitectureEdge, ProjectStateEvent } from '@archsync/shared';

describe('ArchSync AI — F10 Real-Time Collaboration Behavioral Test Suite', () => {
  let server: http.Server;
  let serverPort: number;

  const ownerCreds = {
    name: 'Owner Collab',
    email: 'owner@archsync-collab-test.io',
    password: 'Password123!',
  };

  const editorCreds = {
    name: 'Editor Collab',
    email: 'editor@archsync-collab-test.io',
    password: 'Password123!',
  };

  const viewerCreds = {
    name: 'Viewer Collab',
    email: 'viewer@archsync-collab-test.io',
    password: 'Password123!',
  };

  const outsiderCreds = {
    name: 'Outsider Collab',
    email: 'outsider@archsync-collab-test.io',
    password: 'Password123!',
  };

  let ownerCookie: string;
  let editorCookie: string;
  let viewerCookie: string;
  let outsiderCookie: string;

  let ownerUser: any;
  let editorUser: any;
  let viewerUser: any;

  let testProjectId1: string;
  let testProjectId2: string;

  const extractCookie = (res: request.Response): string => {
    const setCookie = res.headers['set-cookie'];
    if (!setCookie) return '';
    return Array.isArray(setCookie) ? setCookie[0] : setCookie;
  };

  // Helper to connect a test client with given cookie
  const createClientSocket = (cookie?: string): Promise<ClientSocketType> => {
    return new Promise((resolve, reject) => {
      const client = ClientSocket(`http://localhost:${serverPort}`, {
        extraHeaders: cookie ? { Cookie: cookie } : undefined,
        transports: ['websocket'],
        forceNew: true,
        reconnection: false,
      });

      const timer = setTimeout(() => {
        client.disconnect();
        reject(new Error('Socket connection timeout'));
      }, 5000);

      client.on('connect', () => {
        clearTimeout(timer);
        resolve(client);
      });

      client.on('connect_error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  };

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }

    // Start HTTP and Socket.IO server on dynamic port
    server = http.createServer(app);
    initSocketServer(server);

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        serverPort = (server.address() as any).port;
        resolve();
      });
    });

    // Cleanup any lingering users from previous test runs
    await User.deleteMany({ email: { $regex: /@archsync-collab-test\.io$/i } });
    await ProjectModel.deleteMany({});
    await ProjectMemberModel.deleteMany({});
    await ArchitectureModel.deleteMany({});

    // Register & Login Owner
    await request(app).post('/api/v1/auth/register').send(ownerCreds);
    const ownerLogin = await request(app).post('/api/v1/auth/login').send(ownerCreds);
    ownerCookie = extractCookie(ownerLogin);
    ownerUser = ownerLogin.body.data.user;

    // Register & Login Editor
    await request(app).post('/api/v1/auth/register').send(editorCreds);
    const editorLogin = await request(app).post('/api/v1/auth/login').send(editorCreds);
    editorCookie = extractCookie(editorLogin);
    editorUser = editorLogin.body.data.user;

    // Register & Login Viewer
    await request(app).post('/api/v1/auth/register').send(viewerCreds);
    const viewerLogin = await request(app).post('/api/v1/auth/login').send(viewerCreds);
    viewerCookie = extractCookie(viewerLogin);
    viewerUser = viewerLogin.body.data.user;

    // Register & Login Outsider
    await request(app).post('/api/v1/auth/register').send(outsiderCreds);
    const outsiderLogin = await request(app).post('/api/v1/auth/login').send(outsiderCreds);
    outsiderCookie = extractCookie(outsiderLogin);
  });

  afterAll(async () => {
    await closeSocketServer();
    if (server.listening) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }

    await User.deleteMany({ email: { $regex: /@archsync-collab-test\.io$/i } });
    await ProjectModel.deleteMany({});
    await ProjectMemberModel.deleteMany({});
    await ArchitectureModel.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    resetRoomsState();
    await ProjectModel.deleteMany({});
    await ProjectMemberModel.deleteMany({});
    await ArchitectureModel.deleteMany({});

    // Create Project 1 owned by Owner
    const proj1 = await ProjectModel.create({
      name: 'Project 1 Alpha',
      description: 'First test project',
      ownerId: new mongoose.Types.ObjectId(ownerUser.id),
    });
    testProjectId1 = proj1._id.toString();

    await ProjectMemberModel.create({
      projectId: proj1._id,
      userId: new mongoose.Types.ObjectId(ownerUser.id),
      role: 'OWNER',
    });

    // Add Editor and Viewer to Project 1
    await ProjectMemberModel.create({
      projectId: proj1._id,
      userId: new mongoose.Types.ObjectId(editorUser.id),
      role: 'EDITOR',
    });

    await ProjectMemberModel.create({
      projectId: proj1._id,
      userId: new mongoose.Types.ObjectId(viewerUser.id),
      role: 'VIEWER',
    });

    // Create Project 2 owned by Owner
    const proj2 = await ProjectModel.create({
      name: 'Project 2 Beta',
      description: 'Second test project',
      ownerId: new mongoose.Types.ObjectId(ownerUser.id),
    });
    testProjectId2 = proj2._id.toString();

    await ProjectMemberModel.create({
      projectId: proj2._id,
      userId: new mongoose.Types.ObjectId(ownerUser.id),
      role: 'OWNER',
    });
  });

  describe('1. Socket Authentication Handshake', () => {
    it('1. GIVEN missing auth cookie, WHEN socket connects, THEN connection is rejected', async () => {
      await expect(createClientSocket()).rejects.toThrow();
    });

    it('2. GIVEN invalid auth token in cookie, WHEN socket connects, THEN connection is rejected', async () => {
      const invalidCookie = 'auth_token=invalid.jwt.token; Path=/; HttpOnly';
      await expect(createClientSocket(invalidCookie)).rejects.toThrow();
    });

    it('3. GIVEN valid auth cookie, WHEN socket connects, THEN connection succeeds', async () => {
      const client = await createClientSocket(ownerCookie);
      expect(client.connected).toBe(true);
      client.disconnect();
    });
  });

  describe('2. Project Room Authorization & Initial State Sync', () => {
    it('4. GIVEN authenticated non-member, WHEN attempting project:join, THEN join is rejected with FORBIDDEN', async () => {
      const client = await createClientSocket(outsiderCookie);

      const errorPromise = new Promise<{ code: string; message: string }>((resolve) => {
        client.on('error', (err) => resolve(err));
      });

      client.emit('project:join', { projectId: testProjectId1 });

      const error = await errorPromise;
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toContain('permission');

      client.disconnect();
    });

    it('5. GIVEN non-existent project, WHEN attempting project:join, THEN error is returned', async () => {
      const client = await createClientSocket(ownerCookie);
      const fakeId = new mongoose.Types.ObjectId().toString();

      const errorPromise = new Promise<{ code: string; message: string }>((resolve) => {
        client.on('error', (err) => resolve(err));
      });

      client.emit('project:join', { projectId: fakeId });

      const error = await errorPromise;
      expect(error.code).toBe('INVALID_PROJECT');

      client.disconnect();
    });

    it('6. GIVEN authorized OWNER, WHEN joining project, THEN receive project:state with version and presence:state', async () => {
      const client = await createClientSocket(ownerCookie);

      const statePromise = new Promise<ProjectStateEvent>((resolve) => {
        client.on('project:state', (state) => resolve(state));
      });

      const presenceStatePromise = new Promise<{ projectId: string; presences: any[] }>((resolve) => {
        client.on('presence:state', (presences) => resolve(presences));
      });

      client.emit('project:join', { projectId: testProjectId1 });

      const state = await statePromise;
      expect(state.projectId).toBe(testProjectId1);
      expect(state.version).toBe(1);
      expect(Array.isArray(state.nodes)).toBe(true);
      expect(Array.isArray(state.edges)).toBe(true);

      const presenceState = await presenceStatePromise;
      expect(presenceState.projectId).toBe(testProjectId1);
      expect(presenceState.presences.length).toBe(1);
      expect(presenceState.presences[0].userId).toBe(ownerUser.id);

      client.disconnect();
    });

    it('7. GIVEN authorized EDITOR and VIEWER, WHEN joining project, THEN both receive project:state', async () => {
      const editorClient = await createClientSocket(editorCookie);
      const viewerClient = await createClientSocket(viewerCookie);

      const editorStatePromise = new Promise<ProjectStateEvent>((resolve) => {
        editorClient.on('project:state', (state) => resolve(state));
      });

      const viewerStatePromise = new Promise<ProjectStateEvent>((resolve) => {
        viewerClient.on('project:state', (state) => resolve(state));
      });

      editorClient.emit('project:join', { projectId: testProjectId1 });
      viewerClient.emit('project:join', { projectId: testProjectId1 });

      const editorState = await editorStatePromise;
      const viewerState = await viewerStatePromise;

      expect(editorState.projectId).toBe(testProjectId1);
      expect(viewerState.projectId).toBe(testProjectId1);

      editorClient.disconnect();
      viewerClient.disconnect();
    });
  });

  describe('3. Room Isolation & Sender Echo Prevention', () => {
    it('8. GIVEN User A in Project 1 and User B in Project 2, WHEN User A updates a node, THEN User B receives nothing', async () => {
      const clientA = await createClientSocket(ownerCookie);
      const clientB = await createClientSocket(ownerCookie);

      clientA.emit('project:join', { projectId: testProjectId1 });
      clientB.emit('project:join', { projectId: testProjectId2 });

      // Wait briefly for room join
      await new Promise((r) => setTimeout(r, 100));

      let userBReceived = false;
      clientB.on('node:update', () => {
        userBReceived = true;
      });

      const testNode: ArchitectureNode = {
        id: 'node_iso_1',
        type: 'web-app',
        position: { x: 100, y: 150 },
        data: { label: 'Web Front' },
        createdBy: ownerUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      clientA.emit('node:update', { projectId: testProjectId1, node: testNode, version: 2 });

      await new Promise((r) => setTimeout(r, 200));

      expect(userBReceived).toBe(false);

      clientA.disconnect();
      clientB.disconnect();
    });

    it('9. GIVEN User A and User B in Project 1, WHEN User A updates node, THEN User B receives update AND User A does NOT receive echo', async () => {
      const clientA = await createClientSocket(ownerCookie);
      const clientB = await createClientSocket(editorCookie);

      clientA.emit('project:join', { projectId: testProjectId1 });
      clientB.emit('project:join', { projectId: testProjectId1 });

      await new Promise((r) => setTimeout(r, 100));

      let clientAReceived = false;
      clientA.on('node:update', () => {
        clientAReceived = true;
      });

      const clientBReceivedPromise = new Promise<{ node: ArchitectureNode }>((resolve) => {
        clientB.on('node:update', (payload) => resolve(payload));
      });

      const testNode: ArchitectureNode = {
        id: 'node_broadcast_1',
        type: 'api-gateway',
        position: { x: 200, y: 300 },
        data: { label: 'Gateway Primary' },
        createdBy: ownerUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      clientA.emit('node:update', { projectId: testProjectId1, node: testNode, version: 2 });

      const received = await clientBReceivedPromise;
      expect(received.node.id).toBe('node_broadcast_1');
      expect(received.node.data.label).toBe('Gateway Primary');

      await new Promise((r) => setTimeout(r, 100));
      // Sender echo prevention confirmed
      expect(clientAReceived).toBe(false);

      clientA.disconnect();
      clientB.disconnect();
    });
  });

  describe('4. Role Permissions Enforcement (Owner/Editor vs Viewer)', () => {
    it('10. GIVEN Viewer role, WHEN emitting node:create, THEN server rejects with FORBIDDEN and does not broadcast', async () => {
      const viewerClient = await createClientSocket(viewerCookie);
      const editorClient = await createClientSocket(editorCookie);

      viewerClient.emit('project:join', { projectId: testProjectId1 });
      editorClient.emit('project:join', { projectId: testProjectId1 });

      await new Promise((r) => setTimeout(r, 100));

      let editorReceived = false;
      editorClient.on('node:create', () => {
        editorReceived = true;
      });

      const errorPromise = new Promise<{ code: string; message: string }>((resolve) => {
        viewerClient.on('error', (err) => resolve(err));
      });

      const testNode: ArchitectureNode = {
        id: 'node_viewer_fail',
        type: 'database',
        position: { x: 10, y: 20 },
        data: { label: 'DB Master' },
        createdBy: viewerUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      viewerClient.emit('node:create', { projectId: testProjectId1, node: testNode, version: 2 });

      const err = await errorPromise;
      expect(err.code).toBe('FORBIDDEN');
      expect(err.message).toContain('Viewers cannot modify');

      await new Promise((r) => setTimeout(r, 100));
      expect(editorReceived).toBe(false);

      viewerClient.disconnect();
      editorClient.disconnect();
    });

    it('11. GIVEN Viewer role, WHEN emitting cursor:update, THEN cursor update is broadcast successfully', async () => {
      const viewerClient = await createClientSocket(viewerCookie);
      const editorClient = await createClientSocket(editorCookie);

      viewerClient.emit('project:join', { projectId: testProjectId1 });
      editorClient.emit('project:join', { projectId: testProjectId1 });

      await new Promise((r) => setTimeout(r, 100));

      const cursorPromise = new Promise<{ userId: string; x: number; y: number }>((resolve) => {
        editorClient.on('cursor:update', (payload) => resolve(payload));
      });

      viewerClient.emit('cursor:update', { projectId: testProjectId1, x: 123, y: 456 });

      const received = await cursorPromise;
      expect(received.userId).toBe(viewerUser.id);
      expect(received.x).toBe(123);
      expect(received.y).toBe(456);

      viewerClient.disconnect();
      editorClient.disconnect();
    });
  });

  describe('5. Node & Edge Synchronizations', () => {
    it('12. GIVEN Editor creates a node, THEN connected collaborators receive node:create', async () => {
      const clientA = await createClientSocket(editorCookie);
      const clientB = await createClientSocket(ownerCookie);

      clientA.emit('project:join', { projectId: testProjectId1 });
      clientB.emit('project:join', { projectId: testProjectId1 });

      await new Promise((r) => setTimeout(r, 100));

      const createPromise = new Promise<{ node: ArchitectureNode }>((resolve) => {
        clientB.on('node:create', (payload) => resolve(payload));
      });

      const newNode: ArchitectureNode = {
        id: 'node_created_1',
        type: 'microservice',
        position: { x: 300, y: 400 },
        data: { label: 'Auth Microservice' },
        createdBy: editorUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      clientA.emit('node:create', { projectId: testProjectId1, node: newNode, version: 2 });

      const received = await createPromise;
      expect(received.node.id).toBe('node_created_1');
      expect(received.node.type).toBe('microservice');

      clientA.disconnect();
      clientB.disconnect();
    });

    it('13. GIVEN Editor deletes a node, THEN connected collaborators receive node:delete', async () => {
      const clientA = await createClientSocket(editorCookie);
      const clientB = await createClientSocket(ownerCookie);

      clientA.emit('project:join', { projectId: testProjectId1 });
      clientB.emit('project:join', { projectId: testProjectId1 });

      await new Promise((r) => setTimeout(r, 100));

      const deletePromise = new Promise<{ nodeId: string }>((resolve) => {
        clientB.on('node:delete', (payload) => resolve(payload));
      });

      clientA.emit('node:delete', { projectId: testProjectId1, nodeId: 'node_created_1', version: 3 });

      const received = await deletePromise;
      expect(received.nodeId).toBe('node_created_1');

      clientA.disconnect();
      clientB.disconnect();
    });

    it('14. GIVEN Editor creates and deletes an edge, THEN connected collaborators receive edge events', async () => {
      const clientA = await createClientSocket(editorCookie);
      const clientB = await createClientSocket(ownerCookie);

      clientA.emit('project:join', { projectId: testProjectId1 });
      clientB.emit('project:join', { projectId: testProjectId1 });

      await new Promise((r) => setTimeout(r, 100));

      const edgeCreatePromise = new Promise<{ edge: ArchitectureEdge }>((resolve) => {
        clientB.on('edge:create', (payload) => resolve(payload));
      });

      const testEdge: ArchitectureEdge = {
        id: 'edge_sync_1',
        source: 'node_1',
        target: 'node_2',
        type: 'default',
        label: 'HTTP REST',
        createdBy: editorUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      clientA.emit('edge:create', { projectId: testProjectId1, edge: testEdge, version: 4 });

      const createdEdge = await edgeCreatePromise;
      expect(createdEdge.edge.id).toBe('edge_sync_1');
      expect(createdEdge.edge.label).toBe('HTTP REST');

      const edgeDeletePromise = new Promise<{ edgeId: string }>((resolve) => {
        clientB.on('edge:delete', (payload) => resolve(payload));
      });

      clientA.emit('edge:delete', { projectId: testProjectId1, edgeId: 'edge_sync_1', version: 5 });

      const deletedEdge = await edgeDeletePromise;
      expect(deletedEdge.edgeId).toBe('edge_sync_1');

      clientA.disconnect();
      clientB.disconnect();
    });
  });

  describe('6. Presence Lifecycle (Join, Leave, Disconnect, Selection)', () => {
    it('15. GIVEN User A is in room, WHEN User B joins, THEN User A receives presence:join', async () => {
      const clientA = await createClientSocket(ownerCookie);
      const clientB = await createClientSocket(editorCookie);

      clientA.emit('project:join', { projectId: testProjectId1 });
      await new Promise((r) => setTimeout(r, 100));

      const presenceJoinPromise = new Promise<{ userId: string; name: string }>((resolve) => {
        clientA.on('presence:join', (payload) => resolve(payload));
      });

      clientB.emit('project:join', { projectId: testProjectId1 });

      const joinPayload = await presenceJoinPromise;
      expect(joinPayload.userId).toBe(editorUser.id);
      expect(joinPayload.name).toBe(editorUser.name);

      clientA.disconnect();
      clientB.disconnect();
    });

    it('16. GIVEN User B leaves via project:leave, THEN User A receives presence:leave', async () => {
      const clientA = await createClientSocket(ownerCookie);
      const clientB = await createClientSocket(editorCookie);

      clientA.emit('project:join', { projectId: testProjectId1 });
      clientB.emit('project:join', { projectId: testProjectId1 });
      await new Promise((r) => setTimeout(r, 100));

      const leavePromise = new Promise<{ projectId: string; userId: string }>((resolve) => {
        clientA.on('presence:leave', (payload) => resolve(payload));
      });

      clientB.emit('project:leave', { projectId: testProjectId1 });

      const leavePayload = await leavePromise;
      expect(leavePayload.userId).toBe(editorUser.id);
      expect(leavePayload.projectId).toBe(testProjectId1);

      clientA.disconnect();
      clientB.disconnect();
    });

    it('17. GIVEN User B socket disconnects unexpectedly, THEN User A receives presence:leave automatically', async () => {
      const clientA = await createClientSocket(ownerCookie);
      const clientB = await createClientSocket(editorCookie);

      clientA.emit('project:join', { projectId: testProjectId1 });
      clientB.emit('project:join', { projectId: testProjectId1 });
      await new Promise((r) => setTimeout(r, 100));

      const leavePromise = new Promise<{ projectId: string; userId: string }>((resolve) => {
        clientA.on('presence:leave', (payload) => resolve(payload));
      });

      clientB.disconnect();

      const leavePayload = await leavePromise;
      expect(leavePayload.userId).toBe(editorUser.id);

      clientA.disconnect();
    });

    it('18. GIVEN User updates selected node, THEN collaborator receives presence:update', async () => {
      const clientA = await createClientSocket(ownerCookie);
      const clientB = await createClientSocket(editorCookie);

      clientA.emit('project:join', { projectId: testProjectId1 });
      clientB.emit('project:join', { projectId: testProjectId1 });
      await new Promise((r) => setTimeout(r, 100));

      const presenceUpdatePromise = new Promise<{ userId: string; selectedNodeId: string }>((resolve) => {
        clientB.on('presence:update', (payload: any) => resolve(payload));
      });

      clientA.emit('presence:update', { projectId: testProjectId1, selectedNodeId: 'node_active_123' });

      const updatePayload = await presenceUpdatePromise;
      expect(updatePayload.userId).toBe(ownerUser.id);
      expect(updatePayload.selectedNodeId).toBe('node_active_123');

      clientA.disconnect();
      clientB.disconnect();
    });
  });

  describe('7. Version Ordering & Payload Validation', () => {
    it('19. GIVEN current version is 5, WHEN stale version 4 event arrives, THEN event is ignored', async () => {
      const clientA = await createClientSocket(ownerCookie);
      const clientB = await createClientSocket(editorCookie);

      clientA.emit('project:join', { projectId: testProjectId1 });
      clientB.emit('project:join', { projectId: testProjectId1 });
      await new Promise((r) => setTimeout(r, 100));

      // Advance version to 5
      const advanceNode: ArchitectureNode = {
        id: 'node_v5',
        type: 'server',
        position: { x: 10, y: 10 },
        data: { label: 'V5 Component' },
        createdBy: ownerUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      clientA.emit('node:update', { projectId: testProjectId1, node: advanceNode, version: 5 });
      await new Promise((r) => setTimeout(r, 100));

      let clientBReceivedStale = false;
      clientB.on('node:update', (payload) => {
        if (payload.node.id === 'node_v4_stale') {
          clientBReceivedStale = true;
        }
      });

      // Submit stale version 4 event
      const staleNode: ArchitectureNode = {
        id: 'node_v4_stale',
        type: 'server',
        position: { x: 20, y: 20 },
        data: { label: 'Stale Component' },
        createdBy: ownerUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      clientA.emit('node:update', { projectId: testProjectId1, node: staleNode, version: 4 });

      await new Promise((r) => setTimeout(r, 200));

      expect(clientBReceivedStale).toBe(false);

      clientA.disconnect();
      clientB.disconnect();
    });

    it('20. GIVEN invalid payload (empty label), WHEN client emits node:create, THEN server rejects with INVALID_PAYLOAD', async () => {
      const clientA = await createClientSocket(ownerCookie);
      clientA.emit('project:join', { projectId: testProjectId1 });
      await new Promise((r) => setTimeout(r, 100));

      const errorPromise = new Promise<{ code: string; message: string }>((resolve) => {
        clientA.on('error', (err) => resolve(err));
      });

      const invalidNode: any = {
        id: 'invalid_node',
        type: 'server',
        position: { x: 10, y: 10 },
        data: { label: '' }, // Empty label is invalid
      };

      clientA.emit('node:create', { projectId: testProjectId1, node: invalidNode });

      const err = await errorPromise;
      expect(err.code).toBe('INVALID_PAYLOAD');

      clientA.disconnect();
    });
  });
});
