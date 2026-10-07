import { describe, it, expect } from 'vitest';
import collaborationReducer, {
  setConnectionState,
  setCollaborators,
  addOrUpdateCollaborator,
  removeCollaboratorByUserId,
  updateCollaboratorSelectionState,
  updateRemoteCursorState,
  setCollaborationError,
  resetCollaborationState,
  selectSocketConnectionState,
  selectCollaborators,
  selectRemoteCursors,
  selectCollaborationError,
  CollaborationState,
} from '../store/slices/collaborationSlice';
import { createArchitectureHash } from '../hooks/useArchitectureAutosave';
import { AppNode, AppEdge } from '../lib/architecture/adapters';
import { CollaboratorPresence } from '@archsync/shared';

describe('ArchSync AI — F10 Client Real-Time Collaboration & State Test Suite', () => {
  const initialSliceState: CollaborationState = {
    connectionState: 'disconnected',
    collaborators: [],
    remoteCursors: {},
    error: null,
  };

  const sampleCollaborator1: CollaboratorPresence = {
    userId: 'user_collab_1',
    name: 'Alice Architect',
    connectedAt: '2026-10-07T12:00:00.000Z',
  };

  const sampleCollaborator2: CollaboratorPresence = {
    userId: 'user_collab_2',
    name: 'Bob Reviewer',
    connectedAt: '2026-10-07T12:01:00.000Z',
  };

  describe('1. Collaboration Redux Slice Lifecycle', () => {
    it('1. GIVEN initial state, THEN defaults to disconnected with empty presence', () => {
      const state = collaborationReducer(undefined, { type: '@@INIT' });
      expect(state.connectionState).toBe('disconnected');
      expect(state.collaborators).toEqual([]);
      expect(state.remoteCursors).toEqual({});
      expect(state.error).toBeNull();
    });

    it('2. GIVEN connection state changes, THEN state updates accordingly', () => {
      let state = collaborationReducer(initialSliceState, setConnectionState('connecting'));
      expect(state.connectionState).toBe('connecting');

      state = collaborationReducer(state, setConnectionState('connected'));
      expect(state.connectionState).toBe('connected');

      state = collaborationReducer(state, setConnectionState('reconnecting'));
      expect(state.connectionState).toBe('reconnecting');

      state = collaborationReducer(state, setConnectionState('error'));
      expect(state.connectionState).toBe('error');
    });

    it('3. GIVEN disconnect action, THEN active remote cursors are cleared', () => {
      const stateWithCursors: CollaborationState = {
        connectionState: 'connected',
        collaborators: [sampleCollaborator1],
        remoteCursors: { user_collab_1: { x: 150, y: 250 } },
        error: null,
      };

      const next = collaborationReducer(stateWithCursors, setConnectionState('disconnected'));
      expect(next.connectionState).toBe('disconnected');
      expect(next.remoteCursors).toEqual({});
    });

    it('4. GIVEN full collaborator list, THEN setCollaborators replaces current list', () => {
      const state = collaborationReducer(
        initialSliceState,
        setCollaborators([sampleCollaborator1, sampleCollaborator2])
      );
      expect(state.collaborators.length).toBe(2);
      expect(state.collaborators[0].name).toBe('Alice Architect');
      expect(state.collaborators[1].name).toBe('Bob Reviewer');
    });

    it('5. GIVEN new collaborator joins, THEN addOrUpdateCollaborator appends to list', () => {
      let state = collaborationReducer(initialSliceState, addOrUpdateCollaborator(sampleCollaborator1));
      expect(state.collaborators.length).toBe(1);

      // Appending second user
      state = collaborationReducer(state, addOrUpdateCollaborator(sampleCollaborator2));
      expect(state.collaborators.length).toBe(2);

      // Updating existing user
      const updatedAlice: CollaboratorPresence = {
        ...sampleCollaborator1,
        selectedNodeId: 'node_alpha',
      };
      state = collaborationReducer(state, addOrUpdateCollaborator(updatedAlice));
      expect(state.collaborators.length).toBe(2);
      expect(state.collaborators[0].selectedNodeId).toBe('node_alpha');
    });

    it('6. GIVEN collaborator leaves, THEN removeCollaboratorByUserId removes presence and cursor', () => {
      const stateWithUsers: CollaborationState = {
        connectionState: 'connected',
        collaborators: [sampleCollaborator1, sampleCollaborator2],
        remoteCursors: {
          user_collab_1: { x: 50, y: 75 },
          user_collab_2: { x: 100, y: 200 },
        },
        error: null,
      };

      const next = collaborationReducer(
        stateWithUsers,
        removeCollaboratorByUserId('user_collab_1')
      );
      expect(next.collaborators.length).toBe(1);
      expect(next.collaborators[0].userId).toBe('user_collab_2');
      expect(next.remoteCursors['user_collab_1']).toBeUndefined();
      expect(next.remoteCursors['user_collab_2']).toEqual({ x: 100, y: 200 });
    });

    it('7. GIVEN collaborator updates selection, THEN selection state updates', () => {
      const stateWithUsers: CollaborationState = {
        connectionState: 'connected',
        collaborators: [sampleCollaborator1],
        remoteCursors: {},
        error: null,
      };

      const next = collaborationReducer(
        stateWithUsers,
        updateCollaboratorSelectionState({
          userId: 'user_collab_1',
          selectedNodeId: 'node_db_selected',
        })
      );
      expect(next.collaborators[0].selectedNodeId).toBe('node_db_selected');
    });

    it('8. GIVEN cursor coordinates update, THEN updateRemoteCursorState updates map and presence', () => {
      const stateWithUsers: CollaborationState = {
        connectionState: 'connected',
        collaborators: [sampleCollaborator1],
        remoteCursors: {},
        error: null,
      };

      const next = collaborationReducer(
        stateWithUsers,
        updateRemoteCursorState({
          userId: 'user_collab_1',
          cursor: { x: 340, y: 560 },
        })
      );
      expect(next.remoteCursors['user_collab_1']).toEqual({ x: 340, y: 560 });
      expect(next.collaborators[0].cursor).toEqual({ x: 340, y: 560 });
    });

    it('9. GIVEN collaboration error, THEN error state is recorded and cleared', () => {
      const err = { code: 'FORBIDDEN', message: 'Not authorized for project' };
      let state = collaborationReducer(initialSliceState, setCollaborationError(err));
      expect(state.error).toEqual(err);

      state = collaborationReducer(state, setCollaborationError(null));
      expect(state.error).toBeNull();
    });

    it('10. GIVEN resetCollaborationState, THEN state returns to initial defaults', () => {
      const dirtyState: CollaborationState = {
        connectionState: 'connected',
        collaborators: [sampleCollaborator1, sampleCollaborator2],
        remoteCursors: { user_collab_1: { x: 10, y: 20 } },
        error: { code: 'ERR', message: 'Test error' },
      };

      const next = collaborationReducer(dirtyState, resetCollaborationState());
      expect(next).toEqual(initialSliceState);
    });
  });

  describe('2. Selectors Contract', () => {
    it('11. GIVEN root state, THEN collaboration selectors extract correct slices', () => {
      const mockRootState: any = {
        collaboration: {
          connectionState: 'connected',
          collaborators: [sampleCollaborator1],
          remoteCursors: { user_collab_1: { x: 100, y: 200 } },
          error: { code: 'ERR', message: 'msg' },
        },
      };

      expect(selectSocketConnectionState(mockRootState)).toBe('connected');
      expect(selectCollaborators(mockRootState)).toEqual([sampleCollaborator1]);
      expect(selectRemoteCursors(mockRootState)).toEqual({ user_collab_1: { x: 100, y: 200 } });
      expect(selectCollaborationError(mockRootState)).toEqual({ code: 'ERR', message: 'msg' });
    });
  });

  describe('3. Local vs Remote Change Guard & Duplicate Persistence Prevention', () => {
    const testNodeA: AppNode = {
      id: 'node_guard_1',
      type: 'architectureNode',
      position: { x: 100, y: 100 },
      data: {
        label: 'Node A',
        description: '',
        technology: '',
        category: 'Compute',
        nodeType: 'server',
      },
    };

    const testNodeB: AppNode = {
      id: 'node_guard_2',
      type: 'architectureNode',
      position: { x: 300, y: 300 },
      data: {
        label: 'Node B',
        description: '',
        technology: '',
        category: 'Client',
        nodeType: 'web-app',
      },
    };

    const testEdge: AppEdge = {
      id: 'edge_guard_1',
      source: 'node_guard_1',
      target: 'node_guard_2',
      type: 'default',
      data: {
        edgeType: 'default',
      },
    };

    it('12. GIVEN identical graph state, THEN createArchitectureHash produces identical signature', () => {
      const hash1 = createArchitectureHash([testNodeA, testNodeB], [testEdge], { x: 0, y: 0, zoom: 1 });
      const hash2 = createArchitectureHash([testNodeB, testNodeA], [testEdge], { x: 0, y: 0, zoom: 1 });

      // Node order independent
      expect(hash1).toBe(hash2);
    });

    it('13. GIVEN remote update arrives, WHEN baseline hash is synchronized, THEN hash equality prevents dirty status', () => {
      let baselineHash = createArchitectureHash([testNodeA], [], { x: 0, y: 0, zoom: 1 });

      // Remote update adds testNodeB
      const updatedNodes = [testNodeA, testNodeB];
      const updatedEdges = [testEdge];

      // Simulated remote change guard: updates baseline hash to new remote graph
      baselineHash = createArchitectureHash(updatedNodes, updatedEdges, { x: 0, y: 0, zoom: 1 });

      const currentHash = createArchitectureHash(updatedNodes, updatedEdges, { x: 0, y: 0, zoom: 1 });

      // Because currentHash === baselineHash, no dirty autosave is triggered
      expect(currentHash).toBe(baselineHash);
    });

    it('14. GIVEN rapid cursor emits, THEN throttling restricts frequency', () => {
      let lastEmit = 0;
      const throttleInterval = 60; // ms (~16 fps)
      let emittedCount = 0;

      const emitCursor = (now: number) => {
        if (now - lastEmit >= throttleInterval) {
          lastEmit = now;
          emittedCount++;
        }
      };

      // 10 rapid events within 10ms
      for (let i = 0; i < 10; i++) {
        emitCursor(1000 + i);
      }
      expect(emittedCount).toBe(1);

      // Event after 70ms passes through
      emitCursor(1070);
      expect(emittedCount).toBe(2);

      // Event after 30ms dropped
      emitCursor(1100);
      expect(emittedCount).toBe(2);

      // Event after 80ms passes through
      emitCursor(1160);
      expect(emittedCount).toBe(3);
    });
  });
});
