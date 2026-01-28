export type QuestionOption = {
    id: number;
    optionText: string;
    isCorrect: boolean;
    explanation: string | null;
};

export type TermQuestion = {
    id: number;
    questionText: string;
    options: QuestionOption[];
    sourceTimestamp: number | null;
};

export type TermFlashcard = {
    id: number;
    front: string;
    back: string;
};

export type Term = {
    id: number;
    itemType: "question" | "flashcard";
    question?: TermQuestion;
    flashcard?: TermFlashcard;
};

export type StudyMode = "flashcards" | "quiz" | "both";

// Import and re-export domain types for convenience
import type {
    MasteryStatus as MasteryStatusType,
    StudySetProgress as StudySetProgressType,
} from "@/clean-architecture/use-cases/study-set/get-study-set-progress.use-case";

export type MasteryStatus = MasteryStatusType;
export type StudySetProgress = StudySetProgressType;

export type TermWithMastery = Term & {
    masteryStatus: MasteryStatus;
};

// Type for edited term content during inline editing
export type EditedTermContent = {
    // Flashcard fields
    front?: string;
    back?: string;
    // Question fields
    questionText?: string;
    options?: QuestionOption[];
};

// Character limits for validation (matches backend schema)
export const CHARACTER_LIMITS = {
    flashcardFront: 500,
    flashcardBack: 2000,
    questionText: 1000,
    optionText: 500,
} as const;
