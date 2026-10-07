import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export type PersistenceStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export interface EditorState {
  activeProjectId: string | null;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  readOnly: boolean;
  persistenceStatus: PersistenceStatus;
  lastSavedAt: string | null;
  lastSaveError: string | null;
  currentVersion: number;
  hasVersionConflict: boolean;
}

const initialState: EditorState = {
  activeProjectId: null,
  selectedNodeId: null,
  selectedEdgeId: null,
  readOnly: false,
  persistenceStatus: 'idle',
  lastSavedAt: null,
  lastSaveError: null,
  currentVersion: 1,
  hasVersionConflict: false,
};

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setActiveProjectId: (state, action: PayloadAction<string | null>) => {
      // When switching project context, reset project-scoped selections and persistence
      if (state.activeProjectId !== action.payload) {
        state.activeProjectId = action.payload;
        state.selectedNodeId = null;
        state.selectedEdgeId = null;
        state.persistenceStatus = 'idle';
        state.lastSavedAt = null;
        state.lastSaveError = null;
        state.currentVersion = 1;
        state.hasVersionConflict = false;
      }
    },
    setSelectedNodeId: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
      if (action.payload) {
        state.selectedEdgeId = null;
      }
    },
    setSelectedEdgeId: (state, action: PayloadAction<string | null>) => {
      state.selectedEdgeId = action.payload;
      if (action.payload) {
        state.selectedNodeId = null;
      }
    },
    clearSelection: (state) => {
      state.selectedNodeId = null;
      state.selectedEdgeId = null;
    },
    setReadOnly: (state, action: PayloadAction<boolean>) => {
      state.readOnly = action.payload;
    },
    setPersistenceStatus: (state, action: PayloadAction<PersistenceStatus>) => {
      state.persistenceStatus = action.payload;
    },
    setPersistenceDirty: (state) => {
      // If currently saving, dirty flag can be maintained after save
      state.persistenceStatus = 'dirty';
    },
    setPersistenceSuccess: (
      state,
      action: PayloadAction<{ version: number; savedAt?: string }>
    ) => {
      state.persistenceStatus = 'saved';
      state.currentVersion = action.payload.version;
      state.lastSavedAt = action.payload.savedAt || new Date().toISOString();
      state.lastSaveError = null;
      state.hasVersionConflict = false;
    },
    setPersistenceError: (
      state,
      action: PayloadAction<{ message: string; isConflict?: boolean }>
    ) => {
      state.persistenceStatus = 'error';
      state.lastSaveError = action.payload.message;
      state.hasVersionConflict = Boolean(action.payload.isConflict);
    },
    setCurrentVersion: (state, action: PayloadAction<number>) => {
      state.currentVersion = action.payload;
    },
    resetEditorState: () => initialState,
  },
});

export const {
  setActiveProjectId,
  setSelectedNodeId,
  setSelectedEdgeId,
  clearSelection,
  setReadOnly,
  setPersistenceStatus,
  setPersistenceDirty,
  setPersistenceSuccess,
  setPersistenceError,
  setCurrentVersion,
  resetEditorState,
} = editorSlice.actions;

// Typed Selectors
export const selectActiveProjectId = (state: RootState) => state.editor.activeProjectId;
export const selectSelectedNodeId = (state: RootState) => state.editor.selectedNodeId;
export const selectSelectedEdgeId = (state: RootState) => state.editor.selectedEdgeId;
export const selectIsReadOnly = (state: RootState) => state.editor.readOnly;
export const selectPersistenceStatus = (state: RootState) => state.editor.persistenceStatus;
export const selectLastSavedAt = (state: RootState) => state.editor.lastSavedAt;
export const selectLastSaveError = (state: RootState) => state.editor.lastSaveError;
export const selectCurrentVersion = (state: RootState) => state.editor.currentVersion;
export const selectHasVersionConflict = (state: RootState) => state.editor.hasVersionConflict;
export const selectIsDirty = (state: RootState) => state.editor.persistenceStatus === 'dirty';
export const selectIsSaving = (state: RootState) => state.editor.persistenceStatus === 'saving';

export default editorSlice.reducer;
