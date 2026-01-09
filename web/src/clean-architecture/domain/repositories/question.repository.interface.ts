import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";

export interface IQuestionRepository {
    createMultipleChoiceQuestion(
        videoId: number,
        questionText: string,
        options: {
            optionText: string;
            isCorrect: boolean;
            explanation: string | null;
        }[],
        sourceQuote: string | null,
        sourceTimestamp: number | null
    ): Promise<MultipleChoiceQuestionEntity>;

    findQuestionById(questionId: number): Promise<MultipleChoiceQuestionEntity | null>;

    findQuestionsByVideoId(videoId: number): Promise<MultipleChoiceQuestionEntity[]>;
}
