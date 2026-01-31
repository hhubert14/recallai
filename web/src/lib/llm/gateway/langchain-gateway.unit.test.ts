import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import { LangChainGateway } from "./langchain-gateway";
import {
  RateLimitError,
  AuthenticationError,
  ProviderUnavailableError,
  LLMError,
} from "../errors";
import type { ILLMAdapter } from "../adapters/base.adapter";
import type { ModelConfig } from "../types";

// Mock adapter factory for testing
function createMockAdapter(
  provider: string,
  available: boolean,
  invokeResult?: unknown,
  invokeError?: Error
): ILLMAdapter {
  const mockModel = {
    withStructuredOutput: vi.fn().mockReturnValue({
      invoke: invokeError
        ? vi.fn().mockRejectedValue(invokeError)
        : vi.fn().mockResolvedValue(invokeResult),
    }),
  };

  return {
    provider: provider as ModelConfig["provider"],
    isAvailable: vi.fn().mockReturnValue(available),
    createLangChainModel: vi.fn().mockReturnValue(mockModel),
    classifyError: vi.fn().mockImplementation((error) => {
      // Simulate error classification
      if (error?.status === 429) {
        return new RateLimitError(provider as ModelConfig["provider"]);
      }
      if (error?.status === 401) {
        return new AuthenticationError(provider as ModelConfig["provider"]);
      }
      if (error?.status === 503) {
        return new ProviderUnavailableError(provider as ModelConfig["provider"]);
      }
      return new LLMError(
        provider as ModelConfig["provider"],
        error?.message || "Unknown error"
      );
    }),
  };
}

