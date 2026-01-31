import { describe, it, expect } from "vitest";
import {
  LLMError,
  RateLimitError,
  AuthenticationError,
  ModelNotFoundError,
  ProviderUnavailableError,
  classifyError,
  isRetryableError,
} from "./errors";

describe("LLM Errors", () => {
  describe("error classes", () => {
    it("creates RateLimitError with provider and optional retry info", () => {
      const error = new RateLimitError("groq", 60);
      expect(error.provider).toBe("groq");
      expect(error.retryAfterSeconds).toBe(60);
      expect(error.message).toContain("groq");
      expect(error.message).toContain("rate limit");
    });

    it("creates AuthenticationError with provider", () => {
      const error = new AuthenticationError("google");
      expect(error.provider).toBe("google");
      expect(error.message).toContain("google");
      expect(error.message).toContain("authentication");
    });

    it("creates ModelNotFoundError with provider and modelId", () => {
      const error = new ModelNotFoundError("groq", "invalid-model");
      expect(error.provider).toBe("groq");
      expect(error.modelId).toBe("invalid-model");
      expect(error.message).toContain("invalid-model");
    });

    it("creates ProviderUnavailableError with provider", () => {
      const error = new ProviderUnavailableError("cerebras");
      expect(error.provider).toBe("cerebras");
      expect(error.message).toContain("cerebras");
    });
  });

  describe("classifyError", () => {
    it("returns RateLimitError for 429 status", () => {
      const originalError = { status: 429, message: "Too many requests" };
      const result = classifyError("groq", originalError);
      expect(result).toBeInstanceOf(RateLimitError);
      expect(result.provider).toBe("groq");
    });

    it("returns RateLimitError for rate limit message", () => {
      const originalError = new Error("Rate limit exceeded");
      const result = classifyError("google", originalError);
      expect(result).toBeInstanceOf(RateLimitError);
    });

    it("returns AuthenticationError for 401 status", () => {
      const originalError = { status: 401, message: "Unauthorized" };
      const result = classifyError("groq", originalError);
      expect(result).toBeInstanceOf(AuthenticationError);
    });

    it("returns AuthenticationError for 403 status", () => {
      const originalError = { status: 403, message: "Forbidden" };
      const result = classifyError("google", originalError);
      expect(result).toBeInstanceOf(AuthenticationError);
    });

    it("returns AuthenticationError for invalid API key message", () => {
      const originalError = new Error("Invalid API key provided");
      const result = classifyError("openai", originalError);
      expect(result).toBeInstanceOf(AuthenticationError);
    });

    it("returns ModelNotFoundError for 404 status with model message", () => {
      const originalError = {
        status: 404,
        message: "Model not found: gpt-5-turbo",
      };
      const result = classifyError("openai", originalError);
      expect(result).toBeInstanceOf(ModelNotFoundError);
    });

    it("returns ProviderUnavailableError for 500 status", () => {
      const originalError = { status: 500, message: "Internal server error" };
      const result = classifyError("groq", originalError);
      expect(result).toBeInstanceOf(ProviderUnavailableError);
    });

    it("returns ProviderUnavailableError for 502 status", () => {
      const originalError = { status: 502, message: "Bad gateway" };
      const result = classifyError("cerebras", originalError);
      expect(result).toBeInstanceOf(ProviderUnavailableError);
    });

    it("returns ProviderUnavailableError for 503 status", () => {
      const originalError = { status: 503, message: "Service unavailable" };
      const result = classifyError("openrouter", originalError);
      expect(result).toBeInstanceOf(ProviderUnavailableError);
    });

    it("returns ProviderUnavailableError for connection errors", () => {
      const originalError = new Error("ECONNREFUSED");
      const result = classifyError("groq", originalError);
      expect(result).toBeInstanceOf(ProviderUnavailableError);
    });

    it("returns generic LLMError for unknown errors", () => {
      const originalError = new Error("Something unexpected happened");
      const result = classifyError("groq", originalError);
      expect(result).toBeInstanceOf(LLMError);
      expect(result).not.toBeInstanceOf(RateLimitError);
      expect(result).not.toBeInstanceOf(AuthenticationError);
    });

    it("extracts retry-after from headers when available", () => {
      const originalError = {
        status: 429,
        message: "Too many requests",
        headers: { "retry-after": "30" },
      };
      const result = classifyError("groq", originalError);
      expect(result).toBeInstanceOf(RateLimitError);
      expect((result as RateLimitError).retryAfterSeconds).toBe(30);
    });
  });

  describe("isRetryableError", () => {
    it("returns true for RateLimitError", () => {
      const error = new RateLimitError("groq");
      expect(isRetryableError(error)).toBe(true);
    });

    it("returns true for ProviderUnavailableError", () => {
      const error = new ProviderUnavailableError("groq");
      expect(isRetryableError(error)).toBe(true);
    });

    it("returns false for AuthenticationError", () => {
      const error = new AuthenticationError("groq");
      expect(isRetryableError(error)).toBe(false);
    });

    it("returns false for ModelNotFoundError", () => {
      const error = new ModelNotFoundError("groq", "invalid-model");
      expect(isRetryableError(error)).toBe(false);
    });

    it("returns false for generic LLMError", () => {
      const error = new LLMError("groq", "Something went wrong");
      expect(isRetryableError(error)).toBe(false);
    });
  });
});
