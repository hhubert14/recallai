import { describe, it, expect } from "vitest";

const hasCredentials =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

describe.skipIf(!hasCredentials)("getRateLimiter integration", () => {
    it("should allow requests under the limit", async () => {
        const { getRateLimiter } = await import("./rate-limit");
        const limiter = getRateLimiter("/api/v1/chat");
        const testUserId = `test-user-${Date.now()}`;

        const result = await limiter.limit(testUserId);

        expect(result.success).toBe(true);
        expect(result.remaining).toBeGreaterThanOrEqual(0);
    });

    it("should block requests over the limit", async () => {
        const { getRateLimiter } = await import("./rate-limit");
        const limiter = getRateLimiter("/api/v1/chat");
        const testUserId = `test-user-burst-${Date.now()}`;

        const results = await Promise.all(
            Array.from({ length: 21 }, () => limiter.limit(testUserId))
        );

        const successCount = results.filter((r) => r.success).length;
        const failCount = results.filter((r) => !r.success).length;

        expect(successCount).toBe(20);
        expect(failCount).toBe(1);
    });
});
