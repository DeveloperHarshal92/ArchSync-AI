/**
 * AI domain types matching RULES.md and Epic F12 specifications
 */

export type AIConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type AIFindingSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AIRiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AIAnalysisFinding {
  title: string;
  severity: AIFindingSeverity;
  explanation: string;
  relatedNodeIds?: string[];
  relatedEdgeIds?: string[];
}

export interface AIRecommendation {
  title: string;
  explanation: string;
  tradeoff?: string;
  relatedNodeIds?: string[];
}

export interface AIRisk {
  title: string;
  explanation: string;
  severity: AIRiskSeverity;
}

export interface AIAnalysisResponse {
  summary: string;
  findings: AIAnalysisFinding[];
  recommendations: AIRecommendation[];
  risks: AIRisk[];
  assumptions: string[];
  confidence: AIConfidenceLevel;
  analyzedAt: string;
}

export interface AIAnalyzeRequest {
  projectId: string;
  question?: string;
}

export interface AIChatRequest {
  projectId: string;
  question: string;
}

export type AIErrorCode =
  | 'AI_NOT_CONFIGURED'
  | 'AI_PROVIDER_ERROR'
  | 'AI_RATE_LIMITED'
  | 'AI_TIMEOUT'
  | 'AI_INVALID_RESPONSE'
  | 'AI_CONTEXT_TOO_LARGE'
  | 'AI_REQUEST_INVALID';
