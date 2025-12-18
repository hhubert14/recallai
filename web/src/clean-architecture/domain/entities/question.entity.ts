// Base interface - common fields across all question types
interface BaseQuestion {
    id: number;
    videoId: number;
}

// Multiple choice option (value object)
export class MultipleChoiceOption {
    constructor(
        public readonly id: number,
        public readonly optionText: string,
        public readonly isCorrect: boolean,
        public readonly orderIndex: number | null,
        public readonly explanation: string | null,
    ) {}
}

// Multiple choice question (only type we support now)
export class MultipleChoiceQuestionEntity implements BaseQuestion {
    readonly questionType = "multiple_choice" as const;

    constructor(
        public readonly id: number,
        public readonly videoId: number,
        public readonly questionText: string,
        public readonly options: MultipleChoiceOption[],
        public readonly sourceQuote: string | null,
        public readonly sourceTimestamp: number | null,
    ) {}
}

// Union type for all question types (future-proof for flashcards, etc.)
export type QuestionEntity = MultipleChoiceQuestionEntity;
