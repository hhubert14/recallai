# GEMINI.md

This file provides guidance to Gemini CLI when working with code in this repository.

## Project Overview

RecallAI is an AI-powered video learning platform that transforms video watching into active learning through intelligent summaries and spaced repetition quizzes. The platform consists of two main components:

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

### TDD is the Default

When planning or implementing work, always follow this order:

1. **Write tests first** - Before writing any implementation code, create the test file with tests that describe expected behavior
2. **Verify tests fail** - Run tests to confirm they fail (red phase)
3. **Implement the code** - Write the minimum code to make tests pass (green phase)
4. **Refactor** - Clean up while keeping tests green

### When Planning Tasks

When creating a plan or todo list for implementation work, structure it as:

```
1. Create test file with test cases for [feature]
2. Run tests to verify they fail
3. Implement [feature]
4. Run tests to verify they pass
5. Refactor if needed
```

**NOT** like this:

```
1. Implement [feature]
2. Write tests for [feature]  ❌ Tests come LAST = wrong
```

### What Requires Tests

Almost everything. Specifically:

**Always test:**
- Use cases and business logic
- Repository methods (even "simple" CRUD - edge cases exist)
- Utility functions and helpers
- Custom React hooks
- Bug fixes (write a failing test that reproduces the bug first)
- API routes with any logic
- Components with user interactions (forms, buttons, modals)
- Components with conditional rendering
- Data transformations and formatting

**Component tests should cover:**
- User interactions (clicks, form submissions, keyboard navigation)
- Accessibility (screen reader support, focus management)
- Error states and loading states
- Conditional rendering logic

### Rare Exceptions

These are the **only** cases where skipping tests is acceptable:

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

