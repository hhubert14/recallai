import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@upstash/redis", () => ({
    Redis: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("@upstash/ratelimit", () => {
    const MockRatelimit = vi.fn().mockImplementation(() => ({
        limit: vi.fn(),
    })) as ReturnType<typeof vi.fn> & { slidingWindow: ReturnType<typeof vi.fn> };
    MockRatelimit.slidingWindow = vi.fn().mockReturnValue("sliding-window-config");
    return { Ratelimit: MockRatelimit };
});

describe("getRateLimiter", () => {
    beforeEach(() => {
        vi.resetModules();
        process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
        process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    });

    it("should return limiter for configured route", async () => {
        const { getRateLimiter } = await import("./rate-limit");
        const limiter = getRateLimiter("/api/v1/chat");
        expect(limiter).toBeDefined();
        expect(limiter.limit).toBeDefined();
    });

    it("should create limiter with correct prefix based on route", async () => {
        const { Ratelimit } = await import("@upstash/ratelimit");
        const { getRateLimiter } = await import("./rate-limit");

        getRateLimiter("/api/v1/chat");

        expect(Ratelimit).toHaveBeenCalledWith(
            expect.objectContaining({
                prefix: "ratelimit:/api/v1/chat",
            })
        );
    });

    it("should return success true when under limit", async () => {
        const { Ratelimit } = await import("@upstash/ratelimit");
        const mockLimit = vi.fn().mockResolvedValue({ success: true, remaining: 19 });
        vi.mocked(Ratelimit).mockImplementation(() => ({ limit: mockLimit }) as any);

        const { getRateLimiter } = await import("./rate-limit");
        const limiter = getRateLimiter("/api/v1/chat");
        const result = await limiter.limit("user-123");

        expect(result.success).toBe(true);
    });

    it("should return success false when over limit", async () => {
        const { Ratelimit } = await import("@upstash/ratelimit");
        const mockLimit = vi.fn().mockResolvedValue({ success: false, remaining: 0 });
        vi.mocked(Ratelimit).mockImplementation(() => ({ limit: mockLimit }) as any);

        const { getRateLimiter } = await import("./rate-limit");
        const limiter = getRateLimiter("/api/v1/chat");
        const result = await limiter.limit("user-123");

        expect(result.success).toBe(false);
    });

    it("should throw error for unconfigured route", async () => {
        const { getRateLimiter } = await import("./rate-limit");

        // Bypass TypeScript to test runtime validation
        expect(() => getRateLimiter("/api/v1/unknown" as any)).toThrow(
            "Rate limit not configured for route: /api/v1/unknown"
        );
    });
});
