import {
  ApiResponse,
  ArchitectureResponseData,
  UpdateArchitectureRequest,
} from '@archsync/shared';
import { baseApi } from './baseApi';

/**
 * Architecture API endpoints matching RULES.md Section 5 & F06 specifications
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
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Architecture', id: projectId },
      ],
    }),
  }),
});

export const { useGetArchitectureQuery, useUpdateArchitectureMutation } = architectureApi;
