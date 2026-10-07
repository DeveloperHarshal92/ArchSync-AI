import {
  ApiResponse,
  ProjectListResponseData,
  ProjectResponseData,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectMemberListResponseData,
  CreateInvitationRequest,
  ProjectInvitationResponseData,
  UserInvitationsResponseData,
  AcceptInvitationResponseData,
  UpdateMemberRoleRequest,
} from '@archsync/shared';
import { baseApi } from './baseApi';

/**
 * Project & Membership API endpoints matching RULES.md Section 5 & F04/F05 specifications
 */
export const projectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<ApiResponse<ProjectListResponseData>, void>({
      query: () => '/projects',
      providesTags: (result) =>
        result && result.success
          ? [
              ...result.data.projects.map(({ id }) => ({ type: 'Project' as const, id })),
              { type: 'Project', id: 'LIST' },
            ]
          : [{ type: 'Project', id: 'LIST' }],
    }),

    getProjectById: builder.query<ApiResponse<ProjectResponseData>, string>({
      query: (projectId) => `/projects/${projectId}`,
      providesTags: (_result, _error, projectId) => [{ type: 'Project', id: projectId }],
    }),

    createProject: builder.mutation<ApiResponse<ProjectResponseData>, CreateProjectRequest>({
      query: (body) => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),

    updateProject: builder.mutation<
      ApiResponse<ProjectResponseData>,
      { projectId: string; body: UpdateProjectRequest }
    >({
      query: ({ projectId, body }) => ({
        url: `/projects/${projectId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: projectId },
        { type: 'Project', id: 'LIST' },
      ],
    }),

    deleteProject: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),

    getProjectMembers: builder.query<ApiResponse<ProjectMemberListResponseData>, string>({
      query: (projectId) => `/projects/${projectId}/members`,
      providesTags: (result, _error, projectId) =>
        result && result.success
          ? [
              ...result.data.members.map((m) => ({ type: 'Member' as const, id: m.userId })),
              { type: 'Member', id: projectId },
            ]
          : [{ type: 'Member', id: projectId }],
    }),

    createInvitation: builder.mutation<
      ApiResponse<ProjectInvitationResponseData>,
      { projectId: string; body: CreateInvitationRequest }
    >({
      query: ({ projectId, body }) => ({
        url: `/projects/${projectId}/invitations`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Invitation', id: projectId },
        { type: 'Invitation', id: 'LIST' },
      ],
    }),

    getInvitations: builder.query<ApiResponse<UserInvitationsResponseData>, void>({
      query: () => '/invitations',
      providesTags: (result) =>
        result && result.success
          ? [
              ...result.data.invitations.map((i) => ({ type: 'Invitation' as const, id: i.id })),
              { type: 'Invitation', id: 'LIST' },
            ]
          : [{ type: 'Invitation', id: 'LIST' }],
    }),

    acceptInvitation: builder.mutation<ApiResponse<AcceptInvitationResponseData>, string>({
      query: (invitationId) => ({
        url: `/invitations/${invitationId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'Invitation', id: 'LIST' },
        { type: 'Project', id: 'LIST' },
        { type: 'Member' },
      ],
    }),

    rejectInvitation: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (invitationId) => ({
        url: `/invitations/${invitationId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Invitation', id: 'LIST' }],
    }),

    updateMemberRole: builder.mutation<
      ApiResponse<{ member: unknown }>,
      { projectId: string; userId: string; body: UpdateMemberRoleRequest }
    >({
      query: ({ projectId, userId, body }) => ({
        url: `/projects/${projectId}/members/${userId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Member', id: projectId },
        { type: 'Project', id: projectId },
      ],
    }),

    removeMember: builder.mutation<
      ApiResponse<{ message: string }>,
      { projectId: string; userId: string }
    >({
      query: ({ projectId, userId }) => ({
        url: `/projects/${projectId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Member', id: projectId },
        { type: 'Project', id: projectId },
        { type: 'Project', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectMembersQuery,
  useCreateInvitationMutation,
  useGetInvitationsQuery,
  useAcceptInvitationMutation,
  useRejectInvitationMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} = projectApi;
