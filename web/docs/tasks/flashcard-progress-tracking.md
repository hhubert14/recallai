# Flashcard Progress Tracking (Future Task)

This document outlines the future implementation of spaced repetition progress tracking for flashcards.

## Background

Flashcard generation is implemented separately from progress tracking. This task adds Leitner box-based spaced repetition to flashcards, following the same pattern as question progress tracking.

## Database Schema

### New Table: `user_flashcard_progress`

```sql
CREATE TABLE user_flashcard_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  flashcard_id BIGINT NOT NULL REFERENCES flashcards(id),
  box_level INTEGER NOT NULL DEFAULT 1,
  next_review_date DATE,
  times_correct INTEGER NOT NULL DEFAULT 0,
  times_incorrect INTEGER NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, flashcard_id)
);
```

This mirrors the existing `user_question_progress` table structure.

## Implementation Notes

### Reusable Components

The following utilities are already content-agnostic and can be reused:

- `spaced-repetition.utils.ts` - Box level calculations, next review date
- `BOX_INTERVALS` constant - Review intervals (1, 3, 7, 14, 30 days)
- `getNextBoxLevel(currentBox, isCorrect)` - Move up on correct, reset to 1 on incorrect
- `getNextReviewDate(boxLevel)` - Calculate next review date

### New Components Needed

1. **Drizzle Schema** - Add `userFlashcardProgress` table to `schema.ts`

2. **Entity** - Create `FlashcardProgressEntity` (or reuse a generic `ProgressEntity`)

3. **Repository Interface** - `IFlashcardProgressRepository`
   - `findProgressByUserIdAndFlashcardId()`
   - `findProgressDueForReview(userId)`
   - `createProgress()`
   - `updateProgress()`

4. **Repository Implementation** - `DrizzleFlashcardProgressRepository`

5. **Use Cases**
   - `ProcessFlashcardReviewUseCase` - Update progress after review
   - `GetFlashcardsForReviewUseCase` - Fetch flashcards due for review
   - `CreateProgressForFlashcardsUseCase` - Initialize progress when flashcards are generated

6. **API Endpoints**
   - `POST /api/v1/flashcards/submit-review` - Submit review result (correct/incorrect)
   - `GET /api/v1/flashcards/due-for-review` - Get flashcards due for review

7. **UI Updates**
   - Add flashcard review to `/dashboard/review` page
   - Show "I knew it" / "I didn't know it" buttons after flip
   - Display box level and next review date

## Review Flow

```
User views flashcard (front)
        ↓
User flips card (reveals back)
        ↓
User self-grades: [I knew it] or [I didn't know it]
        ↓
POST /api/v1/flashcards/submit-review
  { flashcardId, isCorrect: true/false }
        ↓
Update box_level, next_review_date
        ↓
Show next flashcard or completion message
```

## Integration with Existing Review Page

Options for `/dashboard/review`:

1. **Separate sections** - "Questions to Review" and "Flashcards to Review"
2. **Tabbed interface** - Tabs for Questions vs Flashcards
3. **Mixed mode** (future) - Combine both in single review session

Recommendation: Start with separate sections, add mixed mode later if users want it.

## Migration Notes

When implementing, flashcards created before progress tracking won't have progress records. Options:

1. **Lazy creation** - Create progress record on first review
2. **Backfill** - Create progress records for existing flashcards when feature launches

Recommendation: Lazy creation is simpler and handles edge cases automatically.
