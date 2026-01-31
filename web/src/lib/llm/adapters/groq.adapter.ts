import { ChatGroq } from "@langchain/groq";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ILLMAdapter } from "./base.adapter";
import type { LLMProvider, ModelConfig } from "../types";
import { classifyError, type LLMError } from "../errors";

/**
 * Adapter for Groq LLM provider.
 *
 * Free tier limits:
 * - 14,400 requests/day
 * - 12,000 tokens/minute
 *
 * Recommended models:
 * - llama-3.3-70b-versatile: Best quality, 128K context
 * - llama-3.1-8b-instant: Fastest, good for simple tasks
 * - llama-4-scout-17b-16e-instruct: New Llama 4 model
 */
export class GroqAdapter implements ILLMAdapter {
  readonly provider: LLMProvider = "groq";

  isAvailable(): boolean {
    const apiKey = process.env.GROQ_API_KEY;
    return Boolean(apiKey && apiKey.length > 0);
  }

  createLangChainModel(config: ModelConfig): BaseChatModel {
    return new ChatGroq({
      model: config.modelId,
      temperature: config.temperature ?? 0,
      maxTokens: config.maxTokens,
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  classifyError(error: unknown): LLMError {
    return classifyError(this.provider, error);
  }
}
