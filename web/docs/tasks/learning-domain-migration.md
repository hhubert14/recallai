# Learning Domain Migration Plan

## Overview
Migrating the Learning domain (Answer + Progress entities) to clean architecture with significant improvements to the spaced repetition system.

## Key Design Decisions

### Simplified Spaced Repetition Flow

**Old Flow (Complex):**
1. User answers quiz → creates `userAnswer` record only
2. Review page queries:
   - Questions with progress where `nextReviewDate <= today` (due questions)
   - Questions with answers but NO progress (initial review questions)
3. Multiple complex queries joining across domains

**New Flow (Simplified):**
1. User answers quiz → creates `userAnswer` record only
2. User sees "Add to review schedule" button after quiz
3. User clicks → creates `progress` records for all questions in that video (batch operation)
4. Review page shows only: questions with `progress` where `nextReviewDate <= today`

**Benefits:**
- User controls what goes into spaced repetition (avoids review burnout)
- Simpler queries (no cross-domain joins in repositories)
- One-click per video (low friction opt-in)
- Cleaner separation between "learning" and "reviewing"

### Repository Design Principles

**Answer Repository:**
- Single responsibility: record user answers
- No cross-domain queries
- Only returns Answer entities

**Progress Repository:**
- Single responsibility: track spaced repetition state
- Only touches `user_question_progress` table
- No joins to questions/videos (use cases handle composition)

**Removed Complexity:**
- No more "initial review" queries
- No more random question selection in repository
- No more cross-domain DTOs in repository layer

## Domain Layer

### Entities

**AnswerEntity:**
- Discriminated union for extensibility (currently only multiple-choice)
- Fields: type, id, userId, questionId, selectedOptionId, isCorrect, createdAt

**ProgressEntity:**
- Tracks Leitner box state
- Fields: id, userId, questionId, boxLevel, nextReviewDate, timesCorrect, timesIncorrect, lastReviewedAt, createdAt

### Repository Interfaces

**IAnswerRepository:**
- `createMultipleChoiceAnswer()` - Record a quiz answer
- `findAnswersByQuestionId()` - Get all answers for a question (for analytics/history)

**IProgressRepository:**
- `createProgress()` - Create single progress record
- `createProgressBatch()` - Batch create for entire video
- `findProgressByUserIdAndQuestionId()` - Find existing progress
- `updateProgress()` - Update after review
- `findProgressDueForReview()` - Get questions due today
- `getProgressStats()` - Aggregate stats (counts by box level)

## Infrastructure Layer

### Repository Implementations
- `DrizzleAnswerRepository`
- `DrizzleProgressRepository`
- Both use `toEntity()` mapping pattern

### Factories
- `createAnswerRepository()`
- `createProgressRepository()`

## Use Cases

### Answer Use Cases
- `CreateMultipleChoiceAnswerUseCase` - Submit quiz answer
- `FindAnswersByQuestionIdUseCase` - Get answer history (if needed)

### Progress Use Cases
- `CreateProgressForVideoUseCase` - Batch add video questions to spaced repetition
- `ProcessSpacedRepetitionAnswerUseCase` - Handle review answer, update progress
- `FindProgressDueForReviewUseCase` - Get questions needing review (composes with Question repo)
- `GetProgressStatsUseCase` - Get review statistics

### Spaced Repetition Logic
- Stays in use case layer (not repository)
- Use existing `calculateProgressUpdate()` and `getNextReviewDate()` utilities
- Keep Leitner box algorithm intact

## Migration Steps

1. ✅ Create domain entities (Answer, Progress)
2. ✅ Create repository interfaces
3. ⏳ Create infrastructure implementations (Drizzle repos + factories)
4. ⏳ Create use cases
5. ⏳ Update consumers:
   - Video quiz page (submit answer)
   - Review page (get due questions + stats)
   - Review actions (process answer)
   - Add "Add to review schedule" feature
6. ⏳ Delete old data-access folders (user-answers, user-question-progress)

## Files to Update

### Consumers (replace old imports)
- `web/src/app/dashboard/video/[id]/actions.ts` - Submit answer
- `web/src/app/dashboard/review/page.tsx` - Get questions + stats
- `web/src/app/dashboard/review/actions.ts` - Process review answer
- `web/src/app/dashboard/review/ReviewInterface.tsx` - Type updates

### New Feature to Add
- "Add to review schedule" button after quiz completion
- Calls `CreateProgressForVideoUseCase`

### Files to Delete
- `web/src/data-access/user-answers/` (entire folder)
- `web/src/data-access/user-question-progress/` (entire folder)

## Code Style
- Minimal comments (self-documenting code)
- No DTOs in repository interfaces (use parameters directly)
- No null returns from create operations
- Use discriminated unions for flexibility
