import { z } from 'zod';
import {
  AIAnalysisResponse,
  AIFindingSeverity,
  AIRiskSeverity,
  AIConfidenceLevel,
} from '../types';
import { AppError } from '../../utils/errors';

export const MAX_QUESTION_LENGTH = 1000;
export const MAX_NODES_IN_CONTEXT = 100;

export const aiFindingSchema = z.object({
  title: z.string().trim().min(1).default('Architectural Finding'),
  severity: z.enum(['INFO', 'WARNING', 'CRITICAL'] as [AIFindingSeverity, ...AIFindingSeverity[]]).default('INFO'),
  explanation: z.string().trim().min(1).default('No explanation provided.'),
  relatedNodeIds: z.array(z.string()).optional().default([]),
  relatedEdgeIds: z.array(z.string()).optional().default([]),
});

export const aiRecommendationSchema = z.object({
  title: z.string().trim().min(1).default('Recommendation'),
  explanation: z.string().trim().min(1).default('No explanation provided.'),
  tradeoff: z.string().trim().optional(),
  relatedNodeIds: z.array(z.string()).optional().default([]),
});

export const aiRiskSchema = z.object({
  title: z.string().trim().min(1).default('Identified Risk'),
  explanation: z.string().trim().min(1).default('No explanation provided.'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH'] as [AIRiskSeverity, ...AIRiskSeverity[]]).default('MEDIUM'),
});

export const aiAnalysisResponseSchema = z.object({
  summary: z.string().trim().min(1).default('Architecture analysis completed.'),
  findings: z.array(aiFindingSchema).default([]),
  recommendations: z.array(aiRecommendationSchema).default([]),
  risks: z.array(aiRiskSchema).default([]),
  assumptions: z.array(z.string()).default([]),
  confidence: z.enum(['LOW', 'MEDIUM', 'HIGH'] as [AIConfidenceLevel, ...AIConfidenceLevel[]]).default('MEDIUM'),
});

/**
 * Sanitizes user question text to prevent prompt injection and bound token sizes
 */
export function sanitizeQuestion(raw?: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim().slice(0, MAX_QUESTION_LENGTH);
  // Neutralize delimiter tags
  return trimmed
    .replace(/<\/?ARCHITECTURE_DATA>/gi, '')
    .replace(/<\/?SYSTEM_INSTRUCTION>/gi, '');
}

/**
 * Parses and validates raw LLM output into a strict, validated AIAnalysisResponse
 */
export function parseAndValidateAIResponse(rawText: string): AIAnalysisResponse {
  if (!rawText || typeof rawText !== 'string') {
    throw new AppError(
      'AI provider returned an empty or invalid response',
      502,
      'AI_INVALID_RESPONSE'
    );
  }

  // 1. Clean markdown code blocks if the model wrapped output in ```json ... ```
  let cleaned = rawText.trim();
  const codeBlockMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }

  // 2. Parse JSON
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(cleaned);
  } catch {
    // Controlled fallback: wrap plain text in structured contract if JSON parsing fails
    return {
      summary: rawText.trim().slice(0, 500) || 'Architecture analysis received.',
      findings: [],
      recommendations: [
        {
          title: 'Architectural Consideration',
          explanation: rawText.trim(),
          relatedNodeIds: [],
        },
      ],
      risks: [],
      assumptions: ['Response was generated using conversational fallback parsing.'],
      confidence: 'LOW',
      analyzedAt: new Date().toISOString(),
    };
  }

  // 3. Validate against Zod schema
  const validationResult = aiAnalysisResponseSchema.safeParse(parsedJson);
  if (!validationResult.success) {
    // If JSON is present but lacks some required fields, attempt graceful normalization
    if (typeof parsedJson === 'object' && parsedJson !== null) {
      const obj = parsedJson as Record<string, unknown>;
      return {
        summary: typeof obj.summary === 'string' ? obj.summary : 'Architecture analysis completed.',
        findings: Array.isArray(obj.findings) ? (obj.findings as any[]).map((f) => ({
          title: typeof f?.title === 'string' ? f.title : 'Finding',
          severity: (['INFO', 'WARNING', 'CRITICAL'].includes(f?.severity) ? f.severity : 'INFO') as AIFindingSeverity,
          explanation: typeof f?.explanation === 'string' ? f.explanation : String(f || ''),
          relatedNodeIds: Array.isArray(f?.relatedNodeIds) ? f.relatedNodeIds : [],
          relatedEdgeIds: Array.isArray(f?.relatedEdgeIds) ? f.relatedEdgeIds : [],
        })) : [],
        recommendations: Array.isArray(obj.recommendations) ? (obj.recommendations as any[]).map((r) => ({
          title: typeof r?.title === 'string' ? r.title : 'Recommendation',
          explanation: typeof r?.explanation === 'string' ? r.explanation : String(r || ''),
          tradeoff: typeof r?.tradeoff === 'string' ? r.tradeoff : undefined,
          relatedNodeIds: Array.isArray(r?.relatedNodeIds) ? r.relatedNodeIds : [],
        })) : [],
        risks: Array.isArray(obj.risks) ? (obj.risks as any[]).map((rk) => ({
          title: typeof rk?.title === 'string' ? rk.title : 'Risk',
          explanation: typeof rk?.explanation === 'string' ? rk.explanation : String(rk || ''),
          severity: (['LOW', 'MEDIUM', 'HIGH'].includes(rk?.severity) ? rk.severity : 'MEDIUM') as AIRiskSeverity,
        })) : [],
        assumptions: Array.isArray(obj.assumptions) ? obj.assumptions.map(String) : [],
        confidence: (['LOW', 'MEDIUM', 'HIGH'].includes(obj.confidence as string) ? obj.confidence : 'MEDIUM') as AIConfidenceLevel,
        analyzedAt: new Date().toISOString(),
      };
    }

    throw new AppError(
      'AI response did not conform to the expected structured format',
      502,
      'AI_INVALID_RESPONSE'
    );
  }

  return {
    ...validationResult.data,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Lightweight in-memory rate limiter per user for AI operations
 */
export class InMemoryAIRateLimiter {
  private readonly usageMap = new Map<string, { count: number; resetAt: number }>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public checkRateLimit(userId: string): void {
    const now = Date.now();
    const entry = this.usageMap.get(userId);

    if (!entry || now > entry.resetAt) {
      this.usageMap.set(userId, { count: 1, resetAt: now + this.windowMs });
      return;
    }

    if (entry.count >= this.maxRequests) {
      throw new AppError(
        'AI request limit exceeded. Please wait a minute before making additional queries.',
        429,
        'AI_RATE_LIMITED'
      );
    }

    entry.count += 1;
  }

  public reset(userId?: string): void {
    if (userId) {
      this.usageMap.delete(userId);
    } else {
      this.usageMap.clear();
    }
  }
}

export const aiRateLimiter = new InMemoryAIRateLimiter();
