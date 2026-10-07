import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface UiState {
  sidebarOpen: boolean;
  detailsPanelOpen: boolean;
  activeModal: string | null;
  theme: 'dark' | 'light';
}

const initialState: UiState = {
  sidebarOpen: true,
  detailsPanelOpen: true,
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
  openModal,
  closeModal,
  setTheme,
  resetUiState,
} = uiSlice.actions;

// Typed Selectors
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectDetailsPanelOpen = (state: RootState) => state.ui.detailsPanelOpen;
export const selectActiveModal = (state: RootState) => state.ui.activeModal;
export const selectTheme = (state: RootState) => state.ui.theme;

export default uiSlice.reducer;
