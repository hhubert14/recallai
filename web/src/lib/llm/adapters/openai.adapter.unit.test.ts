import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenAIAdapter } from "./openai.adapter";
import {
  RateLimitError,
  AuthenticationError,
  ProviderUnavailableError,
} from "../errors";

describe("OpenAIAdapter", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isAvailable", () => {
    it("returns true when OPENAI_API_KEY is set", () => {
      process.env.OPENAI_API_KEY = "test-api-key";
      const adapter = new OpenAIAdapter();
      expect(adapter.isAvailable()).toBe(true);
    });

    it("returns false when OPENAI_API_KEY is not set", () => {
      delete process.env.OPENAI_API_KEY;
      const adapter = new OpenAIAdapter();
      expect(adapter.isAvailable()).toBe(false);
    });

    it("returns false when OPENAI_API_KEY is empty string", () => {
      process.env.OPENAI_API_KEY = "";
      const adapter = new OpenAIAdapter();
      expect(adapter.isAvailable()).toBe(false);
    });
  });

  describe("provider", () => {
    it("returns 'openai' as the provider name", () => {
      const adapter = new OpenAIAdapter();
      expect(adapter.provider).toBe("openai");
    });
  });

  describe("createLangChainModel", () => {
    it("creates a ChatOpenAI model with correct configuration", () => {
      process.env.OPENAI_API_KEY = "test-api-key";
      const adapter = new OpenAIAdapter();

      const model = adapter.createLangChainModel({
        provider: "openai",
        modelId: "gpt-4o-mini",
        temperature: 0,
        maxTokens: 1000,
      });

      expect(model).toBeDefined();
      expect(model.constructor.name).toBe("ChatOpenAI");
    });
  });

  describe("classifyError", () => {
    const adapter = new OpenAIAdapter();

    it("returns RateLimitError for 429 status", () => {
      const error = { status: 429, message: "Rate limit exceeded" };
      const result = adapter.classifyError(error);
      expect(result).toBeInstanceOf(RateLimitError);
      expect(result.provider).toBe("openai");
    });

    it("returns AuthenticationError for 401 status", () => {
      const error = { status: 401, message: "Invalid API key" };
      const result = adapter.classifyError(error);
      expect(result).toBeInstanceOf(AuthenticationError);
    });

    it("returns ProviderUnavailableError for 503 status", () => {
      const error = { status: 503, message: "Service unavailable" };
      const result = adapter.classifyError(error);
      expect(result).toBeInstanceOf(ProviderUnavailableError);
    });
  });
});
