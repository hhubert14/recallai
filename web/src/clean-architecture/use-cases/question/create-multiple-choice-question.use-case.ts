import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { MultipleChoiceQuestion } from "@/clean-architecture/domain/entities/question.entity";

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
        }[]
    ): Promise<MultipleChoiceQuestion> {
        return await this.questionRepository.createMultipleChoiceQuestion(
            videoId,
            questionText,
            options
        );
    }
}
