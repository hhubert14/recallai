# API Rate Limiting (Future Task)

This document outlines the implementation of rate limiting for API endpoints, particularly the AI content generation endpoints.

## Problem

The content generation endpoints have no rate limiting:
- `POST /api/v1/questions/generate`
- `POST /api/v1/flashcards/generate`

These endpoints are expensive because they:
1. Call external AI services (OpenAI via LangChain)
2. Fetch video transcripts from external services
3. Perform database writes

Without rate limiting, users could:
- Accidentally spam the button (no debounce on UI)
- Intentionally abuse the API
- Incur unexpected costs from AI API calls

## Proposed Solution

### Option 1: Next.js Middleware with In-Memory Store

Simple solution for single-server deployments:

```typescript
// src/middleware.ts or src/lib/rate-limit.ts
import { LRUCache } from "lru-cache";

const rateLimitCache = new LRUCache<string, number[]>({
  max: 10000, // max users to track
  ttl: 60 * 1000, // 1 minute window
});

export function rateLimit(userId: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const requests = rateLimitCache.get(userId) || [];
  const windowStart = now - windowMs;

  // Filter to requests within window
  const recentRequests = requests.filter(time => time > windowStart);

  if (recentRequests.length >= limit) {
    return false; // Rate limited
  }

  recentRequests.push(now);
  rateLimitCache.set(userId, recentRequests);
  return true; // Allowed
}
```

Usage in API route:

```typescript
// src/app/api/v1/questions/generate/route.ts
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const { user } = await getAuthenticatedUser();

  if (!rateLimit(user.id, 5, 60 * 1000)) { // 5 requests per minute
    return jsendFail({ error: "Too many requests. Please wait a moment." }, 429);
  }

  // ... rest of handler
}
```

### Option 2: Upstash Redis Rate Limiting

Better for serverless/edge deployments:

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 requests per 60 seconds
  analytics: true,
});
```

Usage:

```typescript
const { success, limit, remaining, reset } = await rateLimiter.limit(user.id);

if (!success) {
  return jsendFail({
    error: "Too many requests. Please wait a moment.",
    retryAfter: reset,
  }, 429);
}
```

### Option 3: Database-Based Rate Limiting

Track requests in PostgreSQL (no additional services):

```sql
CREATE TABLE rate_limit_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  endpoint VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rate_limit_user_endpoint_time
ON rate_limit_requests(user_id, endpoint, created_at);
```

Query to check rate limit:

```typescript
const recentRequests = await db
  .select({ count: count() })
  .from(rateLimitRequests)
  .where(
    and(
      eq(rateLimitRequests.userId, userId),
      eq(rateLimitRequests.endpoint, endpoint),
      gte(rateLimitRequests.createdAt, new Date(Date.now() - windowMs))
    )
  );
```

## Recommended Limits

| Endpoint | Limit | Window | Rationale |
|----------|-------|--------|-----------|
| `/api/v1/questions/generate` | 5 | 1 minute | Expensive AI call |
| `/api/v1/flashcards/generate` | 5 | 1 minute | Expensive AI call |
| `/api/v1/videos/[url]/process` | 3 | 1 minute | Very expensive (full pipeline) |
| General API | 100 | 1 minute | Prevent abuse |

## UI Improvements

In addition to server-side rate limiting, add client-side protections:

1. **Disable button during generation** (already implemented)
2. **Add debounce** to prevent double-clicks:
   ```typescript
   const debouncedGenerate = useMemo(
     () => debounce(handleGenerate, 1000),
     [handleGenerate]
   );
   ```
3. **Show rate limit feedback** when 429 is returned:
   ```typescript
   if (response.status === 429) {
     setError("Please wait a moment before generating more content.");
   }
   ```

## Implementation Steps

1. Choose rate limiting strategy based on deployment:
   - Single server: Option 1 (in-memory)
   - Serverless/Vercel: Option 2 (Upstash Redis)
   - No external services: Option 3 (database)

2. Create rate limiting utility in `src/lib/rate-limit.ts`

3. Apply to expensive endpoints:
   - `src/app/api/v1/questions/generate/route.ts`
   - `src/app/api/v1/flashcards/generate/route.ts`

4. Add UI feedback for rate limit errors

5. Consider adding rate limit headers to responses:
   ```typescript
   return NextResponse.json(data, {
     headers: {
       "X-RateLimit-Limit": String(limit),
       "X-RateLimit-Remaining": String(remaining),
       "X-RateLimit-Reset": String(reset),
     },
   });
   ```

## Priority

Medium - Not critical for launch but should be implemented before significant user growth to prevent abuse and control costs.

## Environment Variables (if using Upstash)

```bash
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
```
