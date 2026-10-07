import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer, {
  toggleSidebar,
  setSidebarOpen,
  toggleDetailsPanel,
  setDetailsPanelOpen,
  toggleValidationPanel,
  setValidationPanelOpen,
  openModal,
  closeModal,
  resetUiState,
  selectSidebarOpen,
  selectDetailsPanelOpen,
  selectActiveModal,
} from '../store/slices/uiSlice';
import editorReducer, {
  setActiveProjectId,
  setSelectedNodeId,
  setSelectedEdgeId,
  clearSelection,
  setReadOnly,
  resetEditorState,
  selectActiveProjectId,
  selectSelectedNodeId,
  selectSelectedEdgeId,
  selectIsReadOnly,
} from '../store/slices/editorSlice';
import { baseApi, API_TAG_TYPES } from '../store/api/baseApi';
import { store as appStore, RootState } from '../store/index';
import {
  canViewProject,
  canEditProject,
  canManageMembers,
  canDeleteProject,
  canEditArchitecture,
  normalizeRole,
} from '../lib/permissions';
import { parseApiError } from '../lib/apiErrors';
import { architectureToReactFlow } from '../lib/architecture/adapters';
import { Architecture } from '@archsync/shared';

describe('ArchSync AI — F08 Redux + RTK Query State Architecture Suite', () => {
  describe('1. Redux UI Slice (uiSlice)', () => {
    it('1. GIVEN initial UI state, WHEN sidebar toggles, THEN sidebar state updates cleanly', () => {
      let state = uiReducer(undefined, { type: '@@INIT' });
      expect(state.sidebarOpen).toBe(true);

      state = uiReducer(state, toggleSidebar());
      expect(state.sidebarOpen).toBe(false);

      state = uiReducer(state, setSidebarOpen(true));
      expect(state.sidebarOpen).toBe(true);
    });

    it('2. GIVEN modal closed, WHEN openModal executes, THEN correct modal is active', () => {
      let state = uiReducer(undefined, { type: '@@INIT' });
      expect(state.activeModal).toBeNull();

      state = uiReducer(state, openModal('INVITE_MEMBER'));
      expect(state.activeModal).toBe('INVITE_MEMBER');
    });

    it('3. GIVEN modal open, WHEN closeModal executes, THEN modal becomes null', () => {
      let state = uiReducer(undefined, openModal('DELETE_CONFIRMATION'));
      expect(state.activeModal).toBe('DELETE_CONFIRMATION');

      state = uiReducer(state, closeModal());
      expect(state.activeModal).toBeNull();
    });

    it('3b. GIVEN details panel state, WHEN toggled or reset, THEN values transition predictably', () => {
      let state = uiReducer(undefined, { type: '@@INIT' });
      expect(state.detailsPanelOpen).toBe(true);

      state = uiReducer(state, toggleDetailsPanel());
      expect(state.detailsPanelOpen).toBe(false);

      state = uiReducer(state, setDetailsPanelOpen(true));
      expect(state.detailsPanelOpen).toBe(true);

      state = uiReducer(state, resetUiState());
      expect(state).toEqual({
        sidebarOpen: true,
        detailsPanelOpen: true,
        validationPanelOpen: false,
        aiPanelOpen: false,
        activeModal: null,
        theme: 'dark',
      });
    });

    it('3c. GIVEN validation panel state, WHEN toggled or reset, THEN values transition predictably', () => {
      let state = uiReducer(undefined, { type: '@@INIT' });
      expect(state.validationPanelOpen).toBe(false);

      state = uiReducer(state, toggleValidationPanel());
      expect(state.validationPanelOpen).toBe(true);

      state = uiReducer(state, setValidationPanelOpen(false));
      expect(state.validationPanelOpen).toBe(false);
    });
  });

  describe('2. Redux Editor Slice (editorSlice) & Project Isolation', () => {
    it('4. GIVEN no selected node, WHEN node selection action occurs, THEN selectedNodeId updates and clears edge', () => {
      let state = editorReducer(undefined, { type: '@@INIT' });
      expect(state.selectedNodeId).toBeNull();
      expect(state.selectedEdgeId).toBeNull();

      state = editorReducer(state, setSelectedNodeId('node_web_app_1'));
      expect(state.selectedNodeId).toBe('node_web_app_1');
      expect(state.selectedEdgeId).toBeNull();

      // Selecting an edge switches selection authority
      state = editorReducer(state, setSelectedEdgeId('edge_web_to_api_1'));
      expect(state.selectedEdgeId).toBe('edge_web_to_api_1');
      expect(state.selectedNodeId).toBeNull();

      // Clear selection
      state = editorReducer(state, clearSelection());
      expect(state.selectedNodeId).toBeNull();
      expect(state.selectedEdgeId).toBeNull();
    });

    it('5 & 17. GIVEN Project A selected node, WHEN navigating to Project B, THEN project-scoped selection resets and does not leak', () => {
      let state = editorReducer(undefined, setActiveProjectId('proj_A'));
      state = editorReducer(state, setSelectedNodeId('node_in_project_A'));
      expect(state.activeProjectId).toBe('proj_A');
      expect(state.selectedNodeId).toBe('node_in_project_A');

      // User navigates from Project A to Project B
      state = editorReducer(state, setActiveProjectId('proj_B'));
      expect(state.activeProjectId).toBe('proj_B');
      expect(state.selectedNodeId).toBeNull(); // Cleanly reset: no leakage!
      expect(state.selectedEdgeId).toBeNull();

      // Re-selecting inside Project B
      state = editorReducer(state, setSelectedNodeId('node_in_project_B'));
      expect(state.selectedNodeId).toBe('node_in_project_B');

      // Re-dispatching same project id does not wipe active selection
      state = editorReducer(state, setActiveProjectId('proj_B'));
      expect(state.selectedNodeId).toBe('node_in_project_B');
    });

    it('5b. GIVEN editor reset action, THEN full initial state is restored', () => {
      let state = editorReducer(undefined, setActiveProjectId('proj_A'));
      state = editorReducer(state, setSelectedNodeId('node_1'));
      state = editorReducer(state, setReadOnly(true));

      state = editorReducer(state, resetEditorState());
      expect(state).toEqual({
        activeProjectId: null,
        selectedNodeId: null,
        selectedEdgeId: null,
        readOnly: false,
        persistenceStatus: 'idle',
        lastSavedAt: null,
        lastSaveError: null,
        currentVersion: 1,
        hasVersionConflict: false,
      });
    });
  });

  describe('3. RTK Query Server Cache Boundaries & Tag Architecture', () => {
    it('6. GIVEN Redux root store, THEN server state is owned strictly by RTK Query without duplicate Redux slices', () => {
      const state = appStore.getState();

      // Verified: Store contains only UI, Editor, Collaboration, and RTK Query reducer
      expect(Object.keys(state)).toEqual(['ui', 'editor', 'collaboration', 'api']);

      // Prohibited duplicate slices do NOT exist
      expect((state as Record<string, unknown>).projects).toBeUndefined();
      expect((state as Record<string, unknown>).members).toBeUndefined();
      expect((state as Record<string, unknown>).invitations).toBeUndefined();
      expect((state as Record<string, unknown>).architecture).toBeUndefined();
      expect((state as Record<string, unknown>).user).toBeUndefined();
    });

    it('7-9. GIVEN RTK Query baseApi configuration, THEN required tagTypes are registered', () => {
      // baseApi must configure the unified tag hierarchy
      const expectedTags = ['Health', 'User', 'Project', 'Architecture', 'Member', 'Invitation'];
      expect(Array.from(API_TAG_TYPES)).toEqual(expectedTags);
    });

    it('10. GIVEN architecture hydration, THEN server snapshot initializes React Flow local state', () => {
      const serverSnapshot: Architecture = {
        projectId: 'proj_snapshot',
        version: 1,
        nodes: [
          {
            id: 'node_srv_1',
            type: 'server',
            position: { x: 200, y: 150 },
            data: { label: 'Auth Server', category: 'Compute' },
            createdBy: 'user_1',
            createdAt: '2026-10-07T12:00:00.000Z',
            updatedAt: '2026-10-07T12:00:00.000Z',
          },
        ],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        createdAt: '2026-10-07T12:00:00.000Z',
        updatedAt: '2026-10-07T12:00:00.000Z',
      };

      const flow = architectureToReactFlow(serverSnapshot);
      expect(flow.nodes).toHaveLength(1);
      expect(flow.nodes[0].id).toBe('node_srv_1');
      expect(flow.nodes[0].data.label).toBe('Auth Server');
    });

    it('12. GIVEN logout session transition, THEN baseApi.util.resetApiState resets cache', () => {
      const testStore = configureStore({
        reducer: {
          [baseApi.reducerPath]: baseApi.reducer,
          ui: uiReducer,
          editor: editorReducer,
        },
        middleware: (getDefault) => getDefault().concat(baseApi.middleware),
      });

      // Dispatch resetApiState on test store
      testStore.dispatch(baseApi.util.resetApiState());
      const apiState = testStore.getState().api;
      expect(apiState.queries).toEqual({});
      expect(apiState.mutations).toEqual({});
    });
  });

  describe('4. Permission Helpers (Client-side Access Matrix)', () => {
    it('13. GIVEN OWNER, THEN canEditArchitecture returns true', () => {
      expect(canEditArchitecture('OWNER')).toBe(true);
      expect(canEditArchitecture('owner')).toBe(true);
    });

    it('14. GIVEN EDITOR, THEN canEditArchitecture returns true', () => {
      expect(canEditArchitecture('EDITOR')).toBe(true);
      expect(canEditArchitecture('editor')).toBe(true);
    });

    it('15. GIVEN VIEWER, THEN canEditArchitecture returns false', () => {
      expect(canEditArchitecture('VIEWER')).toBe(false);
      expect(canEditArchitecture('viewer')).toBe(false);
    });

    it('16. GIVEN VIEWER, THEN canManageMembers returns false', () => {
      expect(canManageMembers('VIEWER')).toBe(false);
      expect(canManageMembers('viewer')).toBe(false);
    });

    it('16b. GIVEN role matrix, THEN all project permission functions enforce strict capability gating', () => {
      // Owner
      expect(canViewProject('OWNER')).toBe(true);
      expect(canEditProject('OWNER')).toBe(true);
      expect(canManageMembers('OWNER')).toBe(true);
      expect(canDeleteProject('OWNER')).toBe(true);

      // Editor
      expect(canViewProject('EDITOR')).toBe(true);
      expect(canEditProject('EDITOR')).toBe(true);
      expect(canManageMembers('EDITOR')).toBe(false);
      expect(canDeleteProject('EDITOR')).toBe(false);

      // Viewer
      expect(canViewProject('VIEWER')).toBe(true);
      expect(canEditProject('VIEWER')).toBe(false);
      expect(canManageMembers('VIEWER')).toBe(false);
      expect(canDeleteProject('VIEWER')).toBe(false);

      // Unauthenticated / Null / Invalid
      expect(canViewProject(null)).toBe(false);
      expect(canEditProject(undefined)).toBe(false);
      expect(canManageMembers('')).toBe(false);
      expect(normalizeRole('INVALID_ROLE')).toBeNull();
    });
  });

  describe('5. Standardized Error Handling (apiErrors)', () => {
    it('18. GIVEN backend error response, THEN parseApiError normalizes error safely', () => {
      const mockFetchError = {
        status: 403,
        data: {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only the project owner can perform this operation.',
          },
        },
      };

      const parsed = parseApiError(mockFetchError);
      expect(parsed.status).toBe(403);
      expect(parsed.code).toBe('FORBIDDEN');
      expect(parsed.message).toBe('Only the project owner can perform this operation.');
    });

    it('19. GIVEN network fetch failure, THEN parseApiError produces helpful default message', () => {
      const networkError = {
        status: 'FETCH_ERROR',
        error: 'TypeError: Failed to fetch',
      };

      const parsed = parseApiError(networkError);
      expect(parsed.status).toBe('FETCH_ERROR');
      expect(parsed.message).toContain('Unable to connect to the server');
    });

    it('20. GIVEN standard HTTP status codes without message, THEN fallbacks are descriptive', () => {
      expect(parseApiError({ status: 401 }).message).toBe(
        'You must be signed in to perform this action.'
      );
      expect(parseApiError({ status: 404 }).message).toBe(
        'The requested resource was not found.'
      );
      expect(parseApiError({ status: 409 }).message).toBe(
        'A conflict occurred. The resource may have been modified by another action.'
      );
    });
  });

  describe('6. Selectors Verification', () => {
    it('21. GIVEN full state, THEN typed selectors return correct slices', () => {
      const mockRootState: RootState = {
        ui: {
          sidebarOpen: false,
          detailsPanelOpen: true,
          validationPanelOpen: false,
          aiPanelOpen: false,
          activeModal: 'TEST_MODAL',
          theme: 'dark',
        },
        editor: {
          activeProjectId: 'proj_999',
          selectedNodeId: 'node_xyz',
          selectedEdgeId: null,
          readOnly: false,
          persistenceStatus: 'idle',
          lastSavedAt: null,
          lastSaveError: null,
          currentVersion: 1,
          hasVersionConflict: false,
        },
        collaboration: appStore.getState().collaboration,
        api: appStore.getState().api,
      };

      expect(selectSidebarOpen(mockRootState)).toBe(false);
      expect(selectDetailsPanelOpen(mockRootState)).toBe(true);
      expect(selectActiveModal(mockRootState)).toBe('TEST_MODAL');
      expect(selectActiveProjectId(mockRootState)).toBe('proj_999');
      expect(selectSelectedNodeId(mockRootState)).toBe('node_xyz');
      expect(selectSelectedEdgeId(mockRootState)).toBeNull();
      expect(selectIsReadOnly(mockRootState)).toBe(false);
    });
  });
});
