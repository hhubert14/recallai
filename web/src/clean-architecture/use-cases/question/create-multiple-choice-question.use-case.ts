import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";

export class CreateMultipleChoiceQuestionUseCase {
    constructor(private readonly questionRepository: IQuestionRepository) {}

    async execute(
        videoId: number,
        questionText: string,
        options: {
            optionText: string;
            isCorrect: boolean;
            orderIndex: number;
            explanation: string | null;
        }[],
        sourceQuote: string | null = null,
        sourceTimestamp: number | null = null
    ): Promise<MultipleChoiceQuestionEntity> {
        return await this.questionRepository.createMultipleChoiceQuestion(
            videoId,
            questionText,
            options,
            sourceQuote,
            sourceTimestamp
        );
    }
}
