import { AIProvider } from './ai.provider';
import { geminiProvider } from './gemini.provider';
import { mistralProvider } from './mistral.provider';
import { AIProviderRequest, AIProviderResponse } from '../types';
import { AppError } from '../../utils/errors';

/**
 * Checks whether an error is transient and eligible for automatic fallback.
 * Eligible:
 * - 429 Too Many Requests / Rate limit exceeded
 * - 500 Internal Server Error
 * - 502 Bad Gateway
 * - 503 Service Unavailable / Provider not configured
 * - 504 Gateway Timeout / AbortError / Timeout
 * - Network failures (ECONNRESET, ETIMEDOUT, fetch failed)
 *
 * Ineligible (Client / Request Errors):
 * - 400 Bad Request / AI_REQUEST_INVALID
 * - 401 Unauthorized
 * - 403 Forbidden
 * - 404 Not Found
 */
export function isTransientAIError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const err = error as Record<string, any>;
  const statusCode = err.statusCode ?? err.status;
  const code = err.code;
  const name = err.name;
  const message = String(err.message || '').toLowerCase();

  // Explicit non-transient client errors
  if (statusCode === 400 || statusCode === 401 || statusCode === 403 || statusCode === 404) {
    return false;
  }
  if (code === 'AI_REQUEST_INVALID' || code === 'VALIDATION_ERROR' || code === 'INVALID_INPUT') {
    return false;
  }

  // Transient HTTP status codes
  if (statusCode === 429 || statusCode === 500 || statusCode === 502 || statusCode === 503 || statusCode === 504) {
    return true;
  }

  // Transient error codes
  if (
    code === 'AI_RATE_LIMITED' ||
    code === 'AI_PROVIDER_ERROR' ||
    code === 'AI_TIMEOUT' ||
    code === 'AI_NOT_CONFIGURED'
  ) {
    return true;
  }

  // Timeout or network connection aborts
  if (name === 'AbortError' || message.includes('timeout') || message.includes('fetch failed') || message.includes('network')) {
    return true;
  }

  return false;
}

export class FailoverAIProvider implements AIProvider {
  public readonly name = 'Automatic Failover AI Provider (Gemini -> Mistral)';
  private readonly primaryProvider: AIProvider;
  private readonly fallbackProvider: AIProvider;

  constructor(
    primaryProvider: AIProvider = geminiProvider,
    fallbackProvider: AIProvider = mistralProvider
  ) {
    this.primaryProvider = primaryProvider;
    this.fallbackProvider = fallbackProvider;
  }

  public getPrimary(): AIProvider {
    return this.primaryProvider;
  }

  public getFallback(): AIProvider {
    return this.fallbackProvider;
  }

  public isConfigured(): boolean {
    return this.primaryProvider.isConfigured() || this.fallbackProvider.isConfigured();
  }

  public async generateResponse(request: AIProviderRequest): Promise<AIProviderResponse> {
    const isPrimaryReady = this.primaryProvider.isConfigured();
    const isFallbackReady = this.fallbackProvider.isConfigured();

    // Case 1: Primary provider is configured - try primary first
    if (isPrimaryReady) {
      try {
        return await this.primaryProvider.generateResponse(request);
      } catch (primaryError: unknown) {
        // If the error is not transient or fallback is not configured, rethrow immediately
        if (!isTransientAIError(primaryError) || !isFallbackReady) {
          throw primaryError;
        }

        const primaryErr = primaryError as Record<string, any>;
        const errorReason = primaryErr.code || primaryErr.statusCode || primaryErr.message || 'Transient failure';

        // Log sanitized telemetry event - NEVER log prompts or keys
        console.warn(
          `[AI Failover] Primary provider "${this.primaryProvider.name}" encountered transient failure (${errorReason}). Automatically failing over to "${this.fallbackProvider.name}"...`
        );

        // Attempt fallback provider
        try {
          const fallbackResponse = await this.fallbackProvider.generateResponse(request);
          console.info(
            `[AI Failover] Fallback to "${this.fallbackProvider.name}" succeeded using model "${fallbackResponse.model}".`
          );
          return fallbackResponse;
        } catch (fallbackError: unknown) {
          const fbErr = fallbackError as Record<string, any>;
          const fbReason = fbErr.code || fbErr.statusCode || fbErr.message || 'Transient failure';

          console.error(
            `[AI Failover] Fallback provider "${this.fallbackProvider.name}" also failed (${fbReason}). Both providers exhausted.`
          );

          // If fallback threw an AppError, rethrow it; otherwise create sanitized 502/503 AppError
          if (fallbackError instanceof AppError) {
            throw fallbackError;
          }

          throw new AppError(
            'Both primary and fallback AI providers are currently unavailable. Please try again shortly.',
            503,
            'AI_PROVIDER_ERROR'
          );
        }
      }
    }

    // Case 2: Primary is NOT configured, but Fallback IS configured
    if (isFallbackReady) {
      console.info(
        `[AI Failover] Primary provider "${this.primaryProvider.name}" is not configured. Routing request directly to configured fallback provider "${this.fallbackProvider.name}".`
      );
      return await this.fallbackProvider.generateResponse(request);
    }

    // Case 3: Neither provider is configured
    throw new AppError(
      'No AI providers are configured on this server. Please provide GEMINI_API_KEY or MISTRAL_API_KEY.',
      503,
      'AI_NOT_CONFIGURED'
    );
  }
}

export const failoverProvider = new FailoverAIProvider();
