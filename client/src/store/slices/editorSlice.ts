import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface EditorState {
  activeProjectId: string | null;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  readOnly: boolean;
}

const initialState: EditorState = {
  activeProjectId: null,
  selectedNodeId: null,
  selectedEdgeId: null,
  readOnly: false,
};

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setActiveProjectId: (state, action: PayloadAction<string | null>) => {
      // When switching project context, reset project-scoped selections to prevent leakage
      if (state.activeProjectId !== action.payload) {
        state.activeProjectId = action.payload;
        state.selectedNodeId = null;
        state.selectedEdgeId = null;
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
    resetEditorState: () => initialState,
  },
});

export const {
  setActiveProjectId,
  setSelectedNodeId,
  setSelectedEdgeId,
  clearSelection,
  setReadOnly,
  resetEditorState,
} = editorSlice.actions;

// Typed Selectors
export const selectActiveProjectId = (state: RootState) => state.editor.activeProjectId;
export const selectSelectedNodeId = (state: RootState) => state.editor.selectedNodeId;
export const selectSelectedEdgeId = (state: RootState) => state.editor.selectedEdgeId;
export const selectIsReadOnly = (state: RootState) => state.editor.readOnly;

export default editorSlice.reducer;
