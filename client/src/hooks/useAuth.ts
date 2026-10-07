import { useGetMeQuery, useLogoutMutation } from '../store/api/authApi';
import { baseApi } from '../store/api/baseApi';
import { resetEditorState } from '../store/slices/editorSlice';
import { resetUiState } from '../store/slices/uiSlice';
import { resetCollaborationState } from '../store/slices/collaborationSlice';
import { disconnectSocket } from '../lib/socket/socketClient';
import { useAppDispatch } from '../store/hooks';
import { UserSafe } from '@archsync/shared';

export interface UseAuthReturn {
  user: UserSafe | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  isUnauthenticated: boolean;
  error: unknown;
  logout: () => Promise<void>;
}

/**
 * Custom hook providing reactive authentication state
 * Derives state strictly from RTK Query server session without storing JWT in client state.
 * On logout, guarantees full reset of private API caches, socket connections, and UI/editor state.
 */
export function useAuth(): UseAuthReturn {
  const { data, isLoading, isError, error } = useGetMeQuery();
  const [logoutMutation] = useLogoutMutation();
  const dispatch = useAppDispatch();

  const user = data && data.success ? data.data.user : undefined;
  const isAuthenticated = Boolean(user);
  const isUnauthenticated = !isLoading && (isError || !user);

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Disconnect socket and clear all private caches and project-scoped state upon logout
      disconnectSocket();
      dispatch(baseApi.util.resetApiState());
      dispatch(resetEditorState());
      dispatch(resetUiState());
      dispatch(resetCollaborationState());
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    isUnauthenticated,
    error,
    logout,
  };
}
