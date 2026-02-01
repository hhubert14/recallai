# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Retenio is an AI-powered video learning platform that transforms video watching into active learning through intelligent summaries and spaced repetition quizzes. The platform consists of two main components:

1. **Chrome Extension** - Captures YouTube videos and communicates with the backend API
2. **Web Application** - Backend API and user dashboard

The platform uses the Leitner box system for optimal knowledge retention.

**Tech Stack:**

*Web Application:*
- Next.js 15 (App Router, React Server Components)
- TypeScript
- Drizzle ORM (PostgreSQL via Supabase)
- Supabase Auth (authentication only)
- OpenAI + LangChain (AI summarization & question generation)
- Vitest + React Testing Library

*Chrome Extension:*
- WXT (https://wxt.dev) - Modern extension framework
- Manifest V3
- TypeScript + React
- Tailwind CSS
- Session-based authentication (cookie-based, no tokens)

## Development Workflow: Test-Driven Development (TDD)

**IMPORTANT: This project follows TDD. Tests are the default, not the exception. When in doubt, write the test.**

### TDD Workflow

1. **Write tests first** - Create test file describing expected behavior
2. **Verify tests fail** - Confirm red phase
3. **Implement the code** - Write minimum code to pass
4. **Refactor** - Clean up while keeping tests green

### What Requires Tests

**Always test:**
- Use cases and business logic
- Repository methods (even "simple" CRUD - edge cases exist)
- Utility functions and helpers
- Custom React hooks
- Bug fixes (write a failing test that reproduces the bug first)
- API routes with any logic
- Components with user interactions or conditional rendering
- Data transformations and formatting

**Component tests should cover:**
- User interactions (clicks, form submissions, keyboard navigation)
- Accessibility (screen reader support, focus management)
- Error states and loading states
- Conditional rendering logic

**Skip tests only for:**
- Pure configuration changes (env vars, build config)
- Obvious typo fixes in text/comments
- Auto-generated code (migrations, type definitions)
- Purely presentational components with zero logic or interactions (rare)

**If you're unsure whether something needs a test, it needs a test.**

### TDD Commands

```bash
npm run test -- --run path/to/file.unit.test.ts    # Run specific test
npm run test -- --watch                             # Watch mode during development
```

See [Testing Strategy](#testing-strategy) section for test organization and patterns.

## Project Structure

```
learnsync/
├── web/                       # Next.js backend & web app
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── api/v1/            # API routes (versioned)
│   │   │   ├── auth/              # Auth pages (login, signup, etc.)
│   │   │   └── dashboard/         # Protected dashboard pages
│   │   ├── components/            # React components
│   │   │   ├── providers/         # Context providers
│   │   │   └── ui/                # Reusable UI components
│   │   ├── hooks/                 # Custom React hooks (always here, not co-located)
│   │   ├── data-access/           # Database queries (Drizzle ORM)
│   │   ├── use-cases/             # Business logic layer
│   │   ├── drizzle/               # Drizzle ORM schema & migrations
│   │   └── lib/                   # Shared utilities
│   │       └── supabase/          # Supabase clients (auth only)
│   ├── docs/                      # Project documentation
│   └── vitest.config.mts
│
└── extension/                 # Chrome extension (WXT + React)
    ├── src/
    │   ├── entrypoints/
    │   │   ├── background.ts      # Service worker (YouTube detection, video processing)
    │   │   └── popup/             # Extension popup (React)
    │   ├── hooks/
    │   ├── services/
    │   │   └── api.ts             # Backend API communication
    │   └── lib/
    │       └── constants.ts       # BASE_URL configuration
    └── wxt.config.ts              # WXT configuration (manifest, plugins)
```

## Database Architecture

### Current State: Drizzle ORM

The project uses Drizzle ORM for all database operations:

- **Supabase Auth**: Used exclusively for authentication (`signIn`, `signUp`, `signOut`, etc.)
- **Drizzle ORM**: Used for all data queries (CRUD operations)
- **Schema location**: `src/drizzle/schema.ts`
- **Database**: PostgreSQL via Supabase (connection pooling with `prepare: false`)

**Important:** When writing database queries:
1. Use Drizzle for all data operations (select, insert, update, delete)
2. Keep Supabase auth client for authentication only
3. Import from `src/drizzle/index.ts` for database access
4. Follow patterns in `docs/drizzle-migration-guide.md`

### Database Retry Logic

All repository methods use `dbRetry()` to automatically retry transient database errors (connection timeouts, network issues, server restarts) with exponential backoff.

**How it works:**
- Retries transient errors (connection timeout, connection refused, server restart) up to 3 times
- Uses exponential backoff with jitter (100ms → 200ms → 400ms)
- Fails immediately for permanent errors (constraint violations, syntax errors)
- Logs retry attempts via `logger.db.info()`

**Usage in repositories:**
```typescript
import { db } from "@/drizzle";
import { dbRetry } from "@/lib/db";

// All DB operations should be wrapped with dbRetry
const data = await dbRetry(() =>
  db.select().from(users).where(eq(users.id, userId))
);
```

**Error types:**
- `TransientDatabaseError` - Retryable (connection issues)
- `PermanentDatabaseError` - Not retryable (constraints, syntax)

**Files:**
- `src/lib/db/errors.ts` - Error types and classification
- `src/lib/db/retry.ts` - Retry logic with exponential backoff

### Core Tables

- `users` - User accounts (linked to Supabase auth)
- `videos` - YouTube videos processed by users
- `summaries` - AI-generated video summaries
- `questions` - Quiz questions for videos
- `question_options` - Multiple choice options
- `user_answers` - User quiz responses
- `user_question_progress` - Spaced repetition tracking (Leitner boxes)
- `extension_tokens` - Chrome extension authentication

## Chrome Extension Architecture

Built with WXT (https://wxt.dev) - modern framework with TypeScript, React, and hot reload.

### Key Components

**Service Worker (`src/entrypoints/background.ts`)**
- Detects YouTube navigation and extracts video IDs
- Triggers video processing via backend API
- Implements deduplication (skips recently processed videos)

**Popup (`src/entrypoints/popup/`)**
- React UI with Tailwind CSS
- Shows auth state and provides dashboard links
- Uses `useAuth` hook for state management

**API Service (`src/services/api.ts`)**
- Session-based auth (cookies, no tokens)
- `checkAuthStatus()` - Check auth via `/api/v1/users/me`
- `processVideo(url)` - Send video to backend

### Configuration

**Constants (`src/lib/constants.ts`):**
```typescript
export const BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : 'https://www.retenio.ai'
```

**Key Notes:**
- Manifest V3 configured via `wxt.config.ts` (not manifest.json)
- Use `@/` prefix for imports (e.g., `@/services/api`)
- Externally connectable: `https://www.retenio.ai/*` and `http://localhost:3000/*`
- Permissions: `storage`, `tabs`, and host permissions for API domains

## Critical Business Logic

### 1. Spaced Repetition System (Leitner Boxes)

5-box spaced repetition system:

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

### 2. Video Processing Pipeline

3-step AI processing:
1. **Create Video** - Store metadata in database
2. **Generate Summary** - OpenAI + LangChain summarization
3. **Generate Questions** - AI-generated quiz with 4 options each

**File:** `src/clean-architecture/use-cases/video/process-video.use-case.ts`

## Development Commands

### Web Application

```bash
npm run dev          # Start Next.js dev server with Turbopack
npm run build        # Production build
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

### Chrome Extension

```bash
npm run dev          # Start dev server with hot reload (port 4000)
npm run build        # Production build (outputs to .output/)
npm run zip          # Create distributable zip file
```

**Development Workflow:**
1. Run `npm run dev` from `extension/` directory
2. WXT auto-loads extension with hot reload
3. Make changes → extension updates automatically

**Manual Loading:**
1. `npm run build` → `chrome://extensions/` → Enable "Developer mode"
2. "Load unpacked" → Select `extension/.output/chrome-mv3`

### Testing

```bash
npm run test                    # Run all tests (Vitest)
npm run test -- --watch         # Watch mode (recommended during development)
npm run test -- --coverage      # With coverage report
npm run test -- <filename>      # Run specific test file
```

### Database (Drizzle)

```bash
npm run db:generate      # Generate migration files from schema changes

# Migrations (recommended - use for all schema changes)
npm run db:migrate:dev   # Apply migrations to LOCAL dev database
npm run db:migrate:test  # Apply migrations to LOCAL test database

# Direct push (use sparingly - for quick iteration only, doesn't create migration files)
npm run db:push:dev      # Push schema directly to dev DB
npm run db:push:test     # Push schema directly to test DB

# Database GUI
npm run db:studio:dev    # Open Drizzle Studio for dev DB
npm run db:studio:test   # Open Drizzle Studio for test DB (port 4984)
```

**Best Practice:** Prefer `db:migrate` over `db:push` to ensure migrations are tracked and can be applied consistently across environments.

**Important:** DO NOT run `db:migrate:prod` locally - production migrations require separate review/deployment process.

## Development Workflow Tools

### Skills

| Skill | When to use |
|-------|-------------|
| `/test-driven-development` | Before implementing features - write tests first |
| `/frontend-design` | Building/styling UI components and pages |
| `/vercel-react-best-practices` | Writing or reviewing React/Next.js code for performance |
| `/web-design-guidelines` | Reviewing UI for accessibility and design best practices |

### MCP Servers

| Server | Purpose | When to use |
|--------|---------|-------------|
| `context7` | Library documentation | See [Using External Libraries](#using-external-libraries) |
| `github` | GitHub operations | Creating PRs, managing issues, searching code |
| `supabase` | Database operations | Running SQL, checking migrations, viewing logs |
| `chrome-devtools` / `playwright` | Browser automation | Testing extension behavior, E2E testing |

## Local Development Setup

### Prerequisites

- **Docker Desktop** must be running (required for local Supabase)
- Run `npm run dev` from `web/` directory (auto-starts Supabase)

### Dev Account Credentials

For local development, use these credentials to sign in:
- **Email:** `test@test.com`
- **Password:** `password`

### Local Services

When Supabase is running locally:
- **Supabase Studio:** http://127.0.0.1:54323 (database GUI)
- **Mailpit:** http://127.0.0.1:54324 (captures auth emails locally)
- **API:** http://127.0.0.1:54321

### Environment Files

- `.env` - Shared defaults (committed, no secrets)
- `.env.local` - Local Supabase credentials (dev + build)
- `.env.test.local` - Local Supabase testdb (integration tests)
- `.env.prod` - Production credentials (for Vercel import, not auto-loaded)

## Environment Variables

Required in `.env.local` for local development:

```bash
# Local Supabase
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<local anon key>"
SUPABASE_SERVICE_ROLE_KEY="<local service role key>"
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# API Keys
OPENAI_API_KEY=
YOUTUBE_INFO_API_KEY=
YOUTUBE_TRANSCRIPT_API_KEY=

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Code Patterns & Conventions

### 1. Use Cases - Return Types

**Default: Return domain entities**
```typescript
export class GetQuestionsForReviewUseCase {
  async execute(userId: string): Promise<QuestionForReview[]> {
    const progress = await progressRepo.findProgressDueForReview(userId);
    const questions = await questionRepo.findQuestionsByIds(...);
    return progress.map(p => ({ progress: p, question: questions[p.questionId] }));
  }
}
```

**When to create DTOs instead:**
- Security/Privacy - Entity contains sensitive fields
- Performance - Entity is very large, consumer only needs a few fields
- API boundaries - External APIs shouldn't expose internal domain structure
- Complex transformations - Need to heavily reshape/combine data

**Use Case Dependencies:**
Use cases should only depend on **repositories** and **services**, never on other use cases. If you need shared logic, extract it into a service.

### 2. Repository Method Naming

Include entity name for clarity:

```typescript
// ✅ Good - entity name included
findVideoById(id: number)
findVideoByUserIdAndUrl(userId: string, url: string)
createVideo(userId: string, ...)

// ❌ Bad - ambiguous
findById(id: number)
create(userId: string, ...)
```

**Batch Operations - Always Use "Batch" Suffix:**
```typescript
createProgress(item) → ProgressEntity
createProgressBatch(items[]) → ProgressEntity[]
createWindowsBatch(items[]) → WindowEntity[]
```

### 3. Component Organization

**Decision Rule:**
- Component used in **1 place only** → Co-locate with the page/feature
- Component used in **2+ places** → Move to `components/` directory

**Exception: Custom Hooks**
Custom React hooks (`use*.ts`) always go in `src/hooks/`, even if only used in one place.

**Why hooks are different:**
- Discoverability - Central folder documents "what logic abstractions exist"
- Different nature - Components are visual/page-specific; hooks are logic that often could apply elsewhere
- Convention - Developers naturally look in a `hooks/` folder

**Loading Skeletons:**
When modifying a page's UI, always update the corresponding `loading.tsx` skeleton to match the layout.

### 4. React Hook Ordering

```typescript
function MyComponent({ props }) {
  // 1. useContext
  // 2. useState
  // 3. useRef
  // 4. Custom hooks
  // 5. useCallback
  // 6. useEffect
  // 7. Early returns
  // 8. Return JSX
}
```

Utility functions that don't depend on component state/props go **outside** the component.

### 5. Database Queries (Drizzle)

```typescript
// Select
const result = await db
  .select()
  .from(summaries)
  .where(eq(summaries.videoId, videoId))
  .limit(1);

// Insert
const [result] = await db
  .insert(summaries)
  .values({ videoId, content })
  .returning();

// Relational Query
const data = await db.query.questions.findMany({
  where: eq(questions.videoId, videoId),
  with: {
    options: {
      orderBy: (options, { asc }) => [asc(options.orderIndex)],
    }
  }
});
```

### 6. API Routes

All API routes are versioned under `/api/v1/` and use JSend response format.

**API Design Pattern: Hybrid RPC/RESTful**

- **RPC-style** (action-based) - Use for operations/commands
- **RESTful** (resource-based) - Use for standard resource operations

**JSend Format:**
```typescript
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";

return jsendSuccess({ data: result });           // Success (200-299)
return jsendFail({ error: "..." }, 400);         // Client error (400-499)
return jsendError("Internal server error");      // Server error (500-599)
```

### 7. Type Safety

- Use Drizzle-inferred types: `typeof tableName.$inferSelect`
- Export types from `src/drizzle/schema.ts`
- Prefer type-safe queries over raw SQL

### 8. Git Branch Naming

| Prefix | When to use |
|--------|-------------|
| `feature/` | New features, user-facing changes, enhancements, UI changes |
| `fix/` | Bug fixes (all types - regular bugs, hotfixes, etc.) |
| `chore/` | Everything else: dependency updates, config changes, CI/CD tweaks, refactoring, documentation |

**Pattern:** `type/issue-number-description` (issue number optional but encouraged)

### 9. Comment Task Markers

| Marker | When to use |
|--------|-------------|
| `TODO` | Work that needs to be done |
| `FIXME` | Broken code that needs fixing |
| `HACK` | Temporary workaround or ugly solution |
| `NOTE` | Important context or explanation |
| `REVIEW` | Needs discussion or second opinion |

### 10. Dead Code

Never add dead code. Don't implement features, parameters, or options that aren't used. If a feature might be needed "later," wait until later.

Remove dead code when found. Dead code creates confusion, requires maintenance for no benefit, and often becomes permanently dead.

### 11. Displaying AI-Generated Content

**Always use the `AIContent` component** for any text that comes from AI (LLM responses, generated content) or could contain markdown formatting.

**Location:** `src/components/ui/ai-content.tsx`

```typescript
import { AIContent } from "@/components/ui/ai-content";

// Basic usage
<AIContent content={aiGeneratedText} />

// With custom styling (inherits text color and size)
<AIContent
  content={explanation}
  className="text-sm text-muted-foreground"
/>
```

**What it provides:**
- Markdown rendering (bold, code blocks, lists, etc.)
- Dark mode support via `prose-invert`
- Compact spacing for inline display
- Inherits parent's text color and size via `[&>*]:text-inherit`

**When to use:**
- Flashcard front/back content
- Question text and explanations
- Chat messages (assistant responses)
- AI-generated summaries and feedback
- Any content that might contain markdown

**When NOT to use:**
- Quiz option text (short, inline with icons - use plain `<span>`)
- Static UI text (labels, buttons, headings)
- User input fields
- Content requiring special rendering (e.g., `MarkdownWithTimestamps` for clickable timestamps)

**Exception:** Use `MarkdownWithTimestamps` for summaries that need clickable video timestamps.

## Testing Strategy

### Test File Naming Convention

Co-locate test files next to source files:
- Unit tests: `<name>.unit.test.ts` - Pure logic with mocked dependencies
- Component tests: `<name>.component.test.tsx` - React component rendering and interactions
- Integration tests: `<name>.integration.test.ts` - Tests with real database

### Testing Cadence

Run tests frequently:
- After writing each test → verify fails (red)
- After implementing each piece → verify passes (green)
- After each refactor → verify nothing broke
- Before committing → run all tests

### Unit Tests with Mocked Repositories

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("GetUserStatsUseCase", () => {
  let useCase: GetUserStatsUseCase;
  let mockVideoRepo: IVideoRepository;

  beforeEach(() => {
    mockVideoRepo = { findVideosByUserId: vi.fn() };
    useCase = new GetUserStatsUseCase(mockVideoRepo);
  });

  it("returns correct total video count", async () => {
    vi.mocked(mockVideoRepo.findVideosByUserId).mockResolvedValue([...]);
    const result = await useCase.execute("user-1");
    expect(result.totalVideos).toBe(3);
  });
});
```

### Mocking Philosophy

**Mock at boundaries, not everywhere.** Mock dependencies to isolate the unit. Don't mock the unit itself.

**What to mock by test type:**

| Test Type | What to Mock | What NOT to Mock |
|-----------|--------------|------------------|
| Unit (use cases) | Repository interfaces, external services | Internal helpers, domain entities |
| Unit (pure logic) | Nothing needed | - |
| Component | API calls, external services | Child components (usually) |
| Integration | Nothing | Database, repositories |

**Warning signs you're over-mocking:**
- Test needs 4+ mocks → probably an integration test in disguise
- Mocks encode detailed external API shapes → one integration test should verify those assumptions
- Test passes but production breaks → mocks didn't reflect reality

### Snapshot Testing

Avoid snapshot tests for components. Test behavior instead:

```typescript
// ✅ Behavior - tests what users actually experience
expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
expect(screen.getByText("Error: Invalid email")).toBeInTheDocument();
```

### Integration Tests

Integration tests test against the real test database. Use for repository methods with complex queries, database constraint validation, and SQL/ORM correctness.

**Important:** Integration tests must **fail** (not skip) when test database is not configured. Use this pattern:

```typescript
describe("SomeRepository (integration)", () => {
  const TEST_DATABASE_URL = process.env.DATABASE_URL;

  if (!TEST_DATABASE_URL?.includes("testdb")) {
    it("fails when test database is not configured", () => {
      throw new Error(
        "Integration tests require DATABASE_URL pointing to testdb. " +
        "Ensure .env.test.local is configured and run: npm run test:integration"
      );
    });
    return;
  }
  // ... rest of tests
});
```

### Component Tests

Test user interactions, conditional rendering, loading/error states, and accessibility.

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("submits form with email and password", async () => {
  const user = userEvent.setup();
  render(<LoginForm onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText(/email/i), "test@example.com");
  await user.click(screen.getByRole("button", { name: /sign in/i }));

  expect(handleSubmit).toHaveBeenCalledWith({ email: "test@example.com" });
});
```

**Key patterns:**
- Use `userEvent` over `fireEvent`
- Query by accessible roles/labels, not test IDs
- Test from user's perspective

### E2E Tests (Playwright)

Use sparingly - they're slow and expensive. Reserve for critical user journeys, multi-page flows, and deployment smoke tests.

**Test pyramid:** Many unit tests, fewer integration tests, minimal E2E tests.

### Critical Areas Requiring Tests (Priority Order)

1. Spaced repetition engine (`process-spaced-repetition-answer.ts`, `utils.ts`)
2. Video processing pipeline (`process-video.ts`)
3. Use cases with business logic
4. Complex query functions

## Common Pitfalls

### Web Application

1. **Don't use Transaction mode for DATABASE_URL** - Use Session mode (port 6543) or set `prepare: false`
2. **Don't migrate Supabase auth** - Only migrate data queries, keep auth with Supabase
3. **Don't break spaced repetition logic** - Box calculations are critical for learning

### Chrome Extension

1. **Use WXT conventions** - Entrypoints go in `src/entrypoints/`, use `defineBackground()` for service workers
2. **Don't edit manifest.json directly** - Configure manifest in `wxt.config.ts`
3. **Don't hardcode API URLs** - Use `BASE_URL` from `src/lib/constants.ts`
4. **Use path aliases** - Import with `@/` prefix (e.g., `@/services/api`)
5. **Test both environments** - Dev uses localhost:3000, production uses retenio.ai

## Maintaining the Updates Page

When adding noteworthy features, improvements, or bug fixes, update `web/src/app/updates/updates-data.ts`.

**Add entry at TOP of `updates` array:**
```typescript
{
  id: "2025-01-20-dark-mode",
  date: "2025-01-20",
  title: "Dark Mode Support",
  description: "Toggle between light and dark themes for comfortable viewing in any environment.",
  category: "New Feature",  // "New Feature", "Improvement", or "Fix"
}
```

**When to add:** New user-facing features, significant improvements, important bug fixes users would notice.

**When NOT to add:** Internal refactoring, minor styling tweaks, developer-only changes.

## Using External Libraries

**IMPORTANT: When adding a new library or using an unfamiliar library, always use Context7 to get up-to-date documentation before implementing.**

**Workflow:**
1. `mcp__context7__resolve-library-id` - Find the library ID
2. `mcp__context7__query-docs` - Query for specific usage patterns

## Useful Resources

- **Drizzle Docs:** https://orm.drizzle.team/docs/overview
- **Next.js 15 Docs:** https://nextjs.org/docs
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **WXT Docs:** https://wxt.dev
