import { AIProvider } from './ai.provider';
import { AIProviderRequest, AIProviderResponse } from '../types';
import { env } from '../../config/env';
import { AppError } from '../../utils/errors';

export class MistralProvider implements AIProvider {
  public readonly name = 'Mistral AI Provider';
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
      this.model = apiKeyOrOptions.model || env.MISTRAL_MODEL || 'mistral-small-latest';
      this.defaultTimeoutMs = apiKeyOrOptions.defaultTimeoutMs ?? 30000;
    } else {
      this.apiKey = apiKeyOrOptions;
      this.model = model || env.MISTRAL_MODEL || 'mistral-small-latest';
      this.defaultTimeoutMs = defaultTimeoutMs;
    }
  }

  private getEffectiveApiKey(): string | undefined {
    if (this.apiKey !== undefined) {
      return this.apiKey;
    }
    return process.env.MISTRAL_API_KEY || env.MISTRAL_API_KEY;
  }

  private getEffectiveModel(): string {
    return (
      this.model ||
      process.env.MISTRAL_MODEL ||
      env.MISTRAL_MODEL ||
      'mistral-small-latest'
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
        'Mistral AI API is not configured on this server. Please provide a valid MISTRAL_API_KEY.',
        503,
        'AI_NOT_CONFIGURED'
      );
    }

    const endpoint = 'https://api.mistral.ai/v1/chat/completions';

    const payload: any = {
      model,
      messages: [
        {
          role: 'system',
          content: request.systemInstruction,
        },
        {
          role: 'user',
          content: request.prompt,
        },
      ],
      temperature: request.temperature ?? 0.2,
      max_tokens: request.maxOutputTokens ?? 2048,
    };

    if (request.responseMimeType === 'application/json') {
      payload.response_format = { type: 'json_object' };
    }

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
            Authorization: `Bearer ${apiKey}`,
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
            errorText = errorJson?.message || errorJson?.error?.message || response.statusText;
          } catch {
            errorText = response.statusText;
          }

          // Rate Limiting
          if (status === 429) {
            throw new AppError(
              'The AI architecture assistant is currently rate limited by Mistral. Please try again shortly.',
              429,
              'AI_RATE_LIMITED'
            );
          }

          // Transient error retry on 503 Service Unavailable or 500
          if ((status === 503 || status === 500 || status === 502) && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }

          throw new AppError(
            `The Mistral AI provider encountered an error (${status}).`,
            status >= 500 ? status : 502,
            'AI_PROVIDER_ERROR',
            { details: errorText }
          );
        }

        const data = (await response.json()) as any;
        const candidate = data?.choices?.[0]?.message?.content;

        if (!candidate || typeof candidate !== 'string') {
          throw new AppError(
            'The Mistral AI assistant returned an empty or unparseable response.',
            502,
            'AI_INVALID_RESPONSE'
          );
        }

        return {
          content: candidate,
          model,
          usage: {
            inputTokens: data?.usage?.prompt_tokens,
            outputTokens: data?.usage?.completion_tokens,
            totalTokens: data?.usage?.total_tokens,
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
          'Failed to communicate with the Mistral AI API.',
          502,
          'AI_PROVIDER_ERROR'
        );
      }
    }

    throw new AppError(
      'The Mistral AI assistant is temporarily unavailable after retries.',
      502,
      'AI_PROVIDER_ERROR'
    );
  }
}

export const mistralProvider = new MistralProvider();
