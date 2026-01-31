import { ChatOpenAI } from "@langchain/openai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ILLMAdapter } from "./base.adapter";
import type { LLMProvider, ModelConfig } from "../types";
import { classifyError, type LLMError } from "../errors";

/**
 * Adapter for OpenAI LLM provider.
 *
 * This is the paid fallback provider - used when all free providers fail.
 *
 * Recommended models:
 * - gpt-4o-mini: Cost-effective, good quality
 * - gpt-4o: Best quality, higher cost
 */
export class OpenAIAdapter implements ILLMAdapter {
  readonly provider: LLMProvider = "openai";

  isAvailable(): boolean {
    const apiKey = process.env.OPENAI_API_KEY;
    return Boolean(apiKey && apiKey.length > 0);
  }

  createLangChainModel(config: ModelConfig): BaseChatModel {
    return new ChatOpenAI({
      model: config.modelId,
      temperature: config.temperature ?? 0,
      maxTokens: config.maxTokens,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  classifyError(error: unknown): LLMError {
    return classifyError(this.provider, error);
  }
}
