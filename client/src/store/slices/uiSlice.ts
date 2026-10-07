import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface UiState {
  sidebarOpen: boolean;
  detailsPanelOpen: boolean;
  validationPanelOpen: boolean;
  aiPanelOpen: boolean;
  activeModal: string | null;
  theme: 'dark' | 'light';
}

const initialState: UiState = {
  sidebarOpen: true,
  detailsPanelOpen: true,
  validationPanelOpen: false,
  aiPanelOpen: false,
  activeModal: null,
  theme: 'dark',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleDetailsPanel: (state) => {
      state.detailsPanelOpen = !state.detailsPanelOpen;
    },
    setDetailsPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.detailsPanelOpen = action.payload;
    },
    toggleValidationPanel: (state) => {
      state.validationPanelOpen = !state.validationPanelOpen;
    },
    setValidationPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.validationPanelOpen = action.payload;
    },
    toggleAiPanel: (state) => {
      state.aiPanelOpen = !state.aiPanelOpen;
    },
    setAiPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.aiPanelOpen = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
    },
    resetUiState: () => initialState,
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleDetailsPanel,
  setDetailsPanelOpen,
  toggleValidationPanel,
  setValidationPanelOpen,
  toggleAiPanel,
  setAiPanelOpen,
  openModal,
  closeModal,
  setTheme,
  resetUiState,
} = uiSlice.actions;

// Typed Selectors
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectDetailsPanelOpen = (state: RootState) => state.ui.detailsPanelOpen;
export const selectValidationPanelOpen = (state: RootState) => state.ui.validationPanelOpen;
export const selectAiPanelOpen = (state: RootState) => state.ui.aiPanelOpen;
export const selectActiveModal = (state: RootState) => state.ui.activeModal;
export const selectTheme = (state: RootState) => state.ui.theme;

export default uiSlice.reducer;


