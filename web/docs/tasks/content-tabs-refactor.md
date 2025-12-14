# ContentTabs Refactor (Future Task)

This document outlines the refactoring needed to reduce code duplication in `ContentTabs.tsx`.

## Problem

The `ContentTabs.tsx` component (`src/app/dashboard/video/[id]/ContentTabs.tsx`) contains nearly identical code for questions and flashcards generation:

- Duplicate state variables (`isGeneratingQuestions` / `isGeneratingFlashcards`, `questionError` / `flashcardError`, etc.)
- Duplicate handler functions (`handleGenerateQuestions` / `handleGenerateFlashcards`)
- Duplicate UI sections (loading spinner, empty state with generate button, "Generate More" section)

The file has a TODO comment acknowledging this: `// TODO: Refactor file to be less verbose, we can potentially use layouts or parent containers`

## Current Duplication

### State Variables (duplicated pattern)
```typescript
const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(5);
const [selectedFlashcardCount, setSelectedFlashcardCount] = useState<number>(5);
const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
const [questionError, setQuestionError] = useState<string | null>(null);
const [flashcardError, setFlashcardError] = useState<string | null>(null);
```

### Handler Functions (nearly identical logic)
```typescript
async function handleGenerateQuestions() { /* ... */ }
async function handleGenerateFlashcards() { /* ... */ }
```

### UI Sections (copy-pasted with minor text changes)
- Loading state with spinner
- Empty state with count selector and generate button
- "Generate More" section with remaining capacity display

## Proposed Solution

### Option 1: Custom Hook + Shared Component

Extract a custom hook for generation logic:

```typescript
// useContentGeneration.ts
function useContentGeneration<T>(config: {
  endpoint: string;
  maxItems: number;
  itemKey: string; // 'questions' or 'flashcards'
}) {
  const [items, setItems] = useState<T[]>([]);
  const [selectedCount, setSelectedCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingCapacity = config.maxItems - items.length;
  const canGenerate = remainingCapacity > 0;

  async function handleGenerate(videoId: number) {
    // ... shared generation logic
  }

  return {
    items,
    setItems,
    selectedCount,
    setSelectedCount,
    isGenerating,
    error,
    remainingCapacity,
    canGenerate,
    handleGenerate,
  };
}
```

Extract a shared UI component:

```typescript
// GenerationPanel.tsx
interface GenerationPanelProps<T> {
  items: T[];
  isGenerating: boolean;
  error: string | null;
  selectedCount: number;
  onCountChange: (count: number) => void;
  onGenerate: () => void;
  canGenerate: boolean;
  remainingCapacity: number;
  maxItems: number;
  itemLabel: string; // "questions" or "flashcards"
  renderItems: (items: T[]) => React.ReactNode;
  countOptions: number[];
}

function GenerationPanel<T>({ ... }: GenerationPanelProps<T>) {
  // Shared loading, empty, and content states
}
```

### Option 2: Render Props Pattern

Create a generic generation container:

```typescript
<GenerationContainer
  endpoint="/api/v1/questions/generate"
  maxItems={20}
  itemLabel="questions"
  videoId={videoId}
>
  {({ items, isGenerating, generate }) => (
    <QuizInterface questions={items} />
  )}
</GenerationContainer>
```

### Recommendation

Option 1 (Custom Hook + Shared Component) is preferred because:
- Clearer separation of concerns
- Easier to test the hook independently
- More flexible for future content types

## Additional Cleanup

### Shared Constants

`VALID_COUNTS` is duplicated across multiple files:
- `ContentTabs.tsx`
- `generate-flashcards.use-case.ts`
- `generate-multiple-choice-questions.use-case.ts`
- API routes

Create a shared constant:

```typescript
// src/lib/constants/generation.ts
export const VALID_GENERATION_COUNTS = [5, 10, 20] as const;
export const MAX_QUESTIONS_PER_VIDEO = 20;
export const MAX_FLASHCARDS_PER_VIDEO = 20;
```

## Files to Modify

1. Create `src/hooks/useContentGeneration.ts`
2. Create `src/app/dashboard/video/[id]/GenerationPanel.tsx`
3. Refactor `src/app/dashboard/video/[id]/ContentTabs.tsx`
4. Create `src/lib/constants/generation.ts`
5. Update use cases and API routes to use shared constants

## Priority

Low - The current implementation works correctly. This is a code quality improvement that can be addressed when adding new content types or during a dedicated refactoring effort.
