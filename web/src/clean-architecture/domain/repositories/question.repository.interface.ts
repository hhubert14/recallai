import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";

export interface IQuestionRepository {
    createMultipleChoiceQuestion(
        videoId: number,
        questionText: string,
        options: {
            optionText: string;
            isCorrect: boolean;
            orderIndex: number;
            explanation: string | null;
        }[]
    ): Promise<MultipleChoiceQuestionEntity>;

    findQuestionById(questionId: number): Promise<MultipleChoiceQuestionEntity | null>;

    findQuestionsByVideoId(videoId: number): Promise<MultipleChoiceQuestionEntity[]>;
}
