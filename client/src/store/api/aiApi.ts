import {
  ApiResponse,
  AIAnalysisResponse,
  AIAnalyzeRequest,
  AIChatRequest,
} from '@archsync/shared';
import { baseApi } from './baseApi';

/**
 * RTK Query endpoints for the AI Architecture Assistant (F12)
 * Strictly delegates to server endpoints (/api/v1/ai/*)
 * Secret safety: Frontend never contacts AI providers directly.
 */
export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    analyzeArchitecture: builder.mutation<
      ApiResponse<AIAnalysisResponse>,
      AIAnalyzeRequest
    >({
      query: (body) => ({
        url: '/ai/analyze',
        method: 'POST',
        body,
      }),
    }),

    chatArchitecture: builder.mutation<
      ApiResponse<AIAnalysisResponse>,
      AIChatRequest
    >({
      query: (body) => ({
        url: '/ai/chat',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useAnalyzeArchitectureMutation,
  useChatArchitectureMutation,
} = aiApi;
