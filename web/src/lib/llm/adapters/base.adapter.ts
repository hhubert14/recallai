import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { LLMProvider, ModelConfig } from "../types";
import type { LLMError } from "../errors";

/**
 * Base interface for all LLM provider adapters.
 *
 * Each provider implements this interface to provide a consistent way to:
 * 1. Check if the provider is available (has API key configured)
 * 2. Create LangChain chat models for structured output
 * 3. Classify provider-specific errors
 *
 * To add a new provider:
 * 1. Create a new adapter file in adapters/{provider}.adapter.ts
 * 2. Implement ILLMAdapter interface
 * 3. Register the adapter in the gateway
 */
export interface ILLMAdapter {
  readonly provider: LLMProvider;

  /**
   * Check if this adapter can be used.
   * Returns true if the required API key is configured.
   */
  isAvailable(): boolean;

  /**
   * Create a LangChain chat model for structured output.
   * The returned model can be used with .withStructuredOutput(schema).
   */
  createLangChainModel(config: ModelConfig): BaseChatModel;

  /**
   * Classify a provider-specific error into an LLMError type.
   * This enables proper fallback handling in the gateway.
   */
  classifyError(error: unknown): LLMError;
}
