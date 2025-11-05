# Drizzle ORM Migration Guide

Complete guide for migrating RecallAI from Supabase client to Drizzle ORM.

## Table of Contents
1. [Why Drizzle?](#why-drizzle)
2. [Installation](#installation)
3. [Database Schema Setup](#database-schema-setup)
4. [Database Connection](#database-connection)
5. [Configuration](#configuration)
6. [Migration Patterns](#migration-patterns)
7. [Common Queries](#common-queries)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Why Drizzle?

**Chosen over Prisma because:**
- ✅ Better performance for complex queries (2-3x faster)
- ✅ Type-safe aggregations (Prisma requires raw SQL)
- ✅ Smaller bundle size (~30KB vs 300KB+)
- ✅ Direct SQL control with type safety
- ✅ Better for learning SQL
- ✅ Easier migration from Supabase (similar syntax)

---

## Installation

### Step 1: Install Dependencies

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

**Packages:**
- `drizzle-orm` - Type-safe ORM
- `postgres` - PostgreSQL driver (works with Supabase)
- `drizzle-kit` - Schema management & migrations

### Step 2: Verify Installation

```bash
npx drizzle-kit --version
```

Should output version number (e.g., `0.20.x`)

---

## Database Schema Setup

### Step 1: Create Schema File

Create `src/db/schema.ts`:

```typescript
import { pgTable, uuid, text, bigint, timestamp, boolean, smallint, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// ENUMS
// ============================================

export const platformEnum = pgEnum('platform', ['YouTube']);

export const processingModeEnum = pgEnum('processing_mode', ['auto', 'manual']);

export const subscriptionStatusEnum = pgEnum('status', [
  'active',
  'past_due',
  'canceled',
  'trialing',
  'incomplete'
]);

// ============================================
// TABLES
// ============================================

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  isSubscribed: boolean('is_subscribed').notNull().default(false),
  monthlyVideoCount: smallint('monthly_video_count').notNull().default(0),
  lastResetDate: timestamp('last_reset_date', { withTimezone: true }).notNull().defaultNow(),
  processingMode: processingModeEnum('processing_mode').notNull().default('auto'),
  stripeCustomerId: text('stripe_customer_id').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  stripeCustomerIdIdx: index('users_stripe_customer_id_idx').on(table.stripeCustomerId),
}));

// Videos table
export const videos = pgTable('videos', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('user_id').notNull().references(() => users.id),
  platform: platformEnum('platform').notNull().default('YouTube'),
  title: text('title').notNull(),
  channelName: text('channel_name'),
  duration: bigint('duration', { mode: 'number' }),
  category: text('category'),
  url: text('url').notNull(),
  description: text('description'),
  videoId: text('video_id'),
  shouldExpire: boolean('should_expire').notNull().default(true),
  expiryDate: timestamp('expiry_date', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('videos_user_id_idx').on(table.userId),
  deletedAtIdx: index('videos_deleted_at_idx').on(table.deletedAt),
}));

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('user_id').notNull().references(() => users.id),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  status: subscriptionStatusEnum('status').notNull(),
  plan: text('plan').notNull(),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  canceledAt: timestamp('canceled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  stripeSubscriptionIdIdx: index('subscriptions_stripe_subscription_id_idx').on(table.stripeSubscriptionId),
  userIdIdx: index('subscriptions_user_id_idx').on(table.userId),
}));

// Questions table
export const questions = pgTable('questions', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  videoId: bigint('video_id', { mode: 'number' }).notNull().references(() => videos.id),
  questionText: text('question_text').notNull(),
  questionType: text('question_type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  videoIdIdx: index('questions_video_id_idx').on(table.videoId),
}));

// Question options table
export const questionOptions = pgTable('question_options', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  questionId: bigint('question_id', { mode: 'number' }).notNull().references(() => questions.id),
  optionText: text('option_text').notNull(),
  isCorrect: boolean('is_correct').notNull().default(false),
  explanation: text('explanation'),
  orderIndex: smallint('order_index').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  questionIdIdx: index('question_options_question_id_idx').on(table.questionId),
}));

// Summaries table
export const summaries = pgTable('summaries', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  videoId: bigint('video_id', { mode: 'number' }).notNull().references(() => videos.id).unique(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  videoIdIdx: index('summaries_video_id_idx').on(table.videoId),
}));

// User answers table
export const userAnswers = pgTable('user_answers', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('user_id').notNull().references(() => users.id),
  questionId: bigint('question_id', { mode: 'number' }).notNull().references(() => questions.id),
  selectedOptionId: bigint('selected_option_id', { mode: 'number' }).references(() => questionOptions.id),
  textAnswer: text('text_answer'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('user_answers_user_id_idx').on(table.userId),
  questionIdIdx: index('user_answers_question_id_idx').on(table.questionId),
}));

// User question progress table (spaced repetition)
export const userQuestionProgress = pgTable('user_question_progress', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('user_id').notNull().references(() => users.id),
  questionId: bigint('question_id', { mode: 'number' }).notNull().references(() => questions.id),
  boxLevel: smallint('box_level').notNull().default(1),
  nextReviewDate: timestamp('next_review_date', { withTimezone: true }).notNull(),
  timesCorrect: smallint('times_correct').notNull().default(0),
  timesIncorrect: smallint('times_incorrect').notNull().default(0),
  lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('user_question_progress_user_id_idx').on(table.userId),
  questionIdIdx: index('user_question_progress_question_id_idx').on(table.questionId),
  nextReviewDateIdx: index('user_question_progress_next_review_date_idx').on(table.nextReviewDate),
}));

// Extension tokens table
export const extensionTokens = pgTable('extension_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tokenIdx: index('extension_tokens_token_idx').on(table.token),
  userIdIdx: index('extension_tokens_user_id_idx').on(table.userId),
}));

// ============================================
// RELATIONS (for joins)
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  videos: many(videos),
  subscriptions: many(subscriptions),
  userAnswers: many(userAnswers),
  userQuestionProgress: many(userQuestionProgress),
  extensionTokens: many(extensionTokens),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  questions: many(questions),
  summary: one(summaries),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  video: one(videos, {
    fields: [questions.videoId],
    references: [videos.id],
  }),
  options: many(questionOptions),
  userAnswers: many(userAnswers),
  userProgress: many(userQuestionProgress),
}));

export const questionOptionsRelations = relations(questionOptions, ({ one, many }) => ({
  question: one(questions, {
    fields: [questionOptions.questionId],
    references: [questions.id],
  }),
  userAnswers: many(userAnswers),
}));

export const summariesRelations = relations(summaries, ({ one }) => ({
  video: one(videos, {
    fields: [summaries.videoId],
    references: [videos.id],
  }),
}));

export const userAnswersRelations = relations(userAnswers, ({ one }) => ({
  user: one(users, {
    fields: [userAnswers.userId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [userAnswers.questionId],
    references: [questions.id],
  }),
  selectedOption: one(questionOptions, {
    fields: [userAnswers.selectedOptionId],
    references: [questionOptions.id],
  }),
}));

export const userQuestionProgressRelations = relations(userQuestionProgress, ({ one }) => ({
  user: one(users, {
    fields: [userQuestionProgress.userId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [userQuestionProgress.questionId],
    references: [questions.id],
  }),
}));

export const extensionTokensRelations = relations(extensionTokens, ({ one }) => ({
  user: one(users, {
    fields: [extensionTokens.userId],
    references: [users.id],
  }),
}));
```

### Step 2: Create Type Exports

Add to the bottom of `src/db/schema.ts`:

```typescript
// Export types for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type QuestionOption = typeof questionOptions.$inferSelect;
export type NewQuestionOption = typeof questionOptions.$inferInsert;

export type Summary = typeof summaries.$inferSelect;
export type NewSummary = typeof summaries.$inferInsert;

export type UserAnswer = typeof userAnswers.$inferSelect;
export type NewUserAnswer = typeof userAnswers.$inferInsert;

export type UserQuestionProgress = typeof userQuestionProgress.$inferSelect;
export type NewUserQuestionProgress = typeof userQuestionProgress.$inferInsert;

export type ExtensionToken = typeof extensionTokens.$inferSelect;
export type NewExtensionToken = typeof extensionTokens.$inferInsert;
```

---

## Database Connection

### Step 1: Create Database Client

Create `src/db/index.ts`:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Disable prefetch as it's not supported for "Transaction" pool mode
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres client
const client = postgres(connectionString, {
  prepare: false // Required for Supabase connection pooling
});

// Create Drizzle instance with schema for relational queries
export const db = drizzle(client, { schema });

// Export schema for use in queries
export * from './schema';
```

### Step 2: Environment Configuration

Add to `.env.local`:

```bash
# Supabase Direct Connection (get from Supabase Dashboard)
# Settings → Database → Connection string → Direct connection (Session mode)
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

**Where to find it:**
1. Go to Supabase Dashboard
2. Project Settings → Database
3. Connection string → **Session mode** (NOT Transaction mode)
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password

**Important:** Use Session mode (port 6543) not Transaction mode (port 5432) for compatibility with Drizzle.

---

## Configuration

### Create Drizzle Config

Create `drizzle.config.ts` in the root:

```typescript
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### Add Scripts to package.json

Add to `scripts` section:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

**Commands:**
- `npm run db:generate` - Generate migration files from schema
- `npm run db:migrate` - Apply migrations to database
- `npm run db:push` - Push schema changes directly (faster for dev)
- `npm run db:studio` - Open Drizzle Studio (database GUI)

---

## Migration Patterns

### Pattern 1: Simple Select

**Before (Supabase):**
```typescript
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function getSummaryByVideoId(videoId: number) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("summaries")
    .select("*")
    .eq("video_id", videoId)
    .single();

  if (error) {
    console.error("Error fetching summary:", error);
    return null;
  }

  return data;
}
```

**After (Drizzle):**
```typescript
import { db, summaries } from "@/db";
import { eq } from "drizzle-orm";

export async function getSummaryByVideoId(videoId: number) {
  try {
    const result = await db
      .select()
      .from(summaries)
      .where(eq(summaries.videoId, videoId))
      .limit(1);

    return result[0] ?? null;
  } catch (error) {
    console.error("Error fetching summary:", error);
    return null;
  }
}
```

### Pattern 2: Insert

**Before (Supabase):**
```typescript
const { data, error } = await supabase
  .from("summaries")
  .insert({
    video_id: videoId,
    content: summaryContent,
  })
  .select()
  .single();
```

**After (Drizzle):**
```typescript
import { db, summaries } from "@/db";

const [result] = await db
  .insert(summaries)
  .values({
    videoId,
    content: summaryContent,
  })
  .returning();
```

### Pattern 3: Update

**Before (Supabase):**
```typescript
const { error } = await supabase
  .from("users")
  .update({ is_subscribed: true })
  .eq("id", userId);
```

**After (Drizzle):**
```typescript
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

await db
  .update(users)
  .set({ isSubscribed: true })
  .where(eq(users.id, userId));
```

### Pattern 4: Delete (Soft Delete)

**Before (Supabase):**
```typescript
const { error } = await supabase
  .from("videos")
  .update({ deleted_at: new Date().toISOString() })
  .eq("id", videoId);
```

**After (Drizzle):**
```typescript
import { db, videos } from "@/db";
import { eq } from "drizzle-orm";

await db
  .update(videos)
  .set({ deletedAt: new Date() })
  .where(eq(videos.id, videoId));
```

### Pattern 5: Multiple Conditions

**Before (Supabase):**
```typescript
const { data } = await supabase
  .from("videos")
  .select("*")
  .eq("user_id", userId)
  .is("deleted_at", null)
  .order("created_at", { ascending: false });
```

**After (Drizzle):**
```typescript
import { db, videos } from "@/db";
import { eq, isNull, desc, and } from "drizzle-orm";

const data = await db
  .select()
  .from(videos)
  .where(
    and(
      eq(videos.userId, userId),
      isNull(videos.deletedAt)
    )
  )
  .orderBy(desc(videos.createdAt));
```

### Pattern 6: Joins (Nested Relations)

**Before (Supabase):**
```typescript
const { data } = await supabase
  .from("questions")
  .select(`
    *,
    videos (
      id,
      title
    ),
    question_options (
      id,
      option_text,
      is_correct
    )
  `)
  .eq("video_id", videoId);
```

**After (Drizzle - Relational Query):**
```typescript
import { db } from "@/db";
import { eq } from "drizzle-orm";

const data = await db.query.questions.findMany({
  where: eq(questions.videoId, videoId),
  with: {
    video: {
      columns: {
        id: true,
        title: true,
      }
    },
    options: {
      columns: {
        id: true,
        optionText: true,
        isCorrect: true,
      }
    }
  }
});
```

**After (Drizzle - Manual Join):**
```typescript
import { db, questions, videos, questionOptions } from "@/db";
import { eq } from "drizzle-orm";

const data = await db
  .select({
    question: questions,
    video: {
      id: videos.id,
      title: videos.title,
    },
    options: questionOptions,
  })
  .from(questions)
  .leftJoin(videos, eq(questions.videoId, videos.id))
  .leftJoin(questionOptions, eq(questions.id, questionOptions.questionId))
  .where(eq(questions.videoId, videoId));
```

### Pattern 7: Aggregations

**Before (Supabase - requires multiple queries):**
```typescript
const { data: answers } = await supabase
  .from("user_answers")
  .select("*, question_options(is_correct)")
  .eq("user_id", userId);

const totalAnswers = answers.length;
const correctAnswers = answers.filter(a => a.question_options?.is_correct).length;
const accuracy = (correctAnswers / totalAnswers) * 100;
```

**After (Drizzle - single query):**
```typescript
import { db, userAnswers, questionOptions } from "@/db";
import { eq, count, sql } from "drizzle-orm";

const [result] = await db
  .select({
    totalAnswers: count(),
    correctAnswers: count(sql`CASE WHEN ${questionOptions.isCorrect} THEN 1 END`),
    accuracy: sql<number>`
      (COUNT(CASE WHEN ${questionOptions.isCorrect} THEN 1 END)::float /
       COUNT(*)::float * 100)
    `,
  })
  .from(userAnswers)
  .leftJoin(questionOptions, eq(userAnswers.selectedOptionId, questionOptions.id))
  .where(eq(userAnswers.userId, userId));
```

---

## Common Queries

### Get All Videos (Non-Deleted)

```typescript
import { db, videos } from "@/db";
import { eq, isNull, and, desc } from "drizzle-orm";

export async function getVideosByUserId(userId: string) {
  return await db
    .select()
    .from(videos)
    .where(
      and(
        eq(videos.userId, userId),
        isNull(videos.deletedAt)
      )
    )
    .orderBy(desc(videos.createdAt));
}
```

### Get Questions with Options (Relational)

```typescript
import { db, questions } from "@/db";
import { eq } from "drizzle-orm";

export async function getQuestionsByVideoId(videoId: number) {
  return await db.query.questions.findMany({
    where: eq(questions.videoId, videoId),
    with: {
      options: {
        orderBy: (options, { asc }) => [asc(options.orderIndex)],
      }
    }
  });
}
```

### Create Video

```typescript
import { db, videos, type NewVideo } from "@/db";

export async function createVideo(data: NewVideo) {
  const [video] = await db
    .insert(videos)
    .values(data)
    .returning();

  return video;
}
```

### Update Subscription by Stripe ID

```typescript
import { db, subscriptions } from "@/db";
import { eq } from "drizzle-orm";

export async function updateSubscriptionByStripeId(
  stripeSubscriptionId: string,
  updateData: Partial<typeof subscriptions.$inferInsert>
) {
  const [updated] = await db
    .update(subscriptions)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .returning();

  return updated;
}
```

### Get Questions Due for Review (Spaced Repetition)

```typescript
import { db, userQuestionProgress } from "@/db";
import { eq, lte, and, asc } from "drizzle-orm";

export async function getQuestionsDueForReview(userId: string) {
  return await db.query.userQuestionProgress.findMany({
    where: and(
      eq(userQuestionProgress.userId, userId),
      lte(userQuestionProgress.nextReviewDate, new Date())
    ),
    with: {
      question: {
        with: {
          video: true,
          options: {
            orderBy: (options, { asc }) => [asc(options.orderIndex)],
          }
        }
      }
    },
    orderBy: [asc(userQuestionProgress.boxLevel)],
  });
}
```

---

## Testing

### Test Database Connection

Create `src/db/test-connection.ts`:

```typescript
import { db, users } from './index';

async function testConnection() {
  try {
    console.log('Testing Drizzle connection...');

    const result = await db.select().from(users).limit(1);

    console.log('✅ Connection successful!');
    console.log('Sample user:', result[0]);

    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

testConnection();
```

Run test:
```bash
npx tsx src/db/test-connection.ts
```

### Test a Simple Query

Create `src/db/test-query.ts`:

```typescript
import { db, videos } from './index';
import { eq, isNull, and } from 'drizzle-orm';

async function testQuery() {
  try {
    // Replace with actual user ID from your database
    const userId = 'your-user-id-here';

    const userVideos = await db
      .select()
      .from(videos)
      .where(
        and(
          eq(videos.userId, userId),
          isNull(videos.deletedAt)
        )
      )
      .limit(5);

    console.log('✅ Query successful!');
    console.log(`Found ${userVideos.length} videos`);
    console.log(userVideos);

    process.exit(0);
  } catch (error) {
    console.error('❌ Query failed:', error);
    process.exit(1);
  }
}

testQuery();
```

Run test:
```bash
npx tsx src/db/test-query.ts
```

---

## Troubleshooting

### Issue: "prepare is not supported in transaction pool mode"

**Solution:** Add `prepare: false` to postgres client:

```typescript
const client = postgres(connectionString, {
  prepare: false
});
```

### Issue: Environment variable not found

**Error:** `DATABASE_URL environment variable is not set`

**Solution:**
1. Ensure `.env.local` exists with `DATABASE_URL`
2. Restart your dev server
3. For scripts, use `dotenv`: `npx dotenv -e .env.local tsx src/db/test.ts`

### Issue: Type errors with bigint

**Error:** `Type 'bigint' is not assignable to type 'number'`

**Solution:** Use `{ mode: 'number' }` in schema:

```typescript
id: bigint('id', { mode: 'number' }).primaryKey()
```

### Issue: Relation not found in query

**Error:** `Property 'options' does not exist`

**Solution:** Ensure you've:
1. Defined the relation in `schema.ts`
2. Exported relations in `schema.ts`
3. Passed `{ schema }` to `drizzle()` in `db/index.ts`

```typescript
// In db/index.ts
export const db = drizzle(client, { schema }); // ← Must include this
```

### Issue: Migration conflicts

**Error:** `column "user_id" already exists`

**Solution:** You're connecting to existing Supabase DB - no migrations needed!
- Skip `npm run db:generate` and `npm run db:migrate`
- Schema is already in Supabase
- Just use Drizzle to query existing tables

---

## Migration Checklist

### Phase 1: Setup
- [ ] Install dependencies (`drizzle-orm`, `postgres`, `drizzle-kit`)
- [ ] Create `src/db/schema.ts` with all tables
- [ ] Create `src/db/index.ts` with database connection
- [ ] Add `DATABASE_URL` to `.env.local`
- [ ] Create `drizzle.config.ts`
- [ ] Test connection with `test-connection.ts`

### Phase 2: Simple Modules
- [ ] Migrate `summaries` module (1 file)
- [ ] Migrate `extension` module (1 file)
- [ ] Test queries work correctly

### Phase 3: Core Modules
- [ ] Migrate `subscriptions` module (6 files)
- [ ] Migrate `videos` module (8 files)
- [ ] Migrate `questions` module (3 files)
- [ ] Test all CRUD operations

### Phase 4: Complex Modules
- [ ] Migrate `user-question-progress` module (9 files - spaced repetition)
- [ ] Migrate `user-stats` module (8 files - aggregations)
- [ ] Migrate `user-answers` module (2 files)
- [ ] Test complex queries and aggregations

### Phase 5: Integration
- [ ] Update all API routes to use Drizzle
- [ ] Update Server Actions to use Drizzle
- [ ] Remove Supabase client imports (keep auth client)
- [ ] Test entire application end-to-end

### Phase 6: Cleanup
- [ ] Remove unused Supabase service role client
- [ ] Update types imports to use Drizzle types
- [ ] Remove old data-access type files
- [ ] Update documentation

---

## Additional Resources

- **Drizzle Docs:** https://orm.drizzle.team/docs/overview
- **Query Examples:** https://orm.drizzle.team/docs/rqb
- **Schema Reference:** https://orm.drizzle.team/docs/sql-schema-declaration
- **Operators:** https://orm.drizzle.team/docs/operators

---

## Notes

- **Supabase Auth:** Keep using `@supabase/supabase-js` for authentication
  - Only migrate data queries to Drizzle
  - Auth functions (`signIn`, `signUp`, `signOut`) stay with Supabase

- **Coexistence:** Drizzle and Supabase can run side-by-side during migration
  - Migrate one module at a time
  - Test thoroughly before moving to next module

- **Performance:** Drizzle queries are typically 2-3x faster than Supabase PostgREST
  - Especially noticeable in aggregations and complex joins

- **Type Safety:** All queries are fully type-checked
  - Autocomplete works everywhere
  - Catch errors at compile time, not runtime
