import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Rate limit configuration per route.
 * Add new routes here as needed.
 */
const rateLimitConfigs = {
    "/api/v1/chat": { max: 20, windowSeconds: 60 },
    "/api/v1/practice/group-concepts": { max: 10, windowSeconds: 60 },
    "/api/v1/practice/chat": { max: 20, windowSeconds: 60 },
    "/api/v1/practice/generate-feedback": { max: 10, windowSeconds: 60 },
} as const;

export type RateLimitedRoute = keyof typeof rateLimitConfigs;

/**
 * Get a rate limiter for a specific route.
 *
 * Note: No caching needed - Ratelimit instances are lightweight,
 * and actual state lives in Redis. Serverless cold starts would
 * invalidate any module-level cache anyway.
 *
 * @throws Error if route is not configured (runtime safety for JS callers)
 */
export function getRateLimiter(route: RateLimitedRoute): Ratelimit {
    const config = rateLimitConfigs[route];

    if (!config) {
        throw new Error(
            `Rate limit not configured for route: ${route}. ` +
            `Add it to rateLimitConfigs in rate-limit.ts`
        );
    }

    return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.max, `${config.windowSeconds} s`),
        prefix: `ratelimit:${route}`,
    });
}
