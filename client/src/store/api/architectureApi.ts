import {
  ApiResponse,
  ArchitectureResponseData,
  ArchitectureValidationResult,
  UpdateArchitectureRequest,
} from '@archsync/shared';
import { baseApi } from './baseApi';

/**
 * Architecture API endpoints matching RULES.md Section 5, F06, F09, and F11 specifications.
 * Uses pessimistic cache update on query fulfillment to avoid redundant GET refetch loops.
 */
export const architectureApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getArchitecture: builder.query<ApiResponse<ArchitectureResponseData>, string>({
      query: (projectId) => `/projects/${projectId}/architecture`,
      providesTags: (_result, _error, projectId) => [
        { type: 'Architecture', id: projectId },
      ],
    }),

    updateArchitecture: builder.mutation<
      ApiResponse<ArchitectureResponseData>,
      { projectId: string; body: UpdateArchitectureRequest }
    >({
      query: ({ projectId, body }) => ({
        url: `/projects/${projectId}/architecture`,
        method: 'PUT',
        body,
      }),
      async onQueryStarted({ projectId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && data.success) {
            // Update cached architecture snapshot with authoritative server response
            dispatch(
              architectureApi.util.updateQueryData('getArchitecture', projectId, (draft) => {
                if (draft && draft.success) {
                  draft.data = data.data;
                }
              })
            );
          }
        } catch {
          // Handled by caller/mutation result
        }
      },
    }),

    validateArchitecture: builder.mutation<
      ApiResponse<ArchitectureValidationResult>,
      { projectId: string; graph?: { nodes?: any[]; edges?: any[] } }
    >({
      query: ({ projectId, graph }) => ({
        url: `/projects/${projectId}/architecture/validate`,
        method: 'POST',
        body: graph || {},
      }),
      async onQueryStarted({ projectId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && data.success) {
            // Update cached validation result in getArchitecture query without triggering refetch
            dispatch(
              architectureApi.util.updateQueryData('getArchitecture', projectId, (draft) => {
                if (draft && draft.success && draft.data) {
                  draft.data.validation = data.data;
                }
              })
            );
          }
        } catch {
          // Handled by caller/mutation result
        }
      },
    }),
  }),
});

export const {
  useGetArchitectureQuery,
  useUpdateArchitectureMutation,
  useValidateArchitectureMutation,
} = architectureApi;

