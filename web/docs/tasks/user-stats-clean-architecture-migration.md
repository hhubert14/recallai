# User Stats Clean Architecture Migration

## Overview

Migrate the legacy `data-access/user-stats` folder to clean architecture pattern for consistency with the rest of the codebase.

**Priority:** Low
**Status:** Backlog

## Current State

The user stats functionality lives in the legacy data-access folder:

```
web/src/data-access/user-stats/
├── types.ts                                    # DTO definitions (UserStatsDto)
├── get-user-stats-by-user-id.ts               # Main aggregator function
├── get-total-videos-by-user-id.ts             # Count of user's videos
├── get-total-questions-answered-by-user-id.ts # Count of answered questions
├── get-quiz-accuracy-by-user-id.ts            # Accuracy percentage calculation
├── get-weekly-activity-by-user-id.ts          # This week's videos & questions
└── get-quiz-completion-status.ts              # Check if video quiz is complete
```

**Pattern:** Direct data-access functions without use case layer

## Where It's Used

| File | Function Used |
|------|---------------|
| `app/dashboard/page.tsx` | `getUserStatsByUserId()` |
| `app/dashboard/settings/page.tsx` | `getUserStatsByUserId()` |
| `app/dashboard/library/LibraryVideoList.tsx` | `getQuizCompletionStatus()` |

## Target State

Migrate to clean architecture under `src/clean-architecture/`:

```
web/src/clean-architecture/
├── domain/
│   └── repositories/
│       └── user-stats.repository.interface.ts  # Repository interface
├── infrastructure/
│   └── repositories/
│       └── user-stats.repository.drizzle.ts    # Drizzle implementation
└── use-cases/
    └── user-stats/
        ├── get-user-stats.use-case.ts          # Main stats use case
        └── get-quiz-completion-status.use-case.ts
```

## Migration Steps

1. **Create repository interface** - Define `IUserStatsRepository` with methods for each stat query
2. **Create Drizzle implementation** - Move existing query logic to repository
3. **Create use cases** - Wrap repository calls in use case classes
4. **Update consumers** - Update dashboard, settings, and library pages to use new use cases
5. **Delete legacy files** - Remove `data-access/user-stats/` folder
6. **Add tests** - Unit tests for use cases and repository

## Notes

- ReviewStats (Leitner box progress) is already in clean architecture at `use-cases/progress/get-progress-stats.use-case.ts`
- Consider whether to consolidate UserStats and ReviewStats into a single stats domain
- No API routes exist for stats - only used server-side in pages
- `getQuizAccuracyByUserId` loads all answers into memory - consider optimizing during migration

## When to Do This

Good opportunities to tackle this migration:
- When adding new stats features
- When refactoring the dashboard page
- When adding API endpoints for stats (e.g., for mobile app)
- During a broader clean architecture migration effort
