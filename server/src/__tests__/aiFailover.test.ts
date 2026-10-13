import { describe, it, expect, beforeEach } from 'vitest';
import { AIProvider } from '../ai/providers/ai.provider';
import { MistralProvider } from '../ai/providers/mistral.provider';
import { FailoverAIProvider, isTransientAIError } from '../ai/providers/failover.provider';
import { AIProviderRequest, AIProviderResponse } from '../ai/types';
import { AppError } from '../utils/errors';

describe('ArchSync AI — AI Failover (Gemini → Mistral) Behavioral Test Suite', () => {
  const dummyRequest: AIProviderRequest = {
    systemInstruction: 'You are an architecture assistant.',
    prompt: 'Analyze system topology',
    temperature: 0.2,
    maxOutputTokens: 2048,
    responseMimeType: 'application/json',
  };

  const primaryMockResponse: AIProviderResponse = {
    content: JSON.stringify({ summary: 'Gemini Primary Architecture Analysis' }),
    model: 'gemini-2.5-flash',
    usage: { inputTokens: 120, outputTokens: 80, totalTokens: 200 },
  };

  const fallbackMockResponse: AIProviderResponse = {
    content: JSON.stringify({ summary: 'Mistral Fallback Architecture Analysis' }),
    model: 'mistral-small-latest',
    usage: { inputTokens: 130, outputTokens: 85, totalTokens: 215 },
  };

  class TestMockProvider implements AIProvider {
    public readonly name: string;
    public configured: boolean = true;
    public callCount: number = 0;
    public errorToThrow: Error | null = null;
    public mockResponse: AIProviderResponse;

    constructor(name: string, mockResponse: AIProviderResponse) {
      this.name = name;
      this.mockResponse = mockResponse;
    }

    public isConfigured(): boolean {
      return this.configured;
    }

    public async generateResponse(_req: AIProviderRequest): Promise<AIProviderResponse> {
      this.callCount++;
      if (this.errorToThrow) {
        throw this.errorToThrow;
      }
      return this.mockResponse;
    }
  }

  let primary: TestMockProvider;
  let fallback: TestMockProvider;
  let failoverProvider: FailoverAIProvider;

  beforeEach(() => {
    primary = new TestMockProvider('Mock Gemini Provider', primaryMockResponse);
    fallback = new TestMockProvider('Mock Mistral Provider', fallbackMockResponse);
    failoverProvider = new FailoverAIProvider(primary, fallback);
  });

  // =========================================================================
  // 1. Transient Error Detection Logic
  // =========================================================================
  describe('1. Transient Error Classification', () => {
    it('identifies 429, 500, 502, 503, 504 and timeouts as transient', () => {
      expect(isTransientAIError(new AppError('Rate limited', 429, 'AI_RATE_LIMITED'))).toBe(true);
      expect(isTransientAIError(new AppError('Server error', 500, 'AI_PROVIDER_ERROR'))).toBe(true);
      expect(isTransientAIError(new AppError('Bad Gateway', 502, 'AI_PROVIDER_ERROR'))).toBe(true);
      expect(isTransientAIError(new AppError('Unavailable', 503, 'AI_PROVIDER_ERROR'))).toBe(true);
      expect(isTransientAIError(new AppError('Timed out', 504, 'AI_TIMEOUT'))).toBe(true);
      expect(isTransientAIError(new AppError('Not configured', 503, 'AI_NOT_CONFIGURED'))).toBe(true);

      const abortErr = new Error('The operation was aborted');
      abortErr.name = 'AbortError';
      expect(isTransientAIError(abortErr)).toBe(true);

      const networkErr = new Error('fetch failed: ECONNRESET');
      expect(isTransientAIError(networkErr)).toBe(true);
    });

    it('rejects 400 Bad Request, 401, 403, and validation errors as non-transient', () => {
      expect(isTransientAIError(new AppError('Bad prompt', 400, 'AI_REQUEST_INVALID'))).toBe(false);
      expect(isTransientAIError(new AppError('Unauthorized', 401, 'UNAUTHORIZED'))).toBe(false);
      expect(isTransientAIError(new AppError('Forbidden', 403, 'FORBIDDEN'))).toBe(false);
      expect(isTransientAIError(new AppError('Not found', 404, 'NOT_FOUND'))).toBe(false);
      expect(isTransientAIError(null)).toBe(false);
      expect(isTransientAIError(undefined)).toBe(false);
    });
  });

  // =========================================================================
  // 2. Normal Primary Execution (No Failover)
  // =========================================================================
  describe('2. Normal Operation', () => {
    it('GIVEN primary provider succeeds, WHEN generateResponse is called, THEN fallback is never invoked', async () => {
      const response = await failoverProvider.generateResponse(dummyRequest);

      expect(response).toEqual(primaryMockResponse);
      expect(primary.callCount).toBe(1);
      expect(fallback.callCount).toBe(0);
    });
  });

  // =========================================================================
  // 3. Automatic Failover on Transient Errors
  // =========================================================================
  describe('3. Automatic Failover to Mistral', () => {
    it('GIVEN primary provider returns 429 AI_RATE_LIMITED, WHEN executed, THEN switches to Mistral and succeeds', async () => {
      primary.errorToThrow = new AppError('Gemini quota exceeded', 429, 'AI_RATE_LIMITED');

      const response = await failoverProvider.generateResponse(dummyRequest);

      expect(primary.callCount).toBe(1);
      expect(fallback.callCount).toBe(1);
      expect(response).toEqual(fallbackMockResponse);
      expect(response.model).toBe('mistral-small-latest');
    });

    it('GIVEN primary provider returns 503 AI_PROVIDER_ERROR, WHEN executed, THEN switches to Mistral and succeeds', async () => {
      primary.errorToThrow = new AppError('Gemini 503 Service Unavailable', 503, 'AI_PROVIDER_ERROR');

      const response = await failoverProvider.generateResponse(dummyRequest);

      expect(primary.callCount).toBe(1);
      expect(fallback.callCount).toBe(1);
      expect(response).toEqual(fallbackMockResponse);
    });

    it('GIVEN primary provider returns 504 AI_TIMEOUT, WHEN executed, THEN switches to Mistral and succeeds', async () => {
      primary.errorToThrow = new AppError('Gemini request timed out', 504, 'AI_TIMEOUT');

      const response = await failoverProvider.generateResponse(dummyRequest);

      expect(primary.callCount).toBe(1);
      expect(fallback.callCount).toBe(1);
      expect(response).toEqual(fallbackMockResponse);
    });

    it('GIVEN primary provider throws network AbortError, WHEN executed, THEN switches to Mistral and succeeds', async () => {
      const abortErr = new Error('The operation was aborted');
      abortErr.name = 'AbortError';
      primary.errorToThrow = abortErr;

      const response = await failoverProvider.generateResponse(dummyRequest);

      expect(primary.callCount).toBe(1);
      expect(fallback.callCount).toBe(1);
      expect(response).toEqual(fallbackMockResponse);
    });
  });

  // =========================================================================
  // 4. Non-Transient Client Errors (Zero Failover)
  // =========================================================================
  describe('4. Non-Transient Client Errors Bypass Failover', () => {
    it('GIVEN primary provider throws 400 AI_REQUEST_INVALID, WHEN executed, THEN fails immediately without invoking Mistral', async () => {
      primary.errorToThrow = new AppError('Invalid prompt structure', 400, 'AI_REQUEST_INVALID');

      await expect(failoverProvider.generateResponse(dummyRequest)).rejects.toMatchObject({
        statusCode: 400,
        code: 'AI_REQUEST_INVALID',
      });

      expect(primary.callCount).toBe(1);
      expect(fallback.callCount).toBe(0); // Mistral NOT called
    });
  });

  // =========================================================================
  // 5. Configuration Edge Cases & Unavailability
  // =========================================================================
  describe('5. Unconfigured & Exhausted Providers', () => {
    it('GIVEN primary is not configured AND fallback is configured, WHEN executed, THEN routes directly to Mistral', async () => {
      primary.configured = false;

      const response = await failoverProvider.generateResponse(dummyRequest);

      expect(primary.callCount).toBe(0);
      expect(fallback.callCount).toBe(1);
      expect(response).toEqual(fallbackMockResponse);
    });

    it('GIVEN primary is configured but fails transiently AND fallback is NOT configured, THEN rethrows primary error', async () => {
      primary.errorToThrow = new AppError('Gemini rate limit', 429, 'AI_RATE_LIMITED');
      fallback.configured = false;

      await expect(failoverProvider.generateResponse(dummyRequest)).rejects.toMatchObject({
        statusCode: 429,
        code: 'AI_RATE_LIMITED',
      });

      expect(primary.callCount).toBe(1);
      expect(fallback.callCount).toBe(0);
    });

    it('GIVEN neither provider is configured, WHEN executed, THEN throws 503 AI_NOT_CONFIGURED', async () => {
      primary.configured = false;
      fallback.configured = false;

      await expect(failoverProvider.generateResponse(dummyRequest)).rejects.toMatchObject({
        statusCode: 503,
        code: 'AI_NOT_CONFIGURED',
      });
    });

    it('GIVEN both primary and fallback fail with transient errors, THEN returns controlled 503 error', async () => {
      primary.errorToThrow = new AppError('Gemini 503', 503, 'AI_PROVIDER_ERROR');
      fallback.errorToThrow = new AppError('Mistral 503', 503, 'AI_PROVIDER_ERROR');

      await expect(failoverProvider.generateResponse(dummyRequest)).rejects.toMatchObject({
        statusCode: 503,
        code: 'AI_PROVIDER_ERROR',
      });

      expect(primary.callCount).toBe(1);
      expect(fallback.callCount).toBe(1);
    });
  });

  // =========================================================================
  // 6. Mistral Provider Standalone Contract
  // =========================================================================
  describe('6. MistralProvider Standalone Contract', () => {
    it('GIVEN unconfigured MistralProvider (empty API key), THEN isConfigured returns false and generateResponse throws 503', async () => {
      const unconfigured = new MistralProvider({ apiKey: '' });
      expect(unconfigured.isConfigured()).toBe(false);

      await expect(unconfigured.generateResponse(dummyRequest)).rejects.toMatchObject({
        statusCode: 503,
        code: 'AI_NOT_CONFIGURED',
      });
    });

    it('GIVEN configured MistralProvider with custom model and timeout, THEN properties are preserved', () => {
      const customMistral = new MistralProvider({
        apiKey: 'mistral-test-secret-key',
        model: 'mistral-large-latest',
        defaultTimeoutMs: 15000,
      });

      expect(customMistral.isConfigured()).toBe(true);
      expect(customMistral.name).toBe('Mistral AI Provider');
    });
  });
});
