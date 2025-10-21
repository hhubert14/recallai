# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RecallAI is an AI-powered video learning platform that transforms video watching into active learning through intelligent summaries and spaced repetition quizzes. The platform uses the Leitner box system for optimal knowledge retention.

**Tech Stack:**
- Next.js 15 (App Router, React Server Components)
- TypeScript
- Supabase (PostgreSQL + Auth) - currently migrating to Drizzle ORM
- Stripe (payments & subscriptions)
- OpenAI + LangChain (AI summarization & question generation)
- Vitest + React Testing Library

## Project Structure

```
web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/v1/            # API routes (versioned)
│   │   ├── auth/              # Auth pages (login, signup, etc.)
│   │   └── dashboard/         # Protected dashboard pages
│   ├── components/            # React components
│   │   ├── providers/         # Context providers
│   │   ├── subscription/      # Subscription-related UI
│   │   └── ui/                # Reusable UI components
│   ├── data-access/           # Database queries (currently Supabase, migrating to Drizzle)
│   ├── use-cases/             # Business logic layer
│   ├── drizzle/               # Drizzle ORM schema & migrations
│   └── lib/                   # Shared utilities
│       ├── stripe/            # Stripe integration
│       └── supabase/          # Supabase clients (auth only after migration)
├── docs/                      # Project documentation
│   ├── drizzle-migration-guide.md
│   └── testing-priorities.md
└── vitest.config.mts
```

## Database Architecture

### Current State: Dual-Database Migration

The project is **actively migrating** from Supabase client to Drizzle ORM:

- **Supabase client**: Keep for authentication only (`signIn`, `signUp`, `signOut`, etc.)
- **Drizzle ORM**: Use for all data queries (CRUD operations)
- **Schema location**: `src/drizzle/schema.ts` (auto-generated from existing Supabase tables)
- **Database**: PostgreSQL via Supabase (connection pooling with `prepare: false`)

**Important:** When writing database queries:
1. Use Drizzle for all data operations (select, insert, update, delete)
2. Keep Supabase auth client for authentication only
3. Import from `src/drizzle/index.ts` for database access
4. Follow patterns in `docs/drizzle-migration-guide.md`

### Core Tables

- `users` - User accounts (linked to Supabase auth)
- `videos` - YouTube videos processed by users
- `summaries` - AI-generated video summaries
- `questions` - Quiz questions for videos
- `question_options` - Multiple choice options
- `user_answers` - User quiz responses
- `user_question_progress` - Spaced repetition tracking (Leitner boxes)
- `subscriptions` - Stripe subscription data
- `extension_tokens` - Chrome extension authentication

## Critical Business Logic

### 1. Subscription Model

**Free Tier:**
- 5 videos per month
- Monthly counter resets automatically
- Videos expire after 7 days (`should_expire: true`)

**Premium Tier (via Stripe):**
- Unlimited videos
- Videos never expire (`should_expire: false`)
- Subscription statuses: `active`, `trialing`, `past_due`, `canceled`, `incomplete`
- Only `active` and `trialing` count as premium access

**Files:**
- `src/use-cases/extension/validate-subscription.ts`
- `src/app/api/v1/stripe/webhook/route.ts` (625 lines - critical!)

### 2. Spaced Repetition System (Leitner Boxes)

Implements a 5-box spaced repetition system for optimal learning:

```
Box 1: Review in 1 day (struggling)
Box 2: Review in 3 days
Box 3: Review in 7 days
Box 4: Review in 14 days
Box 5: Review in 30 days (mastered)
```

**Algorithm:**
- Correct answer → move up one box (max box 5)
- Incorrect answer → reset to box 1
- Tracks: `box_level`, `next_review_date`, `times_correct`, `times_incorrect`

**Files:**
- `src/data-access/user-question-progress/process-spaced-repetition-answer.ts`
- `src/data-access/user-question-progress/utils.ts`

### 3. Video Processing Pipeline

4-step AI processing for YouTube videos:

1. **Educational Check** - Is video worth processing?
2. **Create Video** - Store metadata in database
3. **Generate Summary** - OpenAI + LangChain summarization
4. **Generate Questions** - AI-generated quiz with 4 options each

**Validation Steps:**
- Authentication (extension token)
- Duplicate detection
- Subscription limit enforcement

**File:** `src/use-cases/extension/process-video.ts`

### 4. Stripe Webhook Handler ⚠️ MISSION CRITICAL

Handles 7 webhook event types with complex business logic:

- `checkout.session.completed` - Initial subscription
- `customer.subscription.created` - Subscription created
- `customer.subscription.updated` - Plan changes
- `customer.subscription.deleted` - Cancellations
- `invoice.payment_succeeded` - Successful payments
- `invoice.payment_failed` - Payment failures (immediate downgrade)
- `billing_portal.session.created` - Portal access

**Critical Features:**
- 4-step fallback strategy for user ID extraction
- Event deduplication (5-minute window, in-memory)
- Video expiry updates on subscription changes
- Downgrade grace period (existing videos not immediately deleted)

