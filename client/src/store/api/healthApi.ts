import { baseApi } from './baseApi';
import { ApiSuccessResponse, HealthCheckData } from '@archsync/shared';

/**
 * Health API endpoint for checking server status via RTK Query
 */
export const healthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHealth: builder.query<ApiSuccessResponse<HealthCheckData>, void>({
      query: () => '/health',
      providesTags: ['Health'],
    }),
  }),
});

export const { useGetHealthQuery } = healthApi;
