import type { Question, QuestionOption, Flashcard, StudySetContent } from '@/services/api';

let questionIdCounter = 1;
let optionIdCounter = 1;
let flashcardIdCounter = 1;

export function resetFactoryCounters() {
  questionIdCounter = 1;
  optionIdCounter = 1;
  flashcardIdCounter = 1;
}

export function createMockQuestionOption(
  overrides: Partial<QuestionOption> = {}
): QuestionOption {
  return {
    id: optionIdCounter++,
    optionText: 'Option text',
    isCorrect: false,
    explanation: null,
    ...overrides,
  };
}

export function createMockQuestion(overrides: Partial<Question> = {}): Question {
  const id = overrides.id ?? questionIdCounter++;
  return {
    id,
    questionText: `Question ${id}?`,
    options: [
      createMockQuestionOption({ optionText: 'Option A', isCorrect: true, explanation: 'This is correct because...' }),
      createMockQuestionOption({ optionText: 'Option B' }),
      createMockQuestionOption({ optionText: 'Option C' }),
      createMockQuestionOption({ optionText: 'Option D' }),
    ],
    ...overrides,
  };
}

export function createMockFlashcard(overrides: Partial<Flashcard> = {}): Flashcard {
  const id = overrides.id ?? flashcardIdCounter++;
  return {
    id,
    front: `Flashcard ${id} front`,
    back: `Flashcard ${id} back`,
    ...overrides,
  };
}

export function createMockStudySetContent(
  overrides: Partial<StudySetContent> = {}
): StudySetContent {
  return {
    exists: true,
    studySet: {
      id: 1,
      publicId: 'test-public-id',
      name: 'Test Study Set',
    },
    video: {
      id: 1,
      title: 'Test Video Title',
      channelName: 'Test Channel',
    },
    summary: {
      id: 1,
      content: 'This is a test summary content.',
    },
    questions: [createMockQuestion(), createMockQuestion(), createMockQuestion()],
    flashcards: [createMockFlashcard(), createMockFlashcard(), createMockFlashcard()],
    ...overrides,
  };
}

export function createEmptyStudySetContent(): StudySetContent {
  return {
    exists: false,
    studySet: null,
    video: null,
    summary: null,
    questions: [],
    flashcards: [],
  };
}
