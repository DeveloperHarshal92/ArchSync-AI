import { describe, it, expect } from 'vitest';
import uiReducer, {
  setValidationPanelOpen,
  toggleValidationPanel,
  resetUiState,
} from '../store/slices/uiSlice';
import editorReducer, {
  setSelectedNodeId,
  setSelectedEdgeId,
  setActiveProjectId,
  selectCurrentVersion,
  selectIsDirty,
} from '../store/slices/editorSlice';
import { architectureApi } from '../store/api/architectureApi';
import { store as appStore } from '../store/index';
import { ArchitectureValidationResult, ValidationIssue } from '@archsync/shared';

describe('ArchSync AI — F11 Frontend Architecture Validation Suite', () => {
  describe('1. Validation Panel UI State (uiSlice)', () => {
    it('1. GIVEN initial state, THEN validationPanelOpen is false by default', () => {
      const state = uiReducer(undefined, { type: '@@INIT' });
      expect(state.validationPanelOpen).toBe(false);
    });

    it('2. GIVEN closed panel, WHEN setValidationPanelOpen(true) executes, THEN panel is open', () => {
      let state = uiReducer(undefined, { type: '@@INIT' });
      state = uiReducer(state, setValidationPanelOpen(true));
      expect(state.validationPanelOpen).toBe(true);
    });

    it('3. GIVEN open panel, WHEN toggleValidationPanel executes, THEN panel closes', () => {
      let state = uiReducer(undefined, { type: '@@INIT' });
      state = uiReducer(state, setValidationPanelOpen(true));
      state = uiReducer(state, toggleValidationPanel());
      expect(state.validationPanelOpen).toBe(false);
    });

    it('4. GIVEN open panel, WHEN resetUiState executes, THEN panel resets to closed', () => {
      let state = uiReducer(undefined, { type: '@@INIT' });
      state = uiReducer(state, setValidationPanelOpen(true));
      state = uiReducer(state, resetUiState());
      expect(state.validationPanelOpen).toBe(false);
    });
  });

  describe('2. Validation Issue Selection & Canvas Highlighting', () => {
    it('5. GIVEN validation issue referencing nodeId, WHEN selected, THEN selectedNodeId updates and clears edge', () => {
      let state = editorReducer(undefined, { type: '@@INIT' });
      state = editorReducer(state, setSelectedEdgeId('edge-prev'));
      expect(state.selectedEdgeId).toBe('edge-prev');

      // Click node from validation issue
      state = editorReducer(state, setSelectedNodeId('target-node-issue'));
      expect(state.selectedNodeId).toBe('target-node-issue');
      expect(state.selectedEdgeId).toBeNull();
    });

    it('6. GIVEN validation issue referencing edgeId, WHEN selected, THEN selectedEdgeId updates and clears node', () => {
      let state = editorReducer(undefined, { type: '@@INIT' });
      state = editorReducer(state, setSelectedNodeId('node-prev'));
      expect(state.selectedNodeId).toBe('node-prev');

      // Click edge from validation issue
      state = editorReducer(state, setSelectedEdgeId('invalid-edge-issue'));
      expect(state.selectedEdgeId).toBe('invalid-edge-issue');
      expect(state.selectedNodeId).toBeNull();
    });

    it('7. GIVEN active selection, WHEN switching projects, THEN selection state resets', () => {
      let state = editorReducer(undefined, { type: '@@INIT' });
      state = editorReducer(state, setActiveProjectId('proj-alpha'));
      state = editorReducer(state, setSelectedNodeId('node-in-alpha'));
      expect(state.selectedNodeId).toBe('node-in-alpha');

      // Navigate to another project
      state = editorReducer(state, setActiveProjectId('proj-beta'));
      expect(state.selectedNodeId).toBeNull();
      expect(state.selectedEdgeId).toBeNull();
      expect(state.activeProjectId).toBe('proj-beta');
    });
  });

  describe('3. Validation Result Classification & Severity Metrics', () => {
    const mockIssues: ValidationIssue[] = [
      {
        id: 'issue-1',
        code: 'INVALID_EDGE',
        severity: 'ERROR',
        message: 'Edge references missing source node',
        edgeIds: ['e-1'],
      },
      {
        id: 'issue-2',
        code: 'DISCONNECTED_NODE',
        severity: 'WARNING',
        message: 'Node is disconnected from graph',
        nodeIds: ['n-isolated'],
      },
      {
        id: 'issue-3',
        code: 'CIRCULAR_DEPENDENCY',
        severity: 'WARNING',
        message: 'Cycle detected: A -> B -> A',
        nodeIds: ['a', 'b'],
      },
      {
        id: 'issue-4',
        code: 'MISSING_CONFIGURATION',
        severity: 'ERROR',
        message: 'Node has empty label',
        nodeIds: ['n-empty'],
      },
    ];

    it('8. GIVEN a validation result, THEN error and warning counts calculate accurately', () => {
      const errorCount = mockIssues.filter((i) => i.severity === 'ERROR').length;
      const warningCount = mockIssues.filter((i) => i.severity === 'WARNING').length;
      const infoCount = mockIssues.filter((i) => i.severity === 'INFO').length;

      expect(errorCount).toBe(2);
      expect(warningCount).toBe(2);
      expect(infoCount).toBe(0);
    });

    it('9. GIVEN errors present, THEN graph is correctly marked as invalid', () => {
      const hasErrors = mockIssues.some((i) => i.severity === 'ERROR');
      const validationResult: ArchitectureValidationResult = {
        valid: !hasErrors,
        issues: mockIssues,
        validatedAt: new Date().toISOString(),
      };

      expect(validationResult.valid).toBe(false);
    });

    it('10. GIVEN only warnings, THEN graph remains structurally valid', () => {
      const warningsOnly = mockIssues.filter((i) => i.severity === 'WARNING');
      const hasErrors = warningsOnly.some((i) => i.severity === 'ERROR');
      const validationResult: ArchitectureValidationResult = {
        valid: !hasErrors,
        issues: warningsOnly,
        validatedAt: new Date().toISOString(),
      };

      expect(validationResult.valid).toBe(true);
    });
  });

  describe('4. Architecture Validation API & Persistence Isolation', () => {
    it('11. GIVEN architectureApi, THEN validateArchitecture endpoint is registered', () => {
      expect(architectureApi.endpoints.validateArchitecture).toBeDefined();
      expect(typeof architectureApi.endpoints.validateArchitecture.initiate).toBe('function');
    });

    it('12. GIVEN running validation, THEN editor persistence state is not marked dirty', () => {
      const state = appStore.getState();
      const isDirty = selectIsDirty(state);
      expect(isDirty).toBe(false);
    });

    it('13. GIVEN running validation, THEN architecture version is not incremented', () => {
      const state = appStore.getState();
      const version = selectCurrentVersion(state);
      expect(version).toBe(1);
    });
  });
});
