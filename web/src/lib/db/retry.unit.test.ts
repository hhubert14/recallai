import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { withRetry, RetryOptions, calculateDelay } from "./retry";
import { TransientDatabaseError, PermanentDatabaseError } from "./errors";

// Mock the logger
vi.mock("@/lib/logger", () => ({
  logger: {
    db: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  },
}));

describe("withRetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns result on first success", async () => {
    const operation = vi.fn().mockResolvedValue({ id: 1, name: "test" });

    const resultPromise = withRetry(operation, "TestOperation");
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toEqual({ id: 1, name: "test" });
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("retries on transient error and succeeds on second attempt", async () => {
    const transientError = { code: "CONNECT_TIMEOUT", message: "Connection timed out" };
    const operation = vi
      .fn()
      .mockRejectedValueOnce(transientError)
      .mockResolvedValueOnce({ success: true });

    const resultPromise = withRetry(operation, "TestOperation");
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toEqual({ success: true });
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("retries multiple times before succeeding", async () => {
    const transientError = { code: "ECONNREFUSED", message: "Connection refused" };
    const operation = vi
      .fn()
      .mockRejectedValueOnce(transientError)
      .mockRejectedValueOnce(transientError)
      .mockResolvedValueOnce({ success: true });

    const resultPromise = withRetry(operation, "TestOperation");
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toEqual({ success: true });
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("throws immediately for non-retryable errors (unique constraint)", async () => {
    const permanentError = { code: "23505", message: "Duplicate key value" };
    const operation = vi.fn().mockRejectedValue(permanentError);

    // Catch the rejection immediately to prevent unhandled rejection
    const resultPromise = withRetry(operation, "TestOperation").catch((e) => e);
    await vi.runAllTimersAsync();
    const error = await resultPromise;

    expect(error).toBeInstanceOf(PermanentDatabaseError);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("throws immediately for non-retryable errors (syntax error)", async () => {
    const permanentError = { code: "42601", message: "Syntax error" };
    const operation = vi.fn().mockRejectedValue(permanentError);

    const resultPromise = withRetry(operation, "TestOperation").catch((e) => e);
    await vi.runAllTimersAsync();
    const error = await resultPromise;

    expect(error).toBeInstanceOf(PermanentDatabaseError);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("throws after max retries exceeded", async () => {
    const transientError = { code: "CONNECT_TIMEOUT", message: "Connection timed out" };
    const operation = vi.fn().mockRejectedValue(transientError);

    const resultPromise = withRetry(operation, "TestOperation", { maxRetries: 3 }).catch(
      (e) => e
    );
    await vi.runAllTimersAsync();
    const error = await resultPromise;

    expect(error).toBeInstanceOf(TransientDatabaseError);
    expect(operation).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
  });

  it("respects custom maxRetries option", async () => {
    const transientError = { code: "ECONNRESET", message: "Connection reset" };
    const operation = vi.fn().mockRejectedValue(transientError);

    const resultPromise = withRetry(operation, "TestOperation", { maxRetries: 5 }).catch(
      (e) => e
    );
    await vi.runAllTimersAsync();
    const error = await resultPromise;

    expect(error).toBeInstanceOf(TransientDatabaseError);
    expect(operation).toHaveBeenCalledTimes(6); // 1 initial + 5 retries
  });

  it("logs retry attempts", async () => {
    const { logger } = await import("@/lib/logger");
    const transientError = { code: "CONNECT_TIMEOUT", message: "Connection timed out" };
    const operation = vi
      .fn()
      .mockRejectedValueOnce(transientError)
      .mockResolvedValueOnce({ success: true });

    const resultPromise = withRetry(operation, "TestOperation");
    await vi.runAllTimersAsync();
    await resultPromise;

    expect(logger.db.info).toHaveBeenCalledWith(
      expect.stringContaining("TestOperation"),
      expect.objectContaining({ attempt: 2 })
    );
  });

  it("logs when max retries exceeded", async () => {
    const { logger } = await import("@/lib/logger");
    const transientError = { code: "CONNECT_TIMEOUT", message: "Connection timed out" };
    const operation = vi.fn().mockRejectedValue(transientError);

    const resultPromise = withRetry(operation, "TestOperation", { maxRetries: 2 }).catch(
      (e) => e
    );
    await vi.runAllTimersAsync();
    const error = await resultPromise;

    expect(error).toBeInstanceOf(TransientDatabaseError);
    expect(logger.db.error).toHaveBeenCalledWith(
      expect.stringContaining("TestOperation"),
      expect.any(Object),
      expect.objectContaining({ maxRetries: 2 })
    );
  });

  it("handles standard Error objects as non-retryable", async () => {
    const standardError = new Error("Something went wrong");
    const operation = vi.fn().mockRejectedValue(standardError);

    const resultPromise = withRetry(operation, "TestOperation").catch((e) => e);
    await vi.runAllTimersAsync();
    const error = await resultPromise;

    expect(error).toBeInstanceOf(PermanentDatabaseError);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("waits between retries with exponential backoff", async () => {
    const transientError = { code: "CONNECT_TIMEOUT", message: "Connection timed out" };

    const operation = vi.fn().mockImplementation(() => {
      return Promise.reject(transientError);
    });

    const resultPromise = withRetry(operation, "TestOperation", {
      maxRetries: 2,
      baseDelayMs: 100,
      jitterFactor: 0, // Disable jitter for predictable timing
    }).catch((e) => e);

    // First call is immediate
    await vi.advanceTimersByTimeAsync(0);
    expect(operation).toHaveBeenCalledTimes(1);

    // Second call after ~100ms (baseDelay * 2^0)
    await vi.advanceTimersByTimeAsync(100);
    expect(operation).toHaveBeenCalledTimes(2);

    // Third call after ~200ms (baseDelay * 2^1)
    await vi.advanceTimersByTimeAsync(200);
    expect(operation).toHaveBeenCalledTimes(3);

    const error = await resultPromise;
    expect(error).toBeInstanceOf(TransientDatabaseError);
  });
});

describe("calculateDelay", () => {
  it("returns base delay for first retry (attempt 1)", () => {
    const delay = calculateDelay(1, { baseDelayMs: 100, maxDelayMs: 5000, jitterFactor: 0 });
    expect(delay).toBe(100);
  });

  it("doubles delay for each subsequent retry", () => {
    const options = { baseDelayMs: 100, maxDelayMs: 5000, jitterFactor: 0 };

    expect(calculateDelay(1, options)).toBe(100); // 100 * 2^0
    expect(calculateDelay(2, options)).toBe(200); // 100 * 2^1
    expect(calculateDelay(3, options)).toBe(400); // 100 * 2^2
    expect(calculateDelay(4, options)).toBe(800); // 100 * 2^3
  });

  it("caps delay at maxDelayMs", () => {
    const delay = calculateDelay(10, { baseDelayMs: 100, maxDelayMs: 1000, jitterFactor: 0 });
    expect(delay).toBe(1000);
  });

  it("adds jitter when jitterFactor is non-zero", () => {
    const options = { baseDelayMs: 100, maxDelayMs: 5000, jitterFactor: 0.3 };

    // Run multiple times to verify jitter produces varied results
    const delays = new Set<number>();
    for (let i = 0; i < 20; i++) {
      delays.add(calculateDelay(1, options));
    }

    // With 30% jitter on 100ms, delay should be between 70-130ms
    delays.forEach((delay) => {
      expect(delay).toBeGreaterThanOrEqual(70);
      expect(delay).toBeLessThanOrEqual(130);
    });

    // Should have some variation (not all the same)
    expect(delays.size).toBeGreaterThan(1);
  });

  it("uses default options when not provided", () => {
    const delay = calculateDelay(1);
    // Default baseDelayMs is 100, jitter is 0.3, so between 70-130
    expect(delay).toBeGreaterThanOrEqual(70);
    expect(delay).toBeLessThanOrEqual(130);
  });
});
