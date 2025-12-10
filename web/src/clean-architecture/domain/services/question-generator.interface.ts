export type GeneratedQuestionDto = {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
};

export type GeneratedQuestionsDto = {
    questions: GeneratedQuestionDto[];
};

export interface IQuestionGeneratorService {
    generate(
        title: string,
        transcript: string,
        count: number
    ): Promise<GeneratedQuestionsDto | undefined>;
}
