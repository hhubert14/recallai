import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { MultipleChoiceQuestion } from "@/clean-architecture/domain/entities/question.entity";

export class FindQuestionsByVideoIdUseCase {
    constructor(private readonly questionRepository: IQuestionRepository) {}

    async execute(videoId: number): Promise<MultipleChoiceQuestion[]> {
        return await this.questionRepository.findQuestionsByVideoId(videoId);
    }
}
