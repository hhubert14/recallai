# Complex Query Migrations - Review & Testing Guide

**Created:** 2025-11-04
**Status:** ⚠️ Requires Manual Testing

## Purpose

This document tracks the 4 most complex database queries migrated from Supabase to Drizzle ORM. These files use manual data grouping patterns and are the **most likely to have bugs** due to their complexity.

---

## Files Requiring Extra Attention

### 1. `get-questions-due-for-review.ts`

**What it does:**
Gets questions due for review today based on spaced repetition schedule (Leitner box system).

**Complexity:**
- 4-table join: `user_question_progress` → `questions` → `videos` → `question_options`
- Manual grouping to collect options for each question
- Date filtering for "due today" logic

**Key Logic:**
```typescript
// Query gets flat rows (one per option), then groups into:
{
  id: progress_id,
  questionId: question_id,
  questionText: "...",
  boxLevel: 1-5,
  nextReviewDate: "YYYY-MM-DD",
  options: [ /* array of options */ ]
}
```

**Testing:**
- Navigate to `/dashboard/review`
- Verify questions due today appear correctly
- Check that all 4 options show for each question
- Verify box level and next review date are correct

---

### 2. `get-questions-for-initial-review.ts` ✅ **Performance Improved**

**What it does:**
Gets questions that user has answered but are NOT yet in the spaced repetition system.

**Complexity:**
- Multi-step filtering logic:
  1. Get all question IDs already in spaced repetition
  2. Get answered questions NOT in that list
  3. Fetch full question data with joins

**Performance Improvement:**
- **Before:** N+1 query problem (separate DB query for each question to check if in spaced repetition)
- **After:** 3 total queries regardless of data size

**Key Logic:**
```typescript
// Step 1: Get existing progress question IDs
const existingQuestionIds = [1, 5, 10, ...];

// Step 2: Get answered questions NOT in that list
notInArray(userAnswers.questionId, existingQuestionIds)

// Step 3: Fetch full data for those questions
```

**Testing:**
- Answer some questions but don't add them to spaced repetition
- Navigate to initial review section
- Verify answered (but not in SR) questions appear
- Check that questions already in SR don't appear

---

### 3. `get-random-answered-questions.ts`

**What it does:**
Gets random questions the user has answered (for practice/review).

**Complexity:**
- Joins across multiple tables
- Manual deduplication using `Record<number, QuestionData>`
- Randomization with `limit * 3` over-fetch
- Optional progress data (may or may not exist)

**Key Logic:**
```typescript
// Get more than needed for randomization
.limit(limit * 3)

// Deduplicate by question ID
const questionsMap: Record<number, QuestionData> = {};

// Shuffle and take requested limit
.sort(() => Math.random() - 0.5)
.slice(0, limit)
```

**Testing:**
- Answer multiple questions across different videos
- Navigate to practice/review section
- Verify random selection works
- Check that questions aren't duplicated
- Verify progress data shows if question is in SR

---

### 4. `get-random-questions-for-review.ts`

**What it does:**
Gets random questions from user's videos that **have progress** (already in spaced repetition).

**Complexity:**
- Joins with optional progress data
- Filters to only include questions WITH progress
- Randomization logic
- Manual option collection

**Key Difference from #3:**
- This one **requires** progress to exist
- #3 includes questions **with or without** progress

**Key Logic:**
```typescript
// Filter to only questions WITH progress
const questionsWithProgress = Object.values(questionsMap).filter(
    (q) => q.progress !== null
);

// Then shuffle and limit
```

**Testing:**
- Add some questions to spaced repetition
- Navigate to random review section
- Verify only questions WITH progress appear
- Check randomization works
- Verify box level and next review date are shown

---

## Common Pattern: Manual Data Grouping

All 4 files use this pattern because **Drizzle returns flat rows** while **Supabase returned nested data**.

### Why Manual Grouping is Needed

**Supabase nested result:**
```json
{
  "id": 1,
  "question_text": "What is X?",
  "question_options": [
    { "option_text": "A" },
    { "option_text": "B" },
    { "option_text": "C" },
    { "option_text": "D" }
  ]
}
```

**Drizzle flat rows (one per option):**
```json
// Row 1
{ "questions.id": 1, "questions.question_text": "What is X?", "question_options.option_text": "A" }
// Row 2
{ "questions.id": 1, "questions.question_text": "What is X?", "question_options.option_text": "B" }
// Row 3
{ "questions.id": 1, "questions.question_text": "What is X?", "question_options.option_text": "C" }
// Row 4
{ "questions.id": 1, "questions.question_text": "What is X?", "question_options.option_text": "D" }
```

**Manual grouping solution:**
```typescript
const questionsMap: Record<number, QuestionData> = {};

for (const row of rows) {
    if (!questionsMap[row.questions.id]) {
        // First time seeing this question - create entry
        questionsMap[row.questions.id] = {
            id: row.questions.id,
            questionText: row.questions.questionText,
            options: []
        };
    }

    // Add this option to the question
    if (row.question_options) {
        questionsMap[row.questions.id].options.push({
            optionText: row.question_options.optionText,
            ...
        });
    }
}

// Convert map to array
const result = Object.values(questionsMap);
```

---

## Testing Checklist

### Spaced Repetition Flow (End-to-End)

- [ ] Answer quiz questions for a video
- [ ] Check questions appear in "Initial Review" section (#2)
- [ ] Add questions to spaced repetition by reviewing them
- [ ] Verify questions appear in "Questions Due for Review" (#1)
- [ ] Check that answered questions show in random review (#3, #4)
- [ ] Verify box levels (1-5) are correct
- [ ] Verify next review dates are calculated correctly
- [ ] Test answering correctly (should move up a box)
- [ ] Test answering incorrectly (should reset to box 1)

### Edge Cases

- [ ] User with no answered questions
- [ ] User with questions answered but none in SR
- [ ] User with all questions in SR
- [ ] Questions with missing options (should handle gracefully)
- [ ] Multiple answers to same question (deduplication)

---

## Future Refactoring Notes

These files are **candidates for future simplification**:

### Option 1: Use Drizzle Relational Query API
Could potentially use `db.query.*` with `with` relations instead of manual joins:
```typescript
const data = await db.query.userQuestionProgress.findMany({
    where: eq(userQuestionProgress.userId, userId),
    with: {
        question: {
            with: {
                options: true,
                video: true
            }
        }
    }
});
```

### Option 2: Extract Common Patterns
Create a shared utility function for the manual grouping pattern since it's repeated across all 4 files.

### Option 3: Database Views
Consider creating PostgreSQL views for complex queries, then query the views with Drizzle.

---

## Build Verification

✅ **Build Status:** Passing
✅ **TypeScript:** No errors
✅ **Dev Server:** Starts successfully
⚠️ **Manual Testing:** Required (tests need database connection)

---

## Notes

- Original Supabase code is preserved as comments in each file
- File #2 (`get-questions-for-initial-review.ts`) has **improved performance** vs original
- All files use `camelCase` properties (Drizzle) vs `snake_case` (Supabase)
- Soft delete feature was removed in a previous commit (no more `deleted_at` checks)
