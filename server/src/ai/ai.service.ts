import { AIProvider } from './providers/ai.provider';
import { geminiProvider } from './providers/gemini.provider';
import { AIAnalysisResponse } from './types';
import { architectureService } from '../services/architecture.service';
import { permissionService } from '../services/permission.service';
import { validationRulesEngine } from '../validation/validation.service';
import { buildArchitectureContext } from './context/architectureContext';
import { ARCHITECTURE_ASSISTANT_SYSTEM_INSTRUCTION } from './prompts/systemPrompt';
import { buildAnalysisPrompt } from './prompts/analysisPrompt';
import { buildChatPrompt } from './prompts/chatPrompt';
import {
  aiRateLimiter,
  sanitizeQuestion,
  parseAndValidateAIResponse,
} from './safety/aiSafety';
import { AppError } from '../utils/errors';

export class AIService {
  private provider: AIProvider;

  constructor(provider: AIProvider = geminiProvider) {
    this.provider = provider;
  }

  /**
   * Allows injecting alternative providers (e.g. for unit testing or future multi-provider support)
   */
  public setProvider(provider: AIProvider): void {
    this.provider = provider;
  }

  public getProvider(): AIProvider {
    return this.provider;
  }

  /**
   * Analyzes an architecture diagram comprehensively or focused on a specific aspect
   * Zero-mutation: Read-only operation.
   */
  public async analyzeArchitecture(
    userId: string,
    projectId: string,
    rawQuestion?: string
  ): Promise<AIAnalysisResponse> {
    // 1. Rate limiting per user
    aiRateLimiter.checkRateLimit(userId);

    // 2. Authorize project access (OWNER, EDITOR, VIEWER allowed; outsiders 403)
    await permissionService.requireProjectAccess(userId, projectId);

    // 3. Retrieve authoritative architecture
    const { architecture } = await architectureService.getArchitecture(userId, projectId);

    // 4. Run deterministic F11 validation to supply as factual findings
    const validationResult = validationRulesEngine.validate(architecture);

    // 5. Sanitize user question
    const sanitizedQuestion = sanitizeQuestion(rawQuestion);

    // 6. Project and build safe architecture context
    const context = buildArchitectureContext(architecture, validationResult, sanitizedQuestion);

    // 7. Construct prompts
    const prompt = buildAnalysisPrompt(context, sanitizedQuestion);

    // 8. Invoke AI provider
    const providerResponse = await this.provider.generateResponse({
      systemInstruction: ARCHITECTURE_ASSISTANT_SYSTEM_INSTRUCTION,
      prompt,
      temperature: 0.2,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    });

    // 9. Parse and validate structured response
    const validatedResponse = parseAndValidateAIResponse(providerResponse.content);

    return validatedResponse;
  }

  /**
   * Answers a specific conversational architecture question grounded in the current diagram
   * Zero-mutation: Read-only operation.
   */
  public async chatArchitecture(
    userId: string,
    projectId: string,
    rawQuestion: string
  ): Promise<AIAnalysisResponse> {
    const sanitizedQuestion = sanitizeQuestion(rawQuestion);
    if (!sanitizedQuestion || sanitizedQuestion.trim().length === 0) {
      throw new AppError('Question cannot be empty', 400, 'AI_REQUEST_INVALID');
    }

    // 1. Rate limiting per user
    aiRateLimiter.checkRateLimit(userId);

    // 2. Authorize project access
    await permissionService.requireProjectAccess(userId, projectId);

    // 3. Retrieve authoritative architecture
    const { architecture } = await architectureService.getArchitecture(userId, projectId);

    // 4. Run F11 validation
    const validationResult = validationRulesEngine.validate(architecture);

    // 5. Project context
    const context = buildArchitectureContext(architecture, validationResult, sanitizedQuestion);

    // 6. Build prompt
    const prompt = buildChatPrompt(context, sanitizedQuestion);

    // 7. Call provider
    const providerResponse = await this.provider.generateResponse({
      systemInstruction: ARCHITECTURE_ASSISTANT_SYSTEM_INSTRUCTION,
      prompt,
      temperature: 0.2,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    });

    // 8. Parse and validate structured output
    const validatedResponse = parseAndValidateAIResponse(providerResponse.content);

    return validatedResponse;
  }
}

export const aiService = new AIService();
