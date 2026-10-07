import { useGetMeQuery, useLogoutMutation } from '../store/api/authApi';
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
 * Derives state strictly from server session without storing JWT in client state
 */
export function useAuth(): UseAuthReturn {
  const { data, isLoading, isError, error } = useGetMeQuery();
  const [logoutMutation] = useLogoutMutation();

  const user = data && data.success ? data.data.user : undefined;
  const isAuthenticated = Boolean(user);
  const isUnauthenticated = !isLoading && (isError || !user);

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (err) {
      console.error('Logout error:', err);
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
