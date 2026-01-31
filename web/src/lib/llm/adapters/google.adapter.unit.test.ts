import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GoogleAdapter } from "./google.adapter";
import {
  RateLimitError,
  AuthenticationError,
  ProviderUnavailableError,
} from "../errors";

describe("GoogleAdapter", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isAvailable", () => {
    it("returns true when GOOGLE_GENERATIVE_AI_API_KEY is set", () => {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-api-key";
      const adapter = new GoogleAdapter();
      expect(adapter.isAvailable()).toBe(true);
    });

    it("returns false when GOOGLE_GENERATIVE_AI_API_KEY is not set", () => {
      delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      const adapter = new GoogleAdapter();
      expect(adapter.isAvailable()).toBe(false);
    });

    it("returns false when GOOGLE_GENERATIVE_AI_API_KEY is empty string", () => {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = "";
      const adapter = new GoogleAdapter();
      expect(adapter.isAvailable()).toBe(false);
    });
  });

  describe("provider", () => {
    it("returns 'google' as the provider name", () => {
      const adapter = new GoogleAdapter();
      expect(adapter.provider).toBe("google");
    });
  });

  describe("createLangChainModel", () => {
    it("creates a ChatGoogleGenerativeAI model with correct configuration", () => {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-api-key";
      const adapter = new GoogleAdapter();

      const model = adapter.createLangChainModel({
        provider: "google",
        modelId: "gemini-2.5-flash",
        temperature: 0,
        maxTokens: 1000,
      });

      expect(model).toBeDefined();
      expect(model.constructor.name).toBe("ChatGoogleGenerativeAI");
    });
  });

  describe("classifyError", () => {
    const adapter = new GoogleAdapter();

    it("returns RateLimitError for 429 status", () => {
      const error = { status: 429, message: "Rate limit exceeded" };
      const result = adapter.classifyError(error);
      expect(result).toBeInstanceOf(RateLimitError);
      expect(result.provider).toBe("google");
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
