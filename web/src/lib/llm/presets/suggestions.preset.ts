import type { ModelPriorityList } from "../types";

/**
 * Preset for suggestion generation, concept grouping, and feedback.
 *
 * Optimized for: structured output, variety, quality
 * Used by:
 * - suggestion-generator.service.langchain.ts (temp 0.7)
 * - concept-grouper.service.langchain.ts (temp 0.5)
 * - feedback-generator.service.langchain.ts (temp 0.7)
 *
 * Note: Temperature is set per-service, not in the preset.
 *
 * Priority:
 * 1. Groq - Fast, good structured output, high daily limit
 * 2. Google - Good quality, lower daily limit
 * 3. OpenAI - Paid fallback
 */
export const SUGGESTIONS_PRIORITY: ModelPriorityList = [
  // Groq first - fast, 14.4K req/day
  { provider: "groq", modelId: "llama-3.3-70b-versatile" },
  // Google - good quality, but only 20 req/day
  { provider: "google", modelId: "gemini-2.5-flash" },
  // OpenAI paid fallback
  { provider: "openai", modelId: "gpt-4o-mini" },
];
