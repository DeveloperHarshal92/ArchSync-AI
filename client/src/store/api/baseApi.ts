import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * RTK Query base API infrastructure matching RULES.md Section 5 & 6
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    credentials: 'include',
  }),
  tagTypes: ['Health', 'User', 'Project', 'Architecture', 'Member', 'Invitation'],
  endpoints: () => ({}),
});
