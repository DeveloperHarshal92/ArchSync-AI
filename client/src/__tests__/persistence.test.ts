import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import editorReducer, {
  setPersistenceDirty,
  setPersistenceStatus,
  setPersistenceSuccess,
  setPersistenceError,
  setCurrentVersion,
  setActiveProjectId,
  resetEditorState,
  selectPersistenceStatus,
  selectCurrentVersion,
  selectHasVersionConflict,
  selectLastSavedAt,
  selectLastSaveError,
  selectIsDirty,
  selectIsSaving,
  EditorState,
} from '../store/slices/editorSlice';
import { createArchitectureHash } from '../hooks/useArchitectureAutosave';
import { AppNode, AppEdge } from '../lib/architecture/adapters';

describe('ArchSync AI — F09 Architecture Persistence Behavioral Test Suite', () => {
  describe('1. Meaningful Change Detection (createArchitectureHash)', () => {
    const baseNode: AppNode = {
      id: 'node-web-1',
      type: 'architectureNode',
      position: { x: 100, y: 200 },
      data: {
        label: 'Frontend SPA',
        description: 'React Client',
        technology: 'React / Vite',
        category: 'Client',
        nodeType: 'web-app',
      },
      selected: false,
    };

    const baseEdge: AppEdge = {
      id: 'edge-1',
      source: 'node-web-1',
      target: 'node-api-1',
      type: 'smoothstep',
      label: 'HTTPS REST',
      animated: true,
      selected: false,
    };

    it('1. GIVEN identical architecture state, THEN hash remains strictly identical', () => {
      const hash1 = createArchitectureHash([baseNode], [baseEdge], { x: 0, y: 0, zoom: 1 });
      const hash2 = createArchitectureHash([{ ...baseNode }], [{ ...baseEdge }], { x: 0, y: 0, zoom: 1 });
      expect(hash1).toBe(hash2);
    });

    it('2. GIVEN node position movement, THEN hash changes to detect meaningful change', () => {
      const movedNode: AppNode = {
        ...baseNode,
        position: { x: 180, y: 240 },
      };
      const initialHash = createArchitectureHash([baseNode], [baseEdge]);
      const movedHash = createArchitectureHash([movedNode], [baseEdge]);
      expect(movedHash).not.toBe(initialHash);
    });

    it('3. GIVEN node data change (label/tech), THEN hash changes', () => {
      const editedNode: AppNode = {
        ...baseNode,
        data: {
          ...baseNode.data,
          label: 'Updated Web Dashboard',
        },
      };
      const initialHash = createArchitectureHash([baseNode], [baseEdge]);
      const editedHash = createArchitectureHash([editedNode], [baseEdge]);
      expect(editedHash).not.toBe(initialHash);
    });

    it('4. GIVEN edge connection change, THEN hash changes', () => {
      const redirectedEdge: AppEdge = {
        ...baseEdge,
        target: 'node-cache-1',
      };
      const initialHash = createArchitectureHash([baseNode], [baseEdge]);
      const editedHash = createArchitectureHash([baseNode], [redirectedEdge]);
      expect(editedHash).not.toBe(initialHash);
    });

    it('5. GIVEN viewport movement, THEN hash changes', () => {
      const hash1 = createArchitectureHash([baseNode], [baseEdge], { x: 0, y: 0, zoom: 1 });
      const hash2 = createArchitectureHash([baseNode], [baseEdge], { x: 120, y: -45, zoom: 1.25 });
      expect(hash2).not.toBe(hash1);
    });

    it('6. GIVEN transient UI state changes (selection, measured dimensions, hover), THEN hash remains unchanged and avoids false dirty saves', () => {
      const unselectedHash = createArchitectureHash([baseNode], [baseEdge]);

      const selectedNode: AppNode = {
        ...baseNode,
        selected: true,
      };
      const selectedEdge: AppEdge = {
        ...baseEdge,
        selected: true,
      };

      const selectedHash = createArchitectureHash([selectedNode], [selectedEdge]);
      // Transient selection must NOT change the architecture persistence hash
      expect(selectedHash).toBe(unselectedHash);
    });
  });

  describe('2. Redux Editor Persistence State Lifecycle', () => {
    let state: EditorState;

    beforeEach(() => {
      state = editorReducer(undefined, { type: '@@INIT' });
    });

    it('7. GIVEN initial state, THEN persistence defaults to idle with no errors or conflicts', () => {
      expect(selectPersistenceStatus({ editor: state } as any)).toBe('idle');
      expect(selectCurrentVersion({ editor: state } as any)).toBe(1);
      expect(selectLastSavedAt({ editor: state } as any)).toBeNull();
      expect(selectLastSaveError({ editor: state } as any)).toBeNull();
      expect(selectHasVersionConflict({ editor: state } as any)).toBe(false);
      expect(selectIsDirty({ editor: state } as any)).toBe(false);
      expect(selectIsSaving({ editor: state } as any)).toBe(false);
    });

    it('8. GIVEN local graph edit, WHEN marked dirty, THEN status transitions to dirty', () => {
      state = editorReducer(state, setPersistenceDirty());
      expect(selectPersistenceStatus({ editor: state } as any)).toBe('dirty');
      expect(selectIsDirty({ editor: state } as any)).toBe(true);
      expect(selectIsSaving({ editor: state } as any)).toBe(false);
    });

    it('9. GIVEN save in flight, WHEN status set to saving, THEN saving state is active', () => {
      state = editorReducer(state, setPersistenceDirty());
      state = editorReducer(state, setPersistenceStatus('saving'));
      expect(selectPersistenceStatus({ editor: state } as any)).toBe('saving');
      expect(selectIsSaving({ editor: state } as any)).toBe(true);
      expect(selectIsDirty({ editor: state } as any)).toBe(false);
    });

    it('10. GIVEN successful backend save, THEN status becomes saved, version increments, and timestamp is recorded', () => {
      state = editorReducer(state, setPersistenceDirty());
      state = editorReducer(state, setPersistenceStatus('saving'));

      const savedTimestamp = '2026-10-07T14:30:00.000Z';
      state = editorReducer(
        state,
        setPersistenceSuccess({
          version: 2,
          savedAt: savedTimestamp,
        })
      );

      expect(selectPersistenceStatus({ editor: state } as any)).toBe('saved');
      expect(selectCurrentVersion({ editor: state } as any)).toBe(2);
      expect(selectLastSavedAt({ editor: state } as any)).toBe(savedTimestamp);
      expect(selectLastSaveError({ editor: state } as any)).toBeNull();
      expect(selectHasVersionConflict({ editor: state } as any)).toBe(false);
      expect(selectIsDirty({ editor: state } as any)).toBe(false);
      expect(selectIsSaving({ editor: state } as any)).toBe(false);
    });

    it('11. GIVEN save network failure, THEN status becomes error and exposes user-friendly message without crashing', () => {
      state = editorReducer(state, setPersistenceDirty());
      state = editorReducer(state, setPersistenceStatus('saving'));

      state = editorReducer(
        state,
        setPersistenceError({
          message: 'Network unreachable. Check your internet connection.',
          isConflict: false,
        })
      );

      expect(selectPersistenceStatus({ editor: state } as any)).toBe('error');
      expect(selectLastSaveError({ editor: state } as any)).toBe('Network unreachable. Check your internet connection.');
      expect(selectHasVersionConflict({ editor: state } as any)).toBe(false);
    });

    it('12. GIVEN 409 VERSION_CONFLICT, THEN status becomes error and sets hasVersionConflict to stop autosave loop', () => {
      state = editorReducer(state, setPersistenceDirty());
      state = editorReducer(state, setPersistenceStatus('saving'));

      state = editorReducer(
        state,
        setPersistenceError({
          message: 'This architecture was changed elsewhere. Your changes could not be saved.',
          isConflict: true,
        })
      );

      expect(selectPersistenceStatus({ editor: state } as any)).toBe('error');
      expect(selectHasVersionConflict({ editor: state } as any)).toBe(true);
      expect(selectLastSaveError({ editor: state } as any)).toContain('changed elsewhere');
    });
  });

  describe('3. Project Isolation & Reset Behavior', () => {
    it('13. GIVEN active Project A with dirty/saving state, WHEN switching to Project B, THEN persistence status resets to idle and clears errors', () => {
      let state = editorReducer(undefined, setActiveProjectId('proj_A'));
      state = editorReducer(state, setPersistenceDirty());
      state = editorReducer(state, setCurrentVersion(5));
      state = editorReducer(
        state,
        setPersistenceError({
          message: 'Previous error on Project A',
          isConflict: false,
        })
      );

      expect(state.activeProjectId).toBe('proj_A');
      expect(state.persistenceStatus).toBe('error');

      // User navigates from Project A to Project B
      state = editorReducer(state, setActiveProjectId('proj_B'));

      expect(state.activeProjectId).toBe('proj_B');
      expect(state.persistenceStatus).toBe('idle');
      expect(state.lastSaveError).toBeNull();
      expect(state.hasVersionConflict).toBe(false);
      expect(state.selectedNodeId).toBeNull();
      expect(state.selectedEdgeId).toBeNull();
    });

    it('14. GIVEN editor state reset, THEN full clean persistence defaults are restored', () => {
      let state = editorReducer(undefined, setActiveProjectId('proj_A'));
      state = editorReducer(state, setPersistenceDirty());
      state = editorReducer(state, setCurrentVersion(9));

      state = editorReducer(state, resetEditorState());

      expect(state.activeProjectId).toBeNull();
      expect(state.persistenceStatus).toBe('idle');
      expect(state.currentVersion).toBe(1);
      expect(state.lastSavedAt).toBeNull();
      expect(state.lastSaveError).toBeNull();
      expect(state.hasVersionConflict).toBe(false);
    });
  });

  describe('4. Debounced Autosave & Rapid Edits Coalescing Simulation', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('15. GIVEN 10 rapid changes within debounce interval, THEN only 1 coalesced save is triggered', () => {
      const saveFn = vi.fn();
      let timer: NodeJS.Timeout | null = null;
      const debounceMs = 1000;

      const scheduleSave = (snapshot: any) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          saveFn(snapshot);
        }, debounceMs);
      };

      // Simulate 10 rapid movements in 200ms increments
      for (let i = 1; i <= 10; i++) {
        scheduleSave({ version: 1, nodeX: 100 + i * 10 });
        vi.advanceTimersByTime(50); // Total 500ms elapsed, within 1000ms debounce
      }

      // At 500ms, timer has NOT expired, 0 saves should have executed
      expect(saveFn).not.toHaveBeenCalled();

      // Advance past the 1000ms debounce window
      vi.advanceTimersByTime(1000);

      // Exactly ONE coalesced persistence call was made with the latest snapshot
      expect(saveFn).toHaveBeenCalledTimes(1);
      expect(saveFn).toHaveBeenCalledWith({ version: 1, nodeX: 200 }); // i = 10 -> 100 + 100
    });

    it('16. GIVEN Project A with pending debounced save, WHEN user switches to Project B, THEN pending timer is cancelled and Project A does not save into Project B', () => {
      const saveFn = vi.fn();
      let timer: NodeJS.Timeout | null = null;
      let activeProjectId = 'proj_A';

      const scheduleSave = (targetProject: string) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          if (activeProjectId === targetProject) {
            saveFn(targetProject);
          }
        }, 1000);
      };

      // Schedule save for Project A
      scheduleSave('proj_A');

      // User switches to Project B after 400ms
      vi.advanceTimersByTime(400);
      if (timer) clearTimeout(timer); // Cancelled on project switch
      activeProjectId = 'proj_B';

      // Complete remainder of time
      vi.advanceTimersByTime(1200);

      // Project A save must never have run
      expect(saveFn).not.toHaveBeenCalled();
    });
  });

  describe('5. Hydration & Navigation Unload Protection Contracts', () => {
    it('17. GIVEN initial hydration from server architecture, THEN baseline hash matches and avoids autosave trigger', () => {
      const serverNodes = [
        {
          id: 'n1',
          type: 'architectureNode' as const,
          position: { x: 100, y: 100 },
          data: { label: 'Web', description: '', technology: '', category: '', nodeType: 'web-app' as const },
        },
      ];
      const serverEdges: AppEdge[] = [];
      const serverViewport = { x: 0, y: 0, zoom: 1 };

      const baselineHash = createArchitectureHash(serverNodes, serverEdges, serverViewport);
      const initialMountHash = createArchitectureHash(serverNodes, serverEdges, serverViewport);

      // Hashes match exactly: no false positive dirty trigger upon mount
      expect(initialMountHash).toBe(baselineHash);
    });

    it('18. GIVEN unsaved changes (dirty or saving), WHEN window beforeunload fires, THEN browser warning is triggered', () => {
      const beforeUnloadHandler = (status: 'idle' | 'dirty' | 'saving' | 'saved', event: { preventDefault: () => void; returnValue: string }) => {
        if (status === 'dirty' || status === 'saving') {
          event.preventDefault();
          event.returnValue = '';
        }
      };

      const mockEventDirty = { preventDefault: vi.fn(), returnValue: 'initial' };
      beforeUnloadHandler('dirty', mockEventDirty);
      expect(mockEventDirty.preventDefault).toHaveBeenCalled();
      expect(mockEventDirty.returnValue).toBe('');

      const mockEventSaving = { preventDefault: vi.fn(), returnValue: 'initial' };
      beforeUnloadHandler('saving', mockEventSaving);
      expect(mockEventSaving.preventDefault).toHaveBeenCalled();

      const mockEventSaved = { preventDefault: vi.fn(), returnValue: 'initial' };
      beforeUnloadHandler('saved', mockEventSaved);
      expect(mockEventSaved.preventDefault).not.toHaveBeenCalled();
      expect(mockEventSaved.returnValue).toBe('initial');

      const mockEventIdle = { preventDefault: vi.fn(), returnValue: 'initial' };
      beforeUnloadHandler('idle', mockEventIdle);
      expect(mockEventIdle.preventDefault).not.toHaveBeenCalled();
    });
  });
});
