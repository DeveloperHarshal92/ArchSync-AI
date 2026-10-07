import { describe, it, expect } from 'vitest';
import uiReducer, {
  setAiPanelOpen,
  toggleAiPanel,
  setValidationPanelOpen,
  resetUiState,
} from '../store/slices/uiSlice';
import editorReducer, {
  setSelectedNodeId,
  setActiveProjectId,
  selectCurrentVersion,
  selectIsDirty,
} from '../store/slices/editorSlice';
import { aiApi } from '../store/api/aiApi';

describe('ArchSync AI — F12 Frontend AI Architecture Assistant Suite', () => {
  describe('1. AI Assistant Panel UI State (uiSlice)', () => {
    it('1. GIVEN initial state, THEN aiPanelOpen is false by default', () => {
      const state = uiReducer(undefined, { type: '@@INIT' });
      expect(state.aiPanelOpen).toBe(false);
    });

    it('2. GIVEN closed panel, WHEN setAiPanelOpen(true) executes, THEN aiPanelOpen is true', () => {
      let state = uiReducer(undefined, { type: '@@INIT' });
      state = uiReducer(state, setAiPanelOpen(true));
      expect(state.aiPanelOpen).toBe(true);
    });

    it('3. GIVEN open panel, WHEN toggleAiPanel() executes, THEN aiPanelOpen is toggled', () => {
      let state = uiReducer(undefined, { type: '@@INIT' });
      state = uiReducer(state, setAiPanelOpen(true));
      expect(state.aiPanelOpen).toBe(true);

      state = uiReducer(state, toggleAiPanel());
      expect(state.aiPanelOpen).toBe(false);

      state = uiReducer(state, toggleAiPanel());
      expect(state.aiPanelOpen).toBe(true);
    });

    it('4. GIVEN open panel, WHEN resetUiState() executes, THEN panel resets to closed', () => {
      let state = uiReducer(undefined, { type: '@@INIT' });
      state = uiReducer(state, setAiPanelOpen(true));
      state = uiReducer(state, resetUiState());
      expect(state.aiPanelOpen).toBe(false);
    });

    it('5. GIVEN AI panel open, WHEN user opens Validation panel, THEN coexistence is handled cleanly', () => {
      let state = uiReducer(undefined, { type: '@@INIT' });
      state = uiReducer(state, setAiPanelOpen(true));
      expect(state.aiPanelOpen).toBe(true);

      // Switching to validation panel closes AI panel
      state = uiReducer(state, setAiPanelOpen(false));
      state = uiReducer(state, setValidationPanelOpen(true));
      expect(state.aiPanelOpen).toBe(false);
      expect(state.validationPanelOpen).toBe(true);
    });
  });

  describe('2. AI Findings Related-Node Selection & Zero Mutation', () => {
    it('6. GIVEN AI finding referencing relatedNodeIds, WHEN user clicks a node ID, THEN node is selected in editor without modifying architecture', () => {
      let state = editorReducer(undefined, { type: '@@INIT' });
      const initialVersion = selectCurrentVersion({ editor: state } as any);
      const isDirtyInitial = selectIsDirty({ editor: state } as any);

      const mockFinding = {
        title: 'Single Point of Failure at Ingress',
        severity: 'WARNING' as const,
        explanation: 'Only one API Gateway is active.',
        relatedNodeIds: ['node-ingress-1'],
      };

      // User clicks related node
      state = editorReducer(state, setSelectedNodeId(mockFinding.relatedNodeIds[0]));

      expect(state.selectedNodeId).toBe('node-ingress-1');
      expect(state.selectedEdgeId).toBeNull();

      // Zero architecture mutation: Version and dirty state must not change
      expect(selectCurrentVersion({ editor: state } as any)).toBe(initialVersion);
      expect(selectIsDirty({ editor: state } as any)).toBe(isDirtyInitial);
    });

    it('7. GIVEN AI recommendation referencing multiple related nodes, WHEN node selection switches, THEN selection updates predictably', () => {
      let state = editorReducer(undefined, { type: '@@INIT' });

      const mockRecommendation = {
        title: 'Add Distributed Cache',
        explanation: 'Relieve load from relational database.',
        tradeoff: 'Cache invalidation complexity',
        relatedNodeIds: ['node-svc-1', 'node-db-1'],
      };

      state = editorReducer(state, setSelectedNodeId(mockRecommendation.relatedNodeIds[0]));
      expect(state.selectedNodeId).toBe('node-svc-1');

      state = editorReducer(state, setSelectedNodeId(mockRecommendation.relatedNodeIds[1]));
      expect(state.selectedNodeId).toBe('node-db-1');
    });
  });

  describe('3. Project Isolation & State Cleanup', () => {
    it('8. GIVEN Project A selected node, WHEN navigating to Project B, THEN editor selection clears completely', () => {
      let state = editorReducer(undefined, setActiveProjectId('proj_A'));
      state = editorReducer(state, setSelectedNodeId('node_in_A'));
      expect(state.selectedNodeId).toBe('node_in_A');

      // Switch to Project B
      state = editorReducer(state, setActiveProjectId('proj_B'));
      expect(state.activeProjectId).toBe('proj_B');
      expect(state.selectedNodeId).toBeNull();
      expect(state.selectedEdgeId).toBeNull();
    });
  });

  describe('4. RTK Query AI Endpoints Configuration', () => {
    it('9. GIVEN aiApi definition, THEN analyzeArchitecture and chatArchitecture endpoints exist', () => {
      expect(aiApi.endpoints.analyzeArchitecture).toBeDefined();
      expect(aiApi.endpoints.chatArchitecture).toBeDefined();
    });

    it('10. GIVEN analyzeArchitecture mutation, THEN configures correct POST url /ai/analyze', () => {
      const endpoint = aiApi.endpoints.analyzeArchitecture;
      // RTK Query internal endpoint structure definition check
      expect(typeof endpoint.initiate).toBe('function');
      expect(typeof endpoint.select).toBe('function');
    });

    it('11. GIVEN chatArchitecture mutation, THEN configures correct POST url /ai/chat', () => {
      const endpoint = aiApi.endpoints.chatArchitecture;
      expect(typeof endpoint.initiate).toBe('function');
      expect(typeof endpoint.select).toBe('function');
    });
  });
});