**File:** `src/app/api/v1/stripe/webhook/route.ts`

## Development Commands

### Running the App

```bash
npm run dev          # Start Next.js dev server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

### Testing

```bash
npm run test                    # Run all tests (Vitest)
npm run test -- --watch         # Watch mode (recommended during development)
npm run test -- --coverage      # With coverage report
npm run test -- <filename>      # Run specific test file
```

**Test Setup:**
- Framework: Vitest with jsdom environment
- Testing Library: React Testing Library + jest-dom matchers
- Setup file: `src/vitest-setup.ts`
- Config: `vitest.config.mts`

**Current Coverage:** Very minimal (only 1 test exists)
- See `docs/testing-priorities.md` for testing roadmap

### Database (Drizzle)

```bash
npm run db:generate  # Generate migration files from schema
npm run db:migrate   # Apply migrations to database
npm run db:push      # Push schema changes directly (faster for dev)
npm run db:studio    # Open Drizzle Studio (database GUI)
```

**Testing Drizzle Connection:**
```bash
npx tsx src/drizzle/test-connection.ts
```

### Stripe Webhooks (Local Development)

```bash
npm run stripe       # Forward webhooks to localhost:3000/api/v1/stripe/webhook
```

## Environment Variables

Required in `.env.local`:

```bash
# Supabase (Auth + Direct Connection)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (Drizzle) - Use Session mode (port 6543)
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# OpenAI
OPENAI_API_KEY=
```

## Code Patterns & Conventions

### 1. Database Queries (Drizzle)

**Select:**
```typescript
import { db, summaries } from "@/drizzle";
import { eq } from "drizzle-orm";

const result = await db
  .select()
  .from(summaries)
  .where(eq(summaries.videoId, videoId))
  .limit(1);
```

**Insert:**
```typescript
const [result] = await db
  .insert(summaries)
  .values({ videoId, content })
  .returning();
```

**Update:**
```typescript
await db
  .update(users)
  .set({ isSubscribed: true })
  .where(eq(users.id, userId));
```

**Relational Query:**
```typescript
const data = await db.query.questions.findMany({
  where: eq(questions.videoId, videoId),
  with: {
    options: {
      orderBy: (options, { asc }) => [asc(options.orderIndex)],
    }
  }
});
```

### 2. API Routes

All API routes are versioned under `/api/v1/`:

```typescript
// Example: src/app/api/v1/videos/[url]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { url: string } }
) {
  // Implementation
}
```

### 3. Type Safety

- Use Drizzle-inferred types: `typeof tableName.$inferSelect`
- Export types from `src/drizzle/schema.ts`
- Prefer type-safe queries over raw SQL

### 4. Error Handling

```typescript
try {
  // Database operation
} catch (error) {
  console.error("Error description:", error);
  return null; // or throw appropriate error
}
```

## Testing Strategy

**Co-located Tests:** Place test files next to source files with `.test.ts` suffix

```
src/use-cases/extension/
├── validate-subscription.ts
└── validate-subscription.test.ts
```

**Critical Areas Requiring Tests (Priority Order):**
1. Stripe webhook handler (`route.ts` - 625 lines)
2. Spaced repetition engine (`process-spaced-repetition-answer.ts`, `utils.ts`)
3. Subscription validation (`validate-subscription.ts`)
4. Video processing pipeline (`process-video.ts`)

See `docs/testing-priorities.md` for comprehensive testing roadmap.

## Migration Notes

### Drizzle Migration (In Progress)

**What to migrate:**
- All data queries in `src/data-access/` modules
- Any direct Supabase `.from()` calls for data operations

**What NOT to migrate:**
- Authentication (`signIn`, `signUp`, `signOut`, `getUser`, `getSession`)
- Supabase auth middleware
- Auth-related API routes

**Migration Pattern:**
```typescript
// BEFORE (Supabase)
const { data, error } = await supabase
  .from("videos")
  .select("*")
  .eq("user_id", userId);

// AFTER (Drizzle)
import { db, videos } from "@/drizzle";
import { eq } from "drizzle-orm";

const data = await db
  .select()
  .from(videos)
  .where(eq(videos.userId, userId));
```

See `docs/drizzle-migration-guide.md` for complete migration patterns.

## Common Pitfalls

1. **Don't use Transaction mode for DATABASE_URL** - Use Session mode (port 6543) or set `prepare: false`
2. **Don't migrate Supabase auth** - Only migrate data queries, keep auth with Supabase
3. **Don't skip webhook signature verification** - Always verify Stripe webhooks
4. **Don't forget subscription status checks** - Only `active` and `trialing` are premium
5. **Don't break spaced repetition logic** - Box calculations are critical for learning
6. **Test Stripe webhooks thoroughly** - They handle real money and subscription state

## Useful Resources

- **Drizzle Docs:** https://orm.drizzle.team/docs/overview
- **Next.js 15 Docs:** https://nextjs.org/docs
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **Stripe Webhooks:** https://stripe.com/docs/webhooks
