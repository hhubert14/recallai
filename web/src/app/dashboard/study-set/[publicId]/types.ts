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
