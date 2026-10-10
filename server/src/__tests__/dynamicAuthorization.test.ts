import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import http from 'http';
import request from 'supertest';
import mongoose, { Types } from 'mongoose';
import { io as ClientSocket, Socket as ClientSocketType } from 'socket.io-client';
import { app } from '../app';
import { env } from '../config/env';
import { initSocketServer } from '../sockets';
import { resetRoomsState } from '../sockets/rooms';
import { User } from '../models/user.model';
import { ProjectModel } from '../models/project.model';
import { ProjectMemberModel } from '../models/projectMember.model';
import { ArchitectureModel } from '../models/architecture.model';
import { membershipService } from '../services/membership.service';
import { permissionService } from '../services/permission.service';
import { ArchitectureNode, ArchitectureEdge, ProjectStateEvent } from '@archsync/shared';

describe('ArchSync AI — F15.1 Dynamic WebSocket Authorization & Role Revocation Suite', () => {
  let server: http.Server;
  let serverPort: number;

  const ownerCreds = {
    name: 'Dynamic Owner',
    email: 'dynamic-owner@archsync-auth-test.io',
    password: 'Password123!',
  };

  const editorCreds = {
    name: 'Dynamic Editor',
    email: 'dynamic-editor@archsync-auth-test.io',
    password: 'Password123!',
  };

  let ownerCookie: string;
  let editorCookie: string;

  let ownerUser: any;
  let editorUser: any;

  let testProjectId: string;

  const extractCookie = (res: request.Response): string => {
    const setCookie = res.headers['set-cookie'];
    if (!setCookie) return '';
    return Array.isArray(setCookie) ? setCookie[0] : setCookie;
  };

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
      }, 10000);

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

  const joinProject = (client: ClientSocketType, projectId: string): Promise<ProjectStateEvent> => {
    return new Promise((resolve) => {
      client.once('project:state', (state) => resolve(state));
      client.emit('project:join', { projectId });
    });
  };

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }

    server = http.createServer(app);
    initSocketServer(server);

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        serverPort = (server.address() as any).port;
        resolve();
      });
    });

    // Register & Login Owner and Editor once for the entire suite
    await User.deleteMany({ email: { $regex: /@archsync-auth-test\.io$/i } });
    const regOwner = await request(app).post('/api/v1/auth/register').send(ownerCreds);
    ownerCookie = extractCookie(regOwner);
    ownerUser = regOwner.body.data.user;

    const regEditor = await request(app).post('/api/v1/auth/register').send(editorCreds);
    editorCookie = extractCookie(regEditor);
    editorUser = regEditor.body.data.user;
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@archsync-auth-test\.io$/i } });
    await ProjectModel.deleteMany({ name: 'Dynamic Auth Test Project' });
    await ProjectMemberModel.deleteMany({});
    await ArchitectureModel.deleteMany({});
    resetRoomsState();

    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    resetRoomsState();
    await ArchitectureModel.deleteMany({});
    await ProjectMemberModel.deleteMany({});
    await ProjectModel.deleteMany({ name: 'Dynamic Auth Test Project' });

    // Owner creates project
    const project = await ProjectModel.create({
      name: 'Dynamic Auth Test Project',
      ownerId: new Types.ObjectId(ownerUser.id),
    });
    testProjectId = project.id;

    // Add Owner and Editor memberships
    await ProjectMemberModel.create({
      projectId: project._id,
      userId: new Types.ObjectId(ownerUser.id),
      role: 'OWNER',
      joinedAt: new Date(),
    });

    await ProjectMemberModel.create({
      projectId: project._id,
      userId: new Types.ObjectId(editorUser.id),
      role: 'EDITOR',
      joinedAt: new Date(),
    });

    // Seed architecture document
    await ArchitectureModel.create({
      projectId: project._id,
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      version: 1,
    });
  });

  describe('1. Dynamic Role Downgrade (Editor -> Viewer)', () => {
    it('GIVEN connected Editor downgraded to Viewer, WHEN Editor emits architecture mutation, THEN mutation is rejected with FORBIDDEN and not broadcast', async () => {
      const ownerSocket = await createClientSocket(ownerCookie);
      const editorSocket = await createClientSocket(editorCookie);

      await Promise.all([
        joinProject(ownerSocket, testProjectId),
        joinProject(editorSocket, testProjectId),
      ]);

      // 1. Initial Editor mutation succeeds
      const initialNodePromise = new Promise<{ node: ArchitectureNode }>((resolve) => {
        ownerSocket.on('node:create', (payload) => resolve(payload));
      });

      const initialNode: ArchitectureNode = {
        id: 'node_init_1',
        type: 'server',
        position: { x: 100, y: 100 },
        data: { label: 'Node Before Downgrade' },
        createdBy: editorUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      editorSocket.emit('node:create', { projectId: testProjectId, node: initialNode, version: 2 });
      const broadcast1 = await initialNodePromise;
      expect(broadcast1.node.id).toBe('node_init_1');

      // 2. Owner downgrades Editor to VIEWER
      await membershipService.updateMemberRole(ownerUser.id, testProjectId, editorUser.id, 'VIEWER');

      // 3. Editor attempts to create another node
      let ownerReceivedForbiddenNode = false;
      ownerSocket.on('node:create', (payload) => {
        if (payload.node.id === 'node_after_downgrade') {
          ownerReceivedForbiddenNode = true;
        }
      });

      const forbiddenErrorPromise = new Promise<{ code: string; message: string }>((resolve) => {
        editorSocket.on('error', (err) => {
          if (err.code === 'FORBIDDEN') resolve(err);
        });
      });

      const forbiddenNode: ArchitectureNode = {
        id: 'node_after_downgrade',
        type: 'database',
        position: { x: 200, y: 200 },
        data: { label: 'Node After Downgrade' },
        createdBy: editorUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      editorSocket.emit('node:create', { projectId: testProjectId, node: forbiddenNode, version: 3 });

      const err = await forbiddenErrorPromise;
      expect(err.code).toBe('FORBIDDEN');
      expect(err.message).toContain('Viewers cannot modify architecture');

      // 4. Verify broadcast was prevented
      await new Promise((r) => setTimeout(r, 200));
      expect(ownerReceivedForbiddenNode).toBe(false);

      ownerSocket.disconnect();
      editorSocket.disconnect();
    });

    it('GIVEN connected Editor downgraded to Viewer, WHEN Editor attempts edge mutations, THEN edge mutations are rejected with FORBIDDEN', async () => {
      const ownerSocket = await createClientSocket(ownerCookie);
      const editorSocket = await createClientSocket(editorCookie);

      await Promise.all([
        joinProject(ownerSocket, testProjectId),
        joinProject(editorSocket, testProjectId),
      ]);

      // Downgrade Editor to VIEWER
      await membershipService.updateMemberRole(ownerUser.id, testProjectId, editorUser.id, 'VIEWER');

      const edgeErrorPromise = new Promise<{ code: string; message: string }>((resolve) => {
        editorSocket.on('error', (err) => {
          if (err.code === 'FORBIDDEN') resolve(err);
        });
      });

      const testEdge: ArchitectureEdge = {
        id: 'edge_viewer_fail',
        source: 'node_1',
        target: 'node_2',
        type: 'default',
        label: 'HTTP',
        createdBy: editorUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      editorSocket.emit('edge:create', { projectId: testProjectId, edge: testEdge, version: 3 });

      const err = await edgeErrorPromise;
      expect(err.code).toBe('FORBIDDEN');
      expect(err.message).toContain('Viewers cannot modify architecture');

      ownerSocket.disconnect();
      editorSocket.disconnect();
    });
  });

  describe('2. Dynamic Member Removal & Event Isolation', () => {
    it('GIVEN connected Editor removed from project, THEN Editor is evicted from room, receives MEMBERSHIP_REVOKED, and ceases receiving broadcasts', async () => {
      const ownerSocket = await createClientSocket(ownerCookie);
      const editorSocket = await createClientSocket(editorCookie);

      await Promise.all([
        joinProject(ownerSocket, testProjectId),
        joinProject(editorSocket, testProjectId),
      ]);

      const editorRevokedPromise = new Promise<{ code: string; message: string }>((resolve) => {
        editorSocket.on('error', (err) => {
          if (err.code === 'MEMBERSHIP_REVOKED') resolve(err);
        });
      });

      const ownerPresenceLeavePromise = new Promise<{ projectId: string; userId: string }>((resolve) => {
        ownerSocket.on('presence:leave', (payload) => resolve(payload));
      });

      // Owner removes Editor from project
      await membershipService.removeMember(ownerUser.id, testProjectId, editorUser.id);

      // Verify Editor received revocation signal and Owner received presence leave
      const revokedErr = await editorRevokedPromise;
      expect(revokedErr.code).toBe('MEMBERSHIP_REVOKED');

      const presenceLeave = await ownerPresenceLeavePromise;
      expect(presenceLeave.userId).toBe(editorUser.id);

      // Verify Editor no longer receives subsequent room broadcasts
      let editorReceivedOwnerNode = false;
      editorSocket.on('node:create', () => {
        editorReceivedOwnerNode = true;
      });

      const ownerNode: ArchitectureNode = {
        id: 'owner_protected_node',
        type: 'cloud-service',
        position: { x: 50, y: 50 },
        data: { label: 'Private Owner Component' },
        createdBy: ownerUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      ownerSocket.emit('node:create', { projectId: testProjectId, node: ownerNode, version: 2 });
      await new Promise((r) => setTimeout(r, 200));

      expect(editorReceivedOwnerNode).toBe(false);

      // Verify removed Editor cannot mutate architecture
      const mutationErrorPromise = new Promise<{ code: string; message: string }>((resolve) => {
        editorSocket.on('error', (err) => {
          if (err.code === 'NOT_IN_PROJECT' || err.code === 'FORBIDDEN') resolve(err);
        });
      });

      editorSocket.emit('node:delete', { projectId: testProjectId, nodeId: 'node_init_1', version: 3 });
      const mutationErr = await mutationErrorPromise;
      expect(['NOT_IN_PROJECT', 'FORBIDDEN']).toContain(mutationErr.code);

      ownerSocket.disconnect();
      editorSocket.disconnect();
    });

    it('GIVEN removed member, WHEN attempting to rejoin project room, THEN join is rejected with FORBIDDEN', async () => {
      // Remove Editor prior to join attempt
      await membershipService.removeMember(ownerUser.id, testProjectId, editorUser.id);

      const editorSocket = await createClientSocket(editorCookie);

      const joinErrorPromise = new Promise<{ code: string; message: string }>((resolve) => {
        editorSocket.on('error', (err) => {
          if (err.code === 'FORBIDDEN') resolve(err);
        });
      });

      editorSocket.emit('project:join', { projectId: testProjectId });

      const err = await joinErrorPromise;
      expect(err.code).toBe('FORBIDDEN');
      expect(err.message).toContain('permission');

      editorSocket.disconnect();
    });
  });

  describe('3. Active Owner & Editor Privileged Operations', () => {
    it('GIVEN authorized Owner and Editor, THEN mutations succeed and are delivered between collaborators', async () => {
      const ownerSocket = await createClientSocket(ownerCookie);
      const editorSocket = await createClientSocket(editorCookie);

      await Promise.all([
        joinProject(ownerSocket, testProjectId),
        joinProject(editorSocket, testProjectId),
      ]);

      const editorReceivedPromise = new Promise<{ node: ArchitectureNode }>((resolve) => {
        editorSocket.on('node:create', (payload) => resolve(payload));
      });

      const testNode: ArchitectureNode = {
        id: 'authorized_owner_node',
        type: 'api-gateway',
        position: { x: 10, y: 10 },
        data: { label: 'Gateway Authorized' },
        createdBy: ownerUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      ownerSocket.emit('node:create', { projectId: testProjectId, node: testNode, version: 2 });
      const received = await editorReceivedPromise;
      expect(received.node.id).toBe('authorized_owner_node');

      ownerSocket.disconnect();
      editorSocket.disconnect();
    });
  });

  describe('4. Fail-Closed Error Handling on Database Failure', () => {
    it('GIVEN database error during permission verification, THEN mutation is rejected with AUTHORIZATION_ERROR and not broadcast', async () => {
      const ownerSocket = await createClientSocket(ownerCookie);
      const editorSocket = await createClientSocket(editorCookie);

      await Promise.all([
        joinProject(ownerSocket, testProjectId),
        joinProject(editorSocket, testProjectId),
      ]);

      // Mock permissionService to throw a database failure
      const permSpy = vi
        .spyOn(permissionService, 'getProjectMembership')
        .mockRejectedValueOnce(new Error('MongoDB replica query timeout'));

      const errorPromise = new Promise<{ code: string; message: string }>((resolve) => {
        editorSocket.on('error', (err) => {
          if (err.code === 'AUTHORIZATION_ERROR') resolve(err);
        });
      });

      let ownerReceived = false;
      ownerSocket.on('node:create', () => {
        ownerReceived = true;
      });

      const faultNode: ArchitectureNode = {
        id: 'node_fault_test',
        type: 'server',
        position: { x: 0, y: 0 },
        data: { label: 'Fault Node' },
        createdBy: editorUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      editorSocket.emit('node:create', { projectId: testProjectId, node: faultNode, version: 2 });

      const err = await errorPromise;
      expect(err.code).toBe('AUTHORIZATION_ERROR');
      expect(err.message).toContain('Unable to verify project permissions');

      await new Promise((r) => setTimeout(r, 200));
      // Broadcast was safely prevented
      expect(ownerReceived).toBe(false);

      permSpy.mockRestore();
      ownerSocket.disconnect();
      editorSocket.disconnect();
    });
  });
});