describe("LangChainGateway", () => {
  const testSchema = z.object({
    result: z.string(),
  });

  describe("invokeWithStructuredOutput", () => {
    it("uses the first available provider in the priority list", async () => {
      const groqAdapter = createMockAdapter("groq", true, { result: "success" });
      const openaiAdapter = createMockAdapter("openai", true, { result: "fallback" });

      const gateway = new LangChainGateway([groqAdapter, openaiAdapter]);

      const result = await gateway.invokeWithStructuredOutput(
        [{ provider: "groq", modelId: "llama-3.3-70b-versatile" }],
        testSchema,
        [{ role: "user", content: "test" }]
      );

      expect(result).toEqual({ result: "success" });
      expect(groqAdapter.createLangChainModel).toHaveBeenCalled();
      expect(openaiAdapter.createLangChainModel).not.toHaveBeenCalled();
    });

    it("falls back to second provider when first is unavailable", async () => {
      const groqAdapter = createMockAdapter("groq", false);
      const openaiAdapter = createMockAdapter("openai", true, { result: "fallback" });

      const gateway = new LangChainGateway([groqAdapter, openaiAdapter]);

      const result = await gateway.invokeWithStructuredOutput(
        [
          { provider: "groq", modelId: "llama-3.3-70b-versatile" },
          { provider: "openai", modelId: "gpt-4o-mini" },
        ],
        testSchema,
        [{ role: "user", content: "test" }]
      );

      expect(result).toEqual({ result: "fallback" });
      expect(groqAdapter.createLangChainModel).not.toHaveBeenCalled();
      expect(openaiAdapter.createLangChainModel).toHaveBeenCalled();
    });

    it("falls back to second provider when first returns rate limit error", async () => {
      const rateLimitError = { status: 429, message: "Rate limit exceeded" };
      const groqAdapter = createMockAdapter("groq", true, undefined, rateLimitError as unknown as Error);
      const openaiAdapter = createMockAdapter("openai", true, { result: "fallback" });

      const gateway = new LangChainGateway([groqAdapter, openaiAdapter]);

      const result = await gateway.invokeWithStructuredOutput(
        [
          { provider: "groq", modelId: "llama-3.3-70b-versatile" },
          { provider: "openai", modelId: "gpt-4o-mini" },
        ],
        testSchema,
        [{ role: "user", content: "test" }]
      );

      expect(result).toEqual({ result: "fallback" });
    });

    it("falls back when provider is temporarily unavailable", async () => {
      const unavailableError = { status: 503, message: "Service unavailable" };
      const groqAdapter = createMockAdapter("groq", true, undefined, unavailableError as unknown as Error);
      const openaiAdapter = createMockAdapter("openai", true, { result: "fallback" });

      const gateway = new LangChainGateway([groqAdapter, openaiAdapter]);

      const result = await gateway.invokeWithStructuredOutput(
        [
          { provider: "groq", modelId: "llama-3.3-70b-versatile" },
          { provider: "openai", modelId: "gpt-4o-mini" },
        ],
        testSchema,
        [{ role: "user", content: "test" }]
      );

      expect(result).toEqual({ result: "fallback" });
    });

    it("does NOT fall back on authentication error", async () => {
      const authError = { status: 401, message: "Invalid API key" };
      const groqAdapter = createMockAdapter("groq", true, undefined, authError as unknown as Error);
      const openaiAdapter = createMockAdapter("openai", true, { result: "fallback" });

      const gateway = new LangChainGateway([groqAdapter, openaiAdapter]);

      await expect(
        gateway.invokeWithStructuredOutput(
          [
            { provider: "groq", modelId: "llama-3.3-70b-versatile" },
            { provider: "openai", modelId: "gpt-4o-mini" },
          ],
          testSchema,
          [{ role: "user", content: "test" }]
        )
      ).rejects.toThrow(AuthenticationError);
    });

    it("throws error when no providers are available", async () => {
      const groqAdapter = createMockAdapter("groq", false);
      const openaiAdapter = createMockAdapter("openai", false);

      const gateway = new LangChainGateway([groqAdapter, openaiAdapter]);

      await expect(
        gateway.invokeWithStructuredOutput(
          [
            { provider: "groq", modelId: "llama-3.3-70b-versatile" },
            { provider: "openai", modelId: "gpt-4o-mini" },
          ],
          testSchema,
          [{ role: "user", content: "test" }]
        )
      ).rejects.toThrow("No LLM providers available");
    });

    it("throws error when all providers fail with retryable errors", async () => {
      const rateLimitError = { status: 429, message: "Rate limit exceeded" };
      const groqAdapter = createMockAdapter("groq", true, undefined, rateLimitError as unknown as Error);
      const openaiAdapter = createMockAdapter("openai", true, undefined, rateLimitError as unknown as Error);

      const gateway = new LangChainGateway([groqAdapter, openaiAdapter]);

      await expect(
        gateway.invokeWithStructuredOutput(
          [
            { provider: "groq", modelId: "llama-3.3-70b-versatile" },
            { provider: "openai", modelId: "gpt-4o-mini" },
          ],
          testSchema,
          [{ role: "user", content: "test" }]
        )
      ).rejects.toThrow("All LLM providers failed");
    });

    it("skips providers not in the priority list", async () => {
      const groqAdapter = createMockAdapter("groq", true, { result: "groq" });
      const openaiAdapter = createMockAdapter("openai", true, { result: "openai" });

      const gateway = new LangChainGateway([groqAdapter, openaiAdapter]);

      // Only request OpenAI, not Groq
      const result = await gateway.invokeWithStructuredOutput(
        [{ provider: "openai", modelId: "gpt-4o-mini" }],
        testSchema,
        [{ role: "user", content: "test" }]
      );

      expect(result).toEqual({ result: "openai" });
      expect(groqAdapter.createLangChainModel).not.toHaveBeenCalled();
      expect(openaiAdapter.createLangChainModel).toHaveBeenCalled();
    });

    it("passes model configuration to adapter", async () => {
      const groqAdapter = createMockAdapter("groq", true, { result: "success" });
      const gateway = new LangChainGateway([groqAdapter]);

      const config: ModelConfig = {
        provider: "groq",
        modelId: "llama-3.3-70b-versatile",
        temperature: 0.7,
        maxTokens: 2000,
      };

      await gateway.invokeWithStructuredOutput(
        [config],
        testSchema,
        [{ role: "user", content: "test" }]
      );

      expect(groqAdapter.createLangChainModel).toHaveBeenCalledWith(config);
    });
  });
});
