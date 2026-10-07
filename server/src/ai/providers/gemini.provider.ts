import { AIProvider } from './ai.provider';
import { AIProviderRequest, AIProviderResponse } from '../types';
import { env } from '../../config/env';
import { AppError } from '../../utils/errors';

export class GeminiProvider implements AIProvider {
  public readonly name = 'Google Gemini Provider';
  private readonly apiKey: string | undefined;
  private readonly model: string;
  private readonly defaultTimeoutMs: number;

  constructor(
    apiKeyOrOptions?: string | { apiKey?: string; model?: string; defaultTimeoutMs?: number },
    model?: string,
    defaultTimeoutMs = 30000
  ) {
    if (typeof apiKeyOrOptions === 'object' && apiKeyOrOptions !== null) {
      this.apiKey = apiKeyOrOptions.apiKey;
      this.model = apiKeyOrOptions.model || env.GEMINI_MODEL || env.AI_MODEL || 'gemini-2.5-flash';
      this.defaultTimeoutMs = apiKeyOrOptions.defaultTimeoutMs ?? 30000;
    } else {
      this.apiKey = apiKeyOrOptions;
      this.model = model || env.GEMINI_MODEL || env.AI_MODEL || 'gemini-2.5-flash';
      this.defaultTimeoutMs = defaultTimeoutMs;
    }
  }

  private getEffectiveApiKey(): string | undefined {
    if (this.apiKey !== undefined) {
      return this.apiKey;
    }
    return (
      process.env.GEMINI_API_KEY ||
      process.env.AI_API_KEY ||
      env.GEMINI_API_KEY ||
      env.AI_API_KEY
    );
  }

  private getEffectiveModel(): string {
    return (
      this.model ||
      process.env.GEMINI_MODEL ||
      process.env.AI_MODEL ||
      env.GEMINI_MODEL ||
      env.AI_MODEL ||
      'gemini-2.5-flash'
    );
  }

  public isConfigured(): boolean {
    const key = this.getEffectiveApiKey();
    return Boolean(key && typeof key === 'string' && key.trim().length > 0);
  }

  public async generateResponse(request: AIProviderRequest): Promise<AIProviderResponse> {
    const apiKey = this.getEffectiveApiKey();
    const model = this.getEffectiveModel();

    if (!this.isConfigured() || !apiKey) {
      throw new AppError(
        'Google Gemini API is not configured on this server. Please provide a valid GEMINI_API_KEY.',
        503,
        'AI_NOT_CONFIGURED'
      );
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const payload = {
      systemInstruction: {
        parts: [{ text: request.systemInstruction }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: request.prompt }],
        },
      ],
      generationConfig: {
        temperature: request.temperature ?? 0.2,
        maxOutputTokens: request.maxOutputTokens ?? 2048,
        responseMimeType: request.responseMimeType || 'application/json',
      },
    };

    let attempts = 0;
    const maxAttempts = 2; // Maximum 1 retry on transient failures

    while (attempts < maxAttempts) {
      attempts++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeoutMs);

      // Link external signal if provided
      if (request.signal) {
        request.signal.addEventListener('abort', () => controller.abort(), { once: true });
      }

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const status = response.status;
          let errorText = '';
          try {
            const errorJson = (await response.json()) as any;
            errorText = errorJson?.error?.message || response.statusText;
          } catch {
            errorText = response.statusText;
          }

          // Handle Rate Limiting
          if (status === 429) {
            throw new AppError(
              'The AI architecture assistant is currently rate limited by the provider. Please try again shortly.',
              429,
              'AI_RATE_LIMITED'
            );
          }

          // Transient error retry on 503 Service Unavailable or 500
          if ((status === 503 || status === 500) && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }

          throw new AppError(
            `The AI provider encountered an error (${status}).`,
            502,
            'AI_PROVIDER_ERROR',
            { details: errorText }
          );
        }

        const data = (await response.json()) as any;

        // Extract candidate text
        const candidate = data?.candidates?.[0];
        const contentText = candidate?.content?.parts?.[0]?.text;

        if (!contentText || typeof contentText !== 'string') {
          throw new AppError(
            'The AI assistant returned an empty or unparseable response.',
            502,
            'AI_INVALID_RESPONSE'
          );
        }

        return {
          content: contentText,
          model: this.model,
          usage: {
            inputTokens: data?.usageMetadata?.promptTokenCount,
            outputTokens: data?.usageMetadata?.candidatesTokenCount,
            totalTokens: data?.usageMetadata?.totalTokenCount,
          },
        };
      } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError' || controller.signal.aborted) {
          throw new AppError(
            'The AI architecture analysis request timed out. Please try again with a smaller architecture or specific query.',
            504,
            'AI_TIMEOUT'
          );
        }

        if (error instanceof AppError) {
          throw error;
        }

        // On network error, retry once if attempts remain
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        throw new AppError(
          'Failed to communicate with the Google Gemini API.',
          502,
          'AI_PROVIDER_ERROR'
        );
      }
    }

    throw new AppError(
      'The architecture assistant is temporarily unavailable after retries.',
      502,
      'AI_PROVIDER_ERROR'
    );
  }
}

export const geminiProvider = new GeminiProvider();
