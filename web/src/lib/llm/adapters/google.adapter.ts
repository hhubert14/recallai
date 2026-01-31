import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ILLMAdapter } from "./base.adapter";
import type { LLMProvider, ModelConfig } from "../types";
import { classifyError, type LLMError } from "../errors";

/**
 * Adapter for Google AI Studio (Gemini models).
 *
 * Free tier limits (gemini-2.5-flash):
 * - 5 requests/minute, 20 requests/day
 * - 250,000 tokens/minute
 *
 * Recommended models:
 * - gemini-2.5-flash: Good quality, high token limit
 * - gemini-2.5-flash-lite: Higher RPM (10 vs 5)
 *
 * Check available models at: https://aistudio.google.com/apikey
 */
export class GoogleAdapter implements ILLMAdapter {
  readonly provider: LLMProvider = "google";

  isAvailable(): boolean {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    return Boolean(apiKey && apiKey.length > 0);
  }

  createLangChainModel(config: ModelConfig): BaseChatModel {
    return new ChatGoogleGenerativeAI({
      model: config.modelId,
      temperature: config.temperature ?? 0,
      maxOutputTokens: config.maxTokens,
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
  }

  classifyError(error: unknown): LLMError {
    return classifyError(this.provider, error);
  }
}
