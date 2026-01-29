import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";

export interface DeleteQuestionInput {
    questionId: number;
    userId: string;
}

export class DeleteQuestionUseCase {
    constructor(
        private readonly questionRepository: IQuestionRepository,
        private readonly reviewableItemRepository: IReviewableItemRepository
    ) {}

    async execute(input: DeleteQuestionInput): Promise<void> {
        const question = await this.questionRepository.findQuestionById(input.questionId);

        if (!question) {
            throw new Error("Question not found");
        }

        // Questions don't have userId directly - ownership is via reviewable item
        const reviewableItem = await this.reviewableItemRepository.findReviewableItemByQuestionId(
            input.questionId
        );

        // Return same error for both "not found" and "wrong user" to avoid leaking info
        if (!reviewableItem || reviewableItem.userId !== input.userId) {
            throw new Error("Question not found");
        }

        await this.questionRepository.deleteQuestion(input.questionId);
    }
}
