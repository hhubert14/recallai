import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GroqAdapter } from "./groq.adapter";
import {
  RateLimitError,
  AuthenticationError,
  ProviderUnavailableError,
} from "../errors";

describe("GroqAdapter", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isAvailable", () => {
    it("returns true when GROQ_API_KEY is set", () => {
      process.env.GROQ_API_KEY = "test-api-key";
      const adapter = new GroqAdapter();
      expect(adapter.isAvailable()).toBe(true);
    });

    it("returns false when GROQ_API_KEY is not set", () => {
      delete process.env.GROQ_API_KEY;
      const adapter = new GroqAdapter();
      expect(adapter.isAvailable()).toBe(false);
    });

    it("returns false when GROQ_API_KEY is empty string", () => {
      process.env.GROQ_API_KEY = "";
      const adapter = new GroqAdapter();
      expect(adapter.isAvailable()).toBe(false);
    });
  });

  describe("provider", () => {
    it("returns 'groq' as the provider name", () => {
      const adapter = new GroqAdapter();
      expect(adapter.provider).toBe("groq");
    });
  });

  describe("createLangChainModel", () => {
    it("creates a ChatGroq model with correct configuration", () => {
      process.env.GROQ_API_KEY = "test-api-key";
      const adapter = new GroqAdapter();

      const model = adapter.createLangChainModel({
        provider: "groq",
        modelId: "llama-3.3-70b-versatile",
        temperature: 0,
        maxTokens: 1000,
      });

      // Verify model is created (we can't easily inspect ChatGroq internals)
      expect(model).toBeDefined();
      expect(model.constructor.name).toBe("ChatGroq");
    });

    it("uses default temperature when not provided", () => {
      process.env.GROQ_API_KEY = "test-api-key";
      const adapter = new GroqAdapter();

      const model = adapter.createLangChainModel({
        provider: "groq",
        modelId: "llama-3.3-70b-versatile",
      });

      expect(model).toBeDefined();
    });
  });

  describe("classifyError", () => {
    const adapter = new GroqAdapter();

    it("returns RateLimitError for 429 status", () => {
      const error = { status: 429, message: "Rate limit exceeded" };
      const result = adapter.classifyError(error);
      expect(result).toBeInstanceOf(RateLimitError);
      expect(result.provider).toBe("groq");
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
