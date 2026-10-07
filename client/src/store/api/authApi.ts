import { ApiResponse, UserSafe, RegisterRequest, LoginRequest } from '@archsync/shared';
import { baseApi } from './baseApi';

/**
 * Authentication API endpoints matching RULES.md Section 5 & 6
 * All requests include credentials automatically via baseApi configuration
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<ApiResponse<{ user: UserSafe }>, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    register: builder.mutation<ApiResponse<{ user: UserSafe }>, RegisterRequest>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    login: builder.mutation<ApiResponse<{ user: UserSafe }>, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation<ApiResponse<{ message: string }>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetMeQuery,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
} = authApi;
