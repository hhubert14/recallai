import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";

export interface EditQuestionInput {
    userId: string;
    questionId: number;
    questionText: string;
    options: Array<{
        id: number;
        optionText: string;
        isCorrect: boolean;
        explanation: string | null;
    }>;
}

export class EditQuestionUseCase {
    constructor(
        private readonly questionRepository: IQuestionRepository,
        private readonly reviewableItemRepository: IReviewableItemRepository
    ) {}

    async execute(input: EditQuestionInput): Promise<MultipleChoiceQuestionEntity> {
        const { userId, questionId, questionText, options } = input;

        // Find the question
        const question = await this.questionRepository.findQuestionById(questionId);
        if (!question) {
            throw new Error("Question not found");
        }

        // Verify ownership via reviewable item
        const reviewableItem = await this.reviewableItemRepository.findReviewableItemByQuestionId(questionId);
        if (!reviewableItem || reviewableItem.userId !== userId) {
            throw new Error("Not authorized to edit this question");
        }

        // Validate question text
        if (!questionText.trim()) {
            throw new Error("Question text cannot be empty");
        }
        if (questionText.length > 1000) {
            throw new Error("Question text cannot exceed 1000 characters");
        }

        // Validate options count
        if (options.length !== 4) {
            throw new Error("Must provide exactly 4 options");
        }

        // Validate that all option IDs belong to this question
        const existingOptionIds = new Set(question.options.map(opt => opt.id));
        for (const option of options) {
            if (!existingOptionIds.has(option.id)) {
                throw new Error("Invalid option ID: option does not belong to this question");
            }
        }

        // Validate exactly one correct answer
        const correctCount = options.filter(opt => opt.isCorrect).length;
        if (correctCount !== 1) {
            throw new Error("Exactly one option must be marked as correct");
        }

        // Validate option texts
        for (const option of options) {
            if (!option.optionText.trim()) {
                throw new Error("Option text cannot be empty");
            }
            if (option.optionText.length > 500) {
                throw new Error("Option text cannot exceed 500 characters");
            }
        }

        // Trim whitespace before saving
        const trimmedOptions = options.map(opt => ({
            ...opt,
            optionText: opt.optionText.trim(),
        }));

        // Update the question
        return this.questionRepository.updateQuestion(
            questionId,
            questionText.trim(),
            trimmedOptions
        );
    }
}
