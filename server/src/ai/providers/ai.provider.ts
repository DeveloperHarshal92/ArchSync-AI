import { AIProviderRequest, AIProviderResponse } from '../types';

export interface AIProvider {
  readonly name: string;
  isConfigured(): boolean;
  generateResponse(request: AIProviderRequest): Promise<AIProviderResponse>;
}
