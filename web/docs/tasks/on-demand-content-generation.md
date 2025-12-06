# On-Demand Content Generation

This document outlines the future implementation of on-demand question and flashcard generation.

## Background

Currently, video processing (`POST /api/v1/videos/[url]/process`) creates a video record and generates a summary. Questions and flashcards are generated on-demand from the dashboard.

## On-demand Question Generation

### API Endpoint

```
POST /api/v1/videos/[id]/generate-questions
```

### Requirements

- User triggers from the dashboard video page
- Generates multiple-choice questions from video transcript
- Stores questions in existing `questions` and `question_options` tables
- Integrates with existing spaced repetition system (`user_question_progress`)

### Implementation Notes

- Reuse existing `LangChainQuestionGeneratorService`
- Reuse existing `DrizzleQuestionRepository.createMultipleChoiceQuestion()`
- Add UI button on video detail page to trigger generation
- Show loading state during generation
- Display generated questions after completion

## Flashcard Generation

### API Endpoint

```
POST /api/v1/videos/[id]/generate-flashcards
```

### Requirements

- New question type alongside multiple-choice
- User triggers from the dashboard video page
- Generates front/back flashcard pairs from video content

### Implementation Notes

- May require new database table for flashcard-specific data (front, back, hints)
- Or extend existing questions table with `question_type` discriminator
- Create new `IFlashcardGeneratorService` interface
- Implement `LangChainFlashcardGeneratorService`
- Add UI for flashcard review (different from multiple-choice quiz)

## Database Considerations

### Option A: Extend Questions Table

Add a `question_type` column to distinguish between:
- `multiple_choice` (existing)
- `flashcard` (new)

Pros: Simpler, reuses existing spaced repetition tracking
Cons: Different data shapes in same table

### Option B: Separate Flashcards Table

Create new `flashcards` table with:
- `id`, `video_id`, `front`, `back`, `hints`, `created_at`

Create new `user_flashcard_progress` table for spaced repetition.

Pros: Cleaner separation, type-safe
Cons: Duplicates spaced repetition logic

## UI Considerations

- Add "Generate Questions" button on video detail page (when no questions exist)
- Add "Generate Flashcards" button on video detail page
- Show generation progress/status
- Allow regeneration if user wants different questions
