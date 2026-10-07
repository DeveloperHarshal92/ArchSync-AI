import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  SocketConnectionState,
  CollaboratorPresence,
  CollaboratorCursor,
  SocketErrorPayload,
} from '@archsync/shared';
import type { RootState } from '../index';

export interface CollaborationState {
  connectionState: SocketConnectionState;
  collaborators: CollaboratorPresence[];
  remoteCursors: Record<string, CollaboratorCursor>;
  error: SocketErrorPayload | null;
}

const initialState: CollaborationState = {
  connectionState: 'disconnected',
  collaborators: [],
  remoteCursors: {},
  error: null,
};

export const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    setConnectionState: (state, action: PayloadAction<SocketConnectionState>) => {
      state.connectionState = action.payload;
      if (action.payload === 'disconnected') {
        state.remoteCursors = {};
      }
    },
    setCollaborators: (state, action: PayloadAction<CollaboratorPresence[]>) => {
      state.collaborators = action.payload;
    },
    addOrUpdateCollaborator: (state, action: PayloadAction<CollaboratorPresence>) => {
      const idx = state.collaborators.findIndex((c) => c.userId === action.payload.userId);
      if (idx >= 0) {
        state.collaborators[idx] = {
          ...state.collaborators[idx],
          ...action.payload,
        };
      } else {
        state.collaborators.push(action.payload);
      }
    },
    removeCollaboratorByUserId: (state, action: PayloadAction<string>) => {
      state.collaborators = state.collaborators.filter((c) => c.userId !== action.payload);
      delete state.remoteCursors[action.payload];
    },
    updateCollaboratorSelectionState: (
      state,
      action: PayloadAction<{ userId: string; selectedNodeId?: string | null }>
    ) => {
      const collaborator = state.collaborators.find((c) => c.userId === action.payload.userId);
      if (collaborator) {
        collaborator.selectedNodeId = action.payload.selectedNodeId;
      }
    },
    updateRemoteCursorState: (
      state,
      action: PayloadAction<{ userId: string; cursor: CollaboratorCursor }>
    ) => {
      state.remoteCursors[action.payload.userId] = action.payload.cursor;
      const collaborator = state.collaborators.find((c) => c.userId === action.payload.userId);
      if (collaborator) {
        collaborator.cursor = action.payload.cursor;
      }
    },
    setCollaborationError: (state, action: PayloadAction<SocketErrorPayload | null>) => {
      state.error = action.payload;
    },
    resetCollaborationState: () => initialState,
  },
});

export const {
  setConnectionState,
  setCollaborators,
  addOrUpdateCollaborator,
  removeCollaboratorByUserId,
  updateCollaboratorSelectionState,
  updateRemoteCursorState,
  setCollaborationError,
  resetCollaborationState,
} = collaborationSlice.actions;

// Selectors
export const selectSocketConnectionState = (state: RootState) =>
  state.collaboration.connectionState;
export const selectCollaborators = (state: RootState) =>
  state.collaboration.collaborators;
export const selectRemoteCursors = (state: RootState) =>
  state.collaboration.remoteCursors;
export const selectCollaborationError = (state: RootState) =>
  state.collaboration.error;

export default collaborationSlice.reducer;