See [Testing Strategy](#testing-strategy) section for more details on test organization and patterns.

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
│   │   ├── drizzle-migration-guide.md
│   │   └── complex-query-migrations.md
│   └── vitest.config.mts
│
└── extension/                 # Chrome extension (WXT + React)
    ├── src/
│   │   ├── entrypoints/
│   │   │   ├── background.ts      # Service worker (YouTube detection, video processing)
│   │   │   └── popup/             # Extension popup (React)
│   │   │       ├── App.tsx        # Main popup component
│   │   │       ├── main.tsx       # React entry point
│   │   │       ├── index.html     # Popup HTML template
│   │   │       └── style.css      # Tailwind import
│   │   ├── hooks/
│   │   │   └── useAuth.ts         # Authentication state hook
│   │   ├── services/
│   │   │   └── api.ts             # Backend API communication
│   │   ├── lib/
│   │   │   ├── constants.ts       # BASE_URL configuration
│   │   │   └── youtube.ts         # YouTube URL parsing utilities
│   │   ├── assets/
│   │   │   └── tailwind.css       # Tailwind base styles
│   │   └── public/
│   │       └── icons/             # Extension icons (16, 32, 48, 128)
│   ├── wxt.config.ts              # WXT configuration (manifest, plugins)
│   ├── tsconfig.json              # TypeScript config
│   └── package.json               # Dependencies (WXT, React, Tailwind)
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

The Chrome extension is built with WXT (https://wxt.dev), a modern framework for building browser extensions with TypeScript, React, and hot module reloading.

### Key Components

**1. Service Worker (`src/entrypoints/background.ts`)
- Listens for tab updates to detect YouTube navigation
- Extracts video IDs using URL pattern matching
- Triggers video processing via backend API
- Implements deduplication (skips recently processed videos)
- Handles external messages from web app

**2. Popup (`src/entrypoints/popup/`)
- React-based popup UI with Tailwind CSS styling
- Shows authentication state (loading/authenticated/unauthenticated)
- Provides links to dashboard and sign in/out actions
- Uses `useAuth` hook for state management

### Services Layer

**API Service (`src/services/api.ts`)
- Communicates with backend API using session cookies (`credentials: 'include'`)
- Key functions:
  - `checkAuthStatus()` - Checks if user is authenticated via `/api/v1/users/me`
  - `processVideo(url)` - Sends video to backend for processing

**API Endpoints Used:**
- `GET /api/v1/users/me` - Check authentication status
- `POST /api/v1/videos/[url]/process` - Video processing

### Authentication Flow

The extension uses **session-based authentication** (cookies) instead of tokens:

1. User signs into RecallAI web app (session cookie set)
2. Extension checks auth status via `checkAuthStatus()` (cookie sent automatically)
3. When user watches YouTube video, extension:
   - Sends video URL to backend with session cookie
   - Backend processes video if user is authenticated
4. User views summaries/questions in web dashboard

**Benefits of cookie-based auth:**
- No token management or storage required
- Automatic session sharing with web app
- Simpler authentication flow

### Configuration

**Constants (`src/lib/constants.ts`):**
```typescript
export const BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : 'https://www.recallai.io'
```

**WXT Config (`wxt.config.ts`):**
- Manifest settings (name, version, permissions, icons)
- Vite plugins (Tailwind CSS)
- Dev server port (4000)

### Development Notes

- **WXT Framework** - Provides hot reload, TypeScript support, and modern tooling
- **Manifest V3** - Configured via `wxt.config.ts` (not a separate manifest.json)
- **React + Tailwind** - Popup UI uses React components with Tailwind styling
- **Path aliases** - Use `@/` prefix for imports (e.g., `@/services/api`)
- **Externally connectable** - `https://www.recallai.io/*` and `http://localhost:3000/*`
- **Permissions** - `storage`, `tabs`, and host permissions for API domains

## Critical Business Logic

### 1. Spaced Repetition System (Leitner Boxes)

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

### 2. Video Processing Pipeline

3-step AI processing for YouTube videos:

1. **Create Video** - Store metadata in database
2. **Generate Summary** - OpenAI + LangChain summarization
3. **Generate Questions** - AI-generated quiz with 4 options each

**Validation Steps:**
- Authentication (session cookie)
- Duplicate detection

**File:** `src/clean-architecture/use-cases/video/process-video.use-case.ts`

## Development Commands

### Web Application (from `web/` directory)

```bash
npm run dev          # Start Next.js dev server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

### Chrome Extension (from `extension/` directory)

```bash
npm run dev          # Start dev server with hot reload (port 4000)
npm run dev:firefox  # Start dev server for Firefox
npm run build        # Production build (outputs to .output/)
npm run build:firefox # Production build for Firefox
npm run zip          # Create distributable zip file
npm run compile      # TypeScript type checking (no emit)
```

**Development Workflow:**
1. Run `npm run dev` from `extension/` directory
2. WXT automatically loads extension in Chrome with hot reload
3. Make changes to code → extension updates automatically
4. Check console in background service worker for logs

**Manual Loading (Production Build):**
1. Run `npm run build` to create production build
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `extension/.output/chrome-mv3` folder
6. Extension will appear in Chrome toolbar

**Testing Extension:**
11. Start extension in dev mode (`npm run dev`)
12. Sign into RecallAI web app at `http://localhost:3000` (or production)
13. Click extension icon to verify authenticated state
14. Navigate to any YouTube video
15. Check background service worker console for processing logs

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

**Current Coverage:** Minimal - TDD workflow builds coverage organically

### Database (Drizzle)

```bash
npm run db:generate      # Generate migration files from schema changes

# Migrations (per environment)
npm run db:migrate:dev   # Apply migrations to LOCAL dev database
npm run db:migrate:test  # Apply migrations to LOCAL test database

# Direct push (faster for dev iteration, no migration files)
npm run db:push:dev      # Push schema directly to dev DB
npm run db:push:test     # Push schema directly to test DB

# Database GUI
npm run db:studio:dev    # Open Drizzle Studio for dev DB
npm run db:studio:test   # Open Drizzle Studio for test DB (port 4984)
```

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

Use cases orchestrate business logic and coordinate between repositories.

**Default approach: Return domain entities**
```typescript
export type QuestionForReview = {
  progress: ProgressEntity;
  question: MultipleChoiceQuestionEntity;
};

export class GetQuestionsForReviewUseCase {
  async execute(userId: string): Promise<QuestionForReview[]> {
    const progress = await progressRepo.findProgressDueForReview(userId);
    const questions = await questionRepo.findQuestionsByIds(...);
    return progress.map(p => ({ progress: p, question: questions[p.questionId] }));
  }
}
```

**Benefits:**
- Type safety flows from domain → use case → UI
- Changes to entities automatically propagate
- Simpler code, fewer data structures

**When to create DTOs instead:**
- **Security/Privacy** - Entity contains sensitive fields (passwords, tokens, internal IDs)
- **Performance** - Entity is very large, consumer only needs a few fields
- **API boundaries** - External APIs shouldn't expose internal domain structure
- **Complex transformations** - Need to heavily reshape/combine data

**Example - DTO for security:**
```typescript
// ❌ Don't expose full UserEntity (has hashedPassword, etc.)
export class GetUserProfileUseCase {
  async execute(userId: string): Promise<UserEntity> { ... }
}

// ✅ Create DTO with only safe fields
export type UserProfileDto = {
  id: string;
  email: string;
  name: string;
};

export class GetUserProfileUseCase {
  async execute(userId: string): Promise<UserProfileDto> {
    const user = await userRepo.findById(userId);
    return { id: user.id, email: user.email, name: user.name };
  }
}
```

**Rule of thumb:** Prefer entities by default. Create DTOs only when there's a clear reason (security, performance, etc.).

**Use Case Dependencies:**
Use cases should only depend on **repositories** and **services**, never on other use cases.

```typescript
// ✅ Good - depends on repositories and services
export class ProcessVideoUseCase {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly summaryService: IVideoSummarizerService,
    private readonly windowGeneratorService: ITranscriptWindowGeneratorService,
  ) {}
}

// ❌ Bad - depends on another use case
export class ProcessVideoUseCase {
  constructor(
    private readonly generateWindowsUseCase: GenerateTranscriptWindowsUseCase,
  ) {}
}
```

If you find yourself wanting to call one use case from another, extract the shared logic into a service instead.

### 2. Repository Method Naming

Repository methods should include the entity name for clarity and to avoid ambiguity:

```typescript
// ✅ Good - entity name included
findVideoById(id: number)
findVideoByUserIdAndUrl(userId: string, url: string)
findSurveyByUserId(userId: string)
createVideo(userId: string, ...)
createSurvey(userId: string, answers: SurveyAnswers)

// ❌ Bad - ambiguous without entity name
findById(id: number)
findByUserId(userId: string)
create(userId: string, ...)
```

**Batch Operations - Always Use "Batch" Suffix:**

```typescript
// Single item method (when it exists)
createProgress(item) → ProgressEntity
createWindow(item) → WindowEntity

// Batch method (ALWAYS use "Batch" suffix, even if single doesn't exist)
createProgressBatch(items[]) → ProgressEntity[]
createWindowsBatch(items[]) → WindowEntity[]
createFlashcardsBatch(items[]) → FlashcardEntity[]
```

**Why:** Clear differentiation between single and batch operations, works for all nouns (avoids awkward plurals like "progresses").

### 3. Component Organization

**Decision Rule:**
- Component used in **1 place only** → Co-locate with the page/feature
- Component used in **2+ places** → Move to `components/` directory

**Exception: Custom Hooks**

Custom React hooks (`use*.ts`) always go in `src/hooks/`, even if only used in one place.

**Why hooks are different:**
- **Discoverability** - Hooks encapsulate reusable logic patterns; a central folder documents "what logic abstractions exist"
- **Different nature** - Components are visual and page-specific; hooks are logic that often could apply elsewhere
- **Refactoring signal** - Putting a hook in `hooks/` signals "this logic is worth reusing"
- **Convention** - Developers naturally look in a `hooks/` folder for custom hooks

```typescript
// ✅ Always in src/hooks/, even if single-use
import { useChatMessages } from "@/hooks/useChatMessages";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";

// ❌ Don't co-locate hooks with pages
import { useChatMessages } from "./useChatMessages";  // Bad
```

**Current Structure:**
```
src/
├── components/
│   ├── ui/              # Reusable UI primitives (buttons, dropdowns, forms, etc.)
│   └── providers/       # React context providers (AuthProvider, etc.)
├── hooks/               # Custom React hooks (always here, not co-located)
│   └── useChatMessages.ts
└── app/
    ├── auth/
    │   ├── login/
    │   │   ├── page.tsx
    │   │   └── LoginForm.tsx      # ✅ Only used by login page
    │   └── sign-up/
    │       ├── page.tsx
    │       └── SignUpForm.tsx     # ✅ Only used by sign-up page
    └── dashboard/
        ├── video/[id]/
        │   ├── page.tsx
        │   ├── VideoPlayer.tsx    # ✅ Only used by this page
        │   ├── ContentTabs.tsx    # ✅ Only used by this page
        │   └── QuizInterface.tsx  # ✅ Only used by this page
        └── library/
            ├── page.tsx
            └── LibraryVideoCard.tsx  # ✅ Only used by library page
```

**Examples:**

✅ **Keep co-located** (single use):
```typescript
// app/dashboard/video/[id]/VideoPlayer.tsx
// Only used in app/dashboard/video/[id]/page.tsx
export function VideoPlayer({ url }: { url: string }) { ... }
```

❌ **Move to components/** (multi-use):
```typescript
// If a component is imported in 2+ pages:
// app/dashboard/page.tsx:  import { RefreshButton } from "@/components/ui/refresh-button"
// app/library/page.tsx:     import { RefreshButton } from "@/components/ui/refresh-button"
//
// Then it belongs in components/ui/refresh-button.tsx
```

**When to move a component:**
1. You import it in a second location → Move to `components/`
2. You anticipate reuse across features → Move to `components/`
3. It's a generic UI primitive (button variant, modal, etc.) → Move to `components/ui/`
4. It's a shared provider/context → Move to `components/providers/`

**Loading Skeletons:**

When modifying a page's UI, always update the corresponding `loading.tsx` skeleton to match. Skeletons should mirror the actual page layout so users see a consistent loading experience.

```
app/dashboard/library/
├── page.tsx           # Actual page
├── loading.tsx        # Skeleton - must match page.tsx layout
└── LibraryVideoCard.tsx
```

**When to update skeletons:**
- Adding/removing UI sections (stats bars, cards, lists)
- Changing layout structure (grid → list, adding columns)
- Adding new data displays (counts, badges, icons)

**Benefits of this approach:**
- **Performance** - Next.js App Router optimizes co-located components automatically
- **Developer experience** - Easy to find components (check the page first, then `components/`)
- **Scalability** - Clear rule prevents confusion as codebase grows
- **Maintenance** - Feature-specific code stays together, easier to refactor/delete

### 4. React Hook Ordering

Inside React components and custom hooks, organize code in this order:

```typescript
function MyComponent({ props }) {
  // 1. useContext
  const theme = useContext(ThemeContext);

  // 2. useState
  const [value, setValue] = useState(false);

  // 3. useRef
  const ref = useRef(null);

  // 4. Custom hooks
  const { data } = useCustomHook();

  // 5. useCallback
  const handleClick = useCallback(() => { ... }, [deps]);

  // 6. useEffect
  useEffect(() => { ... }, [deps]);

  // 7. Early returns
  if (loading) return <Spinner />;

  // 8. Return JSX
  return <div>...</div>;
}
```

Utility functions that don't depend on component state/props go **outside** the component.

### 5. Database Queries (Drizzle)

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
  .set({ email: newEmail })
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

### 6. API Routes

All API routes are versioned under `/api/v1/` and use JSend response format.

**API Design Pattern: Hybrid RPC/RESTful**

This project uses a pragmatic mix of RPC-style (action-based) and RESTful (resource-based) patterns:

**RPC-style (action-based)** - Use for operations/commands:
```
/api/v1/users/check-email-exists    [POST] - Action: check if email exists
/api/v1/videos/[url]/summarize      [POST] - Action: generate summary
/api/v1/reviews/submit-answer       [POST] - Action: submit answer
```

**RESTful (resource-based)** - Use for resource access:
```
/api/v1/users/me                    [GET]  - Resource: get current user
/api/v1/videos/[url]                [GET]  - Resource: get video
/api/v1/questions                   [GET]  - Resource: list questions
```

**When to use each:**
- Use **RPC-style** when the operation doesn't map cleanly to CRUD (create/read/update/delete)
- Use **RESTful** when working with standard resource operations (get, list, create, update, delete)

**JSend Format:**
```typescript
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";

// Success (200-299)
return jsendSuccess({ data: result });

// Fail (400-499) - Client error
return jsendFail({ error: "Missing required fields" }, 400);

// Error (500-599) - Server error
return jsendError("Internal server error");
```

**Example Route:**
```typescript
// src/app/api/v1/videos/[url]/route.ts
export async function GET(request: Request, { params }: { params: { url: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    // Implementation
    return jsendSuccess({ video });
  } catch (error) {
    return jsendError("Failed to fetch video");
  }
}
```

### 7. Type Safety

- Use Drizzle-inferred types: `typeof tableName.$inferSelect`
- Export types from `src/drizzle/schema.ts`
- Prefer type-safe queries over raw SQL

### 8. Git Branch Naming

Use these prefixes when creating branches:

| Prefix | When to use |
|--------|-------------|
| `feature/` | New features, user-facing changes, enhancements, UI changes |
| `fix/` | Bug fixes (all types - regular bugs, hotfixes, etc.) |
| `chore/` | Everything else: dependency updates, config changes, CI/CD tweaks, refactoring, documentation |
| `release/` | Formal release branches (only if doing formal releases) |

**Issue Number (Optional):**

When a branch relates to a GitHub issue, include the issue number after the prefix:
- Pattern: `type/issue-number-description`
- Helps with traceability and GitHub auto-linking
- Not required, but encouraged when an issue exists

**Examples:**
```
feature/123-add-dark-mode        # With issue number
feature/user-profile-settings   # Without issue number (still valid)
fix/456-login-redirect-bug
fix/quiz-score-calculation
chore/789-update-dependencies
chore/refactor-auth-service
release/v1.2.0
```

### 9. Comment Task Markers

Use these standard task markers in code comments:

| Marker | When to use |
|--------|-------------|
| `TODO` | Work that needs to be done |
| `FIXME` | Broken code that needs fixing |
| `HACK` | Temporary workaround or ugly solution |
| `NOTE` | Important context or explanation |
| `REVIEW` | Needs discussion or second opinion |

**Examples:**
```typescript
// TODO: Add input validation
// FIXME: This crashes when userId is null
// HACK: Workaround for API bug, remove after v2.0
// NOTE: This must run before database initialization
// REVIEW: Is this the right approach for error handling?
```

### 10. Dead Code

**Never add dead code.** Don't implement features, parameters, or options that aren't used. If a feature might be needed "later," wait until later to add it.

**Remove dead code when found.** If you encounter unused functions, parameters, imports, or variables, delete them. Dead code:
- Creates confusion about what's actually used
- Requires maintenance for no benefit
- Often becomes permanently dead (the "later" never comes)

```typescript
// ❌ Bad - unused parameter
function completeTour(dontShowAgain?: boolean) {
  // dontShowAgain is never used anywhere
}

// ✅ Good - only what's needed
function completeTour() {
  // ...
}
```

## Testing Strategy

### Test-Driven Development (TDD)

Use TDD for non-trivial implementations, especially use cases and business logic:

1. **Red** - Write tests first that describe the expected behavior
2. **Green** - Implement the minimum code to make tests pass
3. **Refactor** - Clean up while keeping tests green

**TDD Workflow Example:**
```bash
# 1. Write test file with failing tests
# 2. Run tests to verify they fail
npm run test -- --run path/to/file.unit.test.ts

# 3. Implement the feature
# 4. Run tests to verify they pass
npm run test -- --run path/to/file.unit.test.ts

# 5. Refactor if needed, run tests again
npm run test -- --run path/to/file.unit.test.ts
```

### Testing Cadence

**Run tests frequently after each change:**
- After writing each test → verify test fails (red)
- After implementing each piece → verify test passes (green)
- After each refactor → verify nothing broke
- Before committing → run all tests

```bash
npm run test -- --run              # Run all tests once
npm run test -- --watch            # Watch mode during development
npm run test -- --run <pattern>    # Run specific tests
```

### Test File Naming Convention

**Co-located Tests:** Place test files next to source files with naming convention:
- Unit tests: `<name>.unit.test.ts` - Pure logic, hooks, utilities with mocked dependencies
- Component tests: `<name>.component.test.tsx` - React component rendering and interactions
- Integration tests: `<name>.integration.test.ts` - Tests with real database

```
src/clean-architecture/use-cases/user-stats/
├── get-user-stats.use-case.ts
├── get-user-stats.unit.test.ts           # Unit test with mocked dependencies
└── get-user-stats.integration.test.ts    # Integration test with real DB (if needed)

src/app/dashboard/review/
├── ReviewInterface.tsx
└── ReviewInterface.component.test.tsx    # Component test with React Testing Library
```

### Unit Tests with Mocked Repositories

For use case tests, mock repository dependencies:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetUserStatsUseCase } from "./get-user-stats.use-case";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";

describe("GetUserStatsUseCase", () => {
  let useCase: GetUserStatsUseCase;
  let mockVideoRepo: IVideoRepository;

  beforeEach(() => {
    mockVideoRepo = {
      findVideosByUserId: vi.fn(),
      // ... other methods
    };
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

**Mock at boundaries, not everywhere.** The goal is tests that catch real bugs, not tests that verify your mocks match your assumptions.

**What to mock by test type:**

| Test Type | What to Mock | What NOT to Mock |
|-----------|--------------|------------------|
| Unit (use cases) | Repository interfaces, external services | Internal helpers, domain entities |
| Unit (pure logic) | Nothing needed | - |
| Component | API calls, external services | Child components (usually) |
| Integration | Nothing | Database, repositories |

**The key principle: Mock dependencies to isolate the unit. Don't mock the unit itself.**

```typescript
// ✅ Good - mocks the boundary (repository), tests YOUR logic
it("skips processing if video already exists", async () => {
  mockVideoRepo.findByUrl.mockResolvedValue(existingVideo);

  const result = await useCase.execute(url);

  expect(result).toEqual(existingVideo);
  expect(mockSummaryService.generate).not.toHaveBeenCalled();
});

// ❌ Bad - mocks internal code, what are you even testing?
it("processes video", async () => {
  vi.mock("./parseTranscript", () => ({ parse: vi.fn() }));
  vi.mock("./formatSummary", () => ({ format: vi.fn() }));
  // Now you're just testing glue code
});
```

**Mocking in use case tests is fine** because wiring and logic overlap. When you mock repositories and test conditional behavior, you're testing real logic with mocked boundaries:

```typescript
// This tests real logic (the conditional skip) with mocked boundaries
it("returns cached summary if exists", async () => {
  mockSummaryRepo.findByVideoId.mockResolvedValue(cachedSummary);

  const result = await useCase.execute(videoId);

  expect(mockAiService.generateSummary).not.toHaveBeenCalled();  // Logic!
  expect(result).toEqual(cachedSummary);
});
```

**Warning signs you're over-mocking:**
- Test needs 4+ mocks → probably an integration test in disguise
- Mocks encode detailed external API shapes → one integration test should verify those assumptions
- Test passes but production breaks → mocks didn't reflect reality

**If mocks require detailed knowledge of external API shapes**, consider one integration test to verify those assumptions are correct.

### Snapshot Testing

**Avoid snapshot tests for components.** They tend to:
- Break on any markup change, creating noise
- Get blindly updated without review (`-u` to make the error go away)
- Test implementation details rather than behavior

**Test behavior instead:**
```typescript
// ❌ Snapshot - breaks on any change, doesn't test behavior
expect(component).toMatchSnapshot();

// ✅ Behavior - tests what users actually experience
expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
expect(screen.getByText("Error: Invalid email")).toBeInTheDocument();
```

**Rare acceptable uses:** Error message formatting, serialized configuration objects, CLI output.

### Integration Tests

Integration tests test against the real test database. Use for:
- Repository methods with complex queries
- Database constraint validation
- SQL/ORM correctness

**Important rules:**
- Integration tests must **fail** (not skip) when the test database is not configured
- This ensures CI catches missing environment setup
- Use this pattern at the start of the describe block:

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

**Running integration tests:**
```bash
npm run test:integration  # Runs *.integration.test.ts files
```

### Component Tests

Component tests verify React components render correctly and respond to user interactions. Use React Testing Library.

**What to test:**
- User interactions (clicks, form submissions, keyboard navigation)
- Conditional rendering based on props/state
- Loading and error states
- Accessibility (roles, labels, focus management)

**Example:**
```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  it("submits form with email and password", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), "invalid");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  });

  it("disables submit button while loading", () => {
    render(<LoginForm onSubmit={vi.fn()} isLoading={true} />);

    expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
  });
});
```

**Key patterns:**
- Use `userEvent` over `fireEvent` (more realistic user simulation)
- Query by accessible roles/labels, not test IDs or CSS classes
- Test from the user's perspective, not implementation details

### E2E Tests (Playwright)

E2E tests verify complete user flows through the real application. Use sparingly - they're slow and expensive to maintain.

**When to use E2E:**
- Critical user journeys (login → dashboard → core feature)
- Flows involving multiple pages/systems
- Smoke tests for deployment verification

**When NOT to use E2E:**
- Testing every UI variation (use component tests)
- Edge cases and error handling (use unit tests)
- API correctness (use integration tests)

**Test pyramid:** Many unit tests, fewer integration tests, minimal E2E tests.

```
        /\
       /E2E\
      /------\
     /  Integ \     ← Some (DB queries, API routes)
    /----------\
   /    Unit    \   ← Many (business logic, components)
  /--------------\
```

**File naming:** `<name>.e2e.test.ts`

**Running E2E tests:**
```bash
npm run test:e2e  # Runs *.e2e.test.ts files (requires app running)
```

### Critical Areas Requiring Tests (Priority Order)

1. Spaced repetition engine (`process-spaced-repetition-answer.ts`, `utils.ts`)
2. Video processing pipeline (`process-video.ts`)
3. Use cases with business logic
4. Complex query functions (see `docs/complex-query-migrations.md` for high-risk files)

## Migration Notes

### Drizzle Migration (Completed)

The migration from Supabase client to Drizzle ORM is complete.

**What was migrated:**
- All data queries in `src/data-access/` modules
- All direct Supabase `.from()` calls for data operations

**What was NOT migrated:**
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

### Web Application

1. **Don't use Transaction mode for DATABASE_URL** - Use Session mode (port 6543) or set `prepare: false`
2. **Don't migrate Supabase auth** - Only migrate data queries, keep auth with Supabase
3. **Don't break spaced repetition logic** - Box calculations are critical for learning
4. **Review complex queries carefully** - See `docs/complex-query-migrations.md` for high-risk files

### Chrome Extension

1. **Use WXT conventions** - Entrypoints go in `src/entrypoints/`, use `defineBackground()` for service workers
2. **Don't edit manifest.json directly** - Configure manifest in `wxt.config.ts`
3. **Don't hardcode API URLs** - Use `BASE_URL` from `src/lib/constants.ts`
4. **Remember Manifest V3 restrictions** - Service workers have limitations vs background pages
5. **Use path aliases** - Import with `@/` prefix (e.g., `@/services/api`)
6. **Check `externally_connectable` matches** - Only whitelisted domains can message extension
7. **Test both environments** - Dev uses localhost:3000, production uses recallai.io

## Maintaining the Updates Page

When adding noteworthy features, improvements, or bug fixes, update the changelog so users can discover new functionality.

**File to edit:** `web/src/app/updates/updates-data.ts`

**How to add an update:**
1. Add a new entry at the **TOP** of the `updates` array (newest first)
2. Use an appropriate category: "New Feature"", "Improvement"", or "Fix"
3. Write a clear, user-facing title and description

**Example entry:**
```typescript
{
  id: "2025-01-20-dark-mode",
  date: "2025-01-20",
  title: "Dark Mode Support",
  description: "Toggle between light and dark themes for comfortable viewing in any environment.",
  category: "New Feature",
}
```

**When to add an update:**
- New user-facing features (chatbot, new tabs, integrations)
- Significant improvements to existing features (better summaries, faster processing)
- Important bug fixes that users would notice

**When NOT to add an update:**
- Internal refactoring
- Minor styling tweaks
- Developer-only changes (CI/CD, tests)

## Using External Libraries

**IMPORTANT: When adding a new library or using an unfamiliar library, always use Context7 to get up-to-date documentation before implementing.**

Context7 provides current documentation and code examples for libraries. Use it to:
- Learn the latest API patterns (libraries change frequently)
- Get accurate TypeScript types
- Find working code examples
- Avoid deprecated patterns

**Workflow:**
1. `mcp__context7__resolve-library-id` - Find the library ID
2. `mcp__context7__query-docs` - Query for specific usage patterns

**Example:**
```
// 1. Find library ID
resolve-library-id("react-joyride", "React tooltip tour library")
// Returns: /gilbarbara/react-joyride

// 2. Query documentation
query-docs("/gilbarbara/react-joyride", "How to create controlled tour with callbacks")
```

## Useful Resources

- **Drizzle Docs:** https://orm.drizzle.team/docs/overview
- **Next.js 15 Docs:** https://nextjs.org/docs
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **WXT Docs:** https://wxt.dev
