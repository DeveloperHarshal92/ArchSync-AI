import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const API_TAG_TYPES = [
  'Health',
  'User',
  'Project',
  'Architecture',
  'Member',
  'Invitation',
] as const;

export type ApiTagType = (typeof API_TAG_TYPES)[number];

/**
 * RTK Query base API infrastructure matching RULES.md Section 5 & 6 and F08 specifications.
 * Enforces credentials: 'include', shared baseUrl, and tag hierarchy.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    credentials: 'include',
  }),
  tagTypes: API_TAG_TYPES as unknown as string[],
  endpoints: () => ({}),
});
