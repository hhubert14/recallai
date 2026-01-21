export type GeneratedQuestionDto = {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    sourceQuote: string;
};

export type GeneratedQuestionsDto = {
    questions: GeneratedQuestionDto[];
};

export interface IQuestionGeneratorService {
    generate(
        title: string,
        transcript: string,
        count: number,
        existingQuestions?: string[]
    ): Promise<GeneratedQuestionsDto | undefined>;
}
