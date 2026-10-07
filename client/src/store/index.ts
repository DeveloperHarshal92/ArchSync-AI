import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import uiReducer from './slices/uiSlice';
import editorReducer from './slices/editorSlice';
import collaborationReducer from './slices/collaborationSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    editor: editorReducer,
    collaboration: collaborationReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
