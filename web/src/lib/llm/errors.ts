import { LLMProvider } from "./types";

/**
 * Base error class for all LLM-related errors.
 */
export class LLMError extends Error {
  constructor(
    public readonly provider: LLMProvider,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "LLMError";
  }
}

/**
 * Error thrown when a provider rate limits the request.
 * This is retryable - the gateway should fall back to another provider.
 */
export class RateLimitError extends LLMError {
  constructor(
    provider: LLMProvider,
    public readonly retryAfterSeconds?: number
  ) {
    const retryMsg = retryAfterSeconds
      ? ` (retry after ${retryAfterSeconds}s)`
      : "";
    super(provider, `Provider ${provider} rate limit exceeded${retryMsg}`);
    this.name = "RateLimitError";
  }
}

/**
 * Error thrown when authentication fails (invalid or missing API key).
 * This is NOT retryable - the same provider will fail again.
 */
export class AuthenticationError extends LLMError {
  constructor(provider: LLMProvider) {
    super(
      provider,
      `Provider ${provider} authentication failed - check API key`
    );
    this.name = "AuthenticationError";
  }
}

/**
 * Error thrown when the requested model doesn't exist.
 * This is NOT retryable with the same model.
 */
export class ModelNotFoundError extends LLMError {
  constructor(
    provider: LLMProvider,
    public readonly modelId: string
  ) {
    super(provider, `Model ${modelId} not found on provider ${provider}`);
    this.name = "ModelNotFoundError";
  }
}

/**
 * Error thrown when the provider is temporarily unavailable.
 * This is retryable - the gateway should fall back to another provider.
 */
export class ProviderUnavailableError extends LLMError {
  constructor(provider: LLMProvider, cause?: unknown) {
    super(provider, `Provider ${provider} is temporarily unavailable`, cause);
    this.name = "ProviderUnavailableError";
  }
}

/**
 * Classifies an error from an LLM provider into a specific error type.
 * This enables proper fallback handling in the gateway.
 */
export function classifyError(provider: LLMProvider, error: unknown): LLMError {
  // Extract status code and message from various error shapes
  const status = getStatusCode(error);
  const message = getErrorMessage(error);
  const retryAfter = getRetryAfter(error);

  // Rate limit errors (429 or rate limit in message)
  if (status === 429 || /rate.?limit/i.test(message)) {
    return new RateLimitError(provider, retryAfter);
  }

  // Authentication errors (401, 403, or API key related)
  if (
    status === 401 ||
    status === 403 ||
    /invalid.?api.?key/i.test(message) ||
    /unauthorized/i.test(message)
  ) {
    return new AuthenticationError(provider);
  }

  // Model not found errors (404 with model-related message)
  if (status === 404 && /model/i.test(message)) {
    const modelMatch = message.match(/model[^:]*:\s*([^\s,]+)/i);
    const modelId = modelMatch ? modelMatch[1] : "unknown";
    return new ModelNotFoundError(provider, modelId);
  }

  // Provider unavailable (5xx errors or connection issues)
  if (status && status >= 500 && status < 600) {
    return new ProviderUnavailableError(provider, error);
  }

  // Connection errors
  if (
    /ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|network/i.test(message)
  ) {
    return new ProviderUnavailableError(provider, error);
  }

  // Generic LLM error for everything else
  return new LLMError(provider, message || "Unknown error", error);
}

/**
 * Determines if an error should trigger fallback to another provider.
 * Rate limits and provider unavailability are retryable.
 * Authentication and model errors are not.
 */
export function isRetryableError(error: LLMError): boolean {
  return (
    error instanceof RateLimitError ||
    error instanceof ProviderUnavailableError
  );
}

// Helper functions to extract info from various error shapes

function getStatusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  // Direct status property
  if ("status" in error && typeof error.status === "number") {
    return error.status;
  }

  // Nested response.status (common in fetch errors)
  if (
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response &&
    typeof error.response.status === "number"
  ) {
    return error.response.status;
  }

  return undefined;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return String(error);
}

function getRetryAfter(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  // Check headers for retry-after
  if ("headers" in error && typeof error.headers === "object" && error.headers !== null) {
    const headers = error.headers as Record<string, unknown>;
    const retryAfter = headers["retry-after"];
    if (typeof retryAfter === "string") {
      const seconds = parseInt(retryAfter, 10);
      if (!isNaN(seconds)) return seconds;
    }
    if (typeof retryAfter === "number") return retryAfter;
  }

  return undefined;
}
