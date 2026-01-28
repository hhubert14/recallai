export type FlashcardSuggestion = {
    tempId: string;
    itemType: "flashcard";
    front: string;
    back: string;
};

export type QuestionOptionSuggestion = {
    optionText: string;
    isCorrect: boolean;
    explanation: string;
};

export type QuestionSuggestion = {
    tempId: string;
    itemType: "question";
    questionText: string;
    options: QuestionOptionSuggestion[];
};

export type Suggestion = FlashcardSuggestion | QuestionSuggestion;

export type GeneratedSuggestionsDto = {
    suggestions: Suggestion[];
};

export type SuggestionItemType = "mix" | "flashcards" | "questions";

export interface GenerateSuggestionsInput {
    prompt: string;
    count: number;
    itemType: SuggestionItemType;
    title?: string;
    transcript?: string;
}

export interface ISuggestionGeneratorService {
    generate(
        input: GenerateSuggestionsInput
    ): Promise<GeneratedSuggestionsDto | undefined>;
}
