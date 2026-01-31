/**
 * Core types for the LLM Gateway.
 *
 * The gateway supports multiple LLM providers with automatic fallback.
 * Adding a new provider requires:
 * 1. Add provider name to LLMProvider type
 * 2. Add ProviderConfig to provider-registry.ts
 * 3. Create adapter in adapters/{provider}.adapter.ts
 */

// Add new providers here - single source of truth
export type LLMProvider =
  | "google"
  | "groq"
  | "cerebras"
  | "openrouter"
  | "openai";

export interface ModelConfig {
  provider: LLMProvider;
  modelId: string;
  temperature?: number;
  maxTokens?: number;
  // Provider-specific options
  options?: Record<string, unknown>;
}

export type ModelPriorityList = ModelConfig[];

export interface ProviderCapabilities {
  supportsStructuredOutput: boolean;
  supportsStreaming: boolean;
  supportsVision: boolean;
  maxContextTokens: number;
}

export interface ProviderConfig {
  name: LLMProvider;
  envKey: string; // Environment variable for API key
  baseUrl?: string; // For OpenAI-compatible providers
  capabilities: ProviderCapabilities;
  freeLimit?: {
    requestsPerDay?: number;
    requestsPerMinute?: number;
    tokensPerMinute?: number;
  };
}

export interface ModelDefinition {
  id: string;
  name: string;
  contextWindow: number;
  free: boolean;
}
