import type { ModelPriorityList } from "../types";

/**
 * Preset for video summarization.
 *
 * Optimized for: long context, deterministic output, accuracy
 * Used by: video-summarizer.service.langchain.ts
 *
 * Priority:
 * 1. Google - Best for long transcripts (250K tok/min) but only 20 req/day
 * 2. Groq - Higher volume (14.4K req/day) but 6K tok/min limit
 * 3. OpenAI - Paid fallback, reliable
 */
export const SUMMARIZER_PRIORITY: ModelPriorityList = [
  // Google first - best long context, 250K tok/min, 20 req/day
  { provider: "google", modelId: "gemini-2.5-flash", temperature: 0 },
  // Groq - fast but lower token limits (6K tok/min for 70B model)
  { provider: "groq", modelId: "llama-3.3-70b-versatile", temperature: 0 },
  // OpenAI paid fallback
  { provider: "openai", modelId: "gpt-4o-mini", temperature: 0 },
];
