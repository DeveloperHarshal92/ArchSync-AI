import {
  AIConfidenceLevel,
  AIFindingSeverity,
  AIRiskSeverity,
  AIAnalysisFinding,
  AIRecommendation,
  AIRisk,
  AIAnalysisResponse,
  AIAnalyzeRequest,
  AIChatRequest,
  AIErrorCode,
} from '@archsync/shared';

export {
  AIConfidenceLevel,
  AIFindingSeverity,
  AIRiskSeverity,
  AIAnalysisFinding,
  AIRecommendation,
  AIRisk,
  AIAnalysisResponse,
  AIAnalyzeRequest,
  AIChatRequest,
  AIErrorCode,
};

export interface AIProviderRequest {
  systemInstruction: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
  signal?: AbortSignal;
}

export interface AIProviderResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

export interface ProjectArchitectureContext {
  projectId: string;
  nodes: Array<{
    id: string;
    type: string;
    label: string;
    technology?: string;
    category?: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: string;
    label?: string;
  }>;
  version: number;
  validationIssues?: Array<{
    code: string;
    severity: string;
    message: string;
    nodeIds?: string[];
    edgeIds?: string[];
  }>;
  question?: string;
}
