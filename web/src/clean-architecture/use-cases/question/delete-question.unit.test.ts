import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteQuestionUseCase } from "./delete-question.use-case";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import {
    MultipleChoiceQuestionEntity,
    MultipleChoiceOption,
} from "@/clean-architecture/domain/entities/question.entity";
describe("DeleteQuestionUseCase", () => {
    let useCase: DeleteQuestionUseCase;
    let mockQuestionRepository: IQuestionRepository;
    let mockReviewableItemRepository: IReviewableItemRepository;

    beforeEach(() => {
        mockQuestionRepository = {
            createMultipleChoiceQuestion: vi.fn(),
            findQuestionById: vi.fn(),
            findQuestionsByVideoId: vi.fn(),
            findQuestionsByIds: vi.fn(),
            countQuestionsByVideoIds: vi.fn(),
            updateQuestion: vi.fn(),
            deleteQuestion: vi.fn(),
        };

        mockReviewableItemRepository = {
            createReviewableItemsForQuestionsBatch: vi.fn(),
            createReviewableItemsForFlashcardsBatch: vi.fn(),
            findReviewableItemsByUserId: vi.fn(),
            findReviewableItemsByUserIdAndVideoId: vi.fn(),
            findReviewableItemsByStudySetId: vi.fn(),
            findReviewableItemsByUserIdAndStudySetId: vi.fn(),
            findReviewableItemByQuestionId: vi.fn(),
            findReviewableItemByFlashcardId: vi.fn(),
            findReviewableItemById: vi.fn(),
            findReviewableItemsByIds: vi.fn(),
            countItemsByStudySetId: vi.fn(),
            countItemsByStudySetIdsBatch: vi.fn(),
        };

        useCase = new DeleteQuestionUseCase(
            mockQuestionRepository,
            mockReviewableItemRepository
        );
    });

    const createMockQuestion = (id: number, videoId: number | null = 100) => {
        return new MultipleChoiceQuestionEntity(
            id,
            videoId,
            "What is the answer?",
            [
                new MultipleChoiceOption(1, "Option A", true, "Correct!"),
                new MultipleChoiceOption(2, "Option B", false, null),
                new MultipleChoiceOption(3, "Option C", false, null),
                new MultipleChoiceOption(4, "Option D", false, null),
            ],
            null,
            null
        );
    };

    const createMockReviewableItem = (
        questionId: number,
        userId: string
    ) => {
        return {
            id: 1,
            userId,
            itemType: "question" as const,
            videoId: 100,
            studySetId: 1,
            questionId,
            flashcardId: null,
            createdAt: "2025-01-25T10:00:00Z",
            isQuestion: () => true,
            isFlashcard: () => false,
        };
    };

    it("deletes a question belonging to the user", async () => {
        const question = createMockQuestion(1);
        const reviewableItem = createMockReviewableItem(1, "user-123");

        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(question);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(
            reviewableItem
        );
        vi.mocked(mockQuestionRepository.deleteQuestion).mockResolvedValue(undefined);

        await useCase.execute({ questionId: 1, userId: "user-123" });

        expect(mockQuestionRepository.findQuestionById).toHaveBeenCalledWith(1);
        expect(mockReviewableItemRepository.findReviewableItemByQuestionId).toHaveBeenCalledWith(1);
        expect(mockQuestionRepository.deleteQuestion).toHaveBeenCalledWith(1);
    });

    it("deletes a question without a video (manual study set)", async () => {
        const question = createMockQuestion(1, null);
        const reviewableItem = {
            id: 1,
            userId: "user-123",
            itemType: "question" as const,
            videoId: null,
            studySetId: 1,
            questionId: 1,
            flashcardId: null,
            createdAt: "2025-01-25T10:00:00Z",
            isQuestion: () => true,
            isFlashcard: () => false,
        };

        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(question);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(
            reviewableItem
        );
        vi.mocked(mockQuestionRepository.deleteQuestion).mockResolvedValue(undefined);

        await useCase.execute({ questionId: 1, userId: "user-123" });

        expect(mockQuestionRepository.deleteQuestion).toHaveBeenCalledWith(1);
    });

    it("throws error when question does not exist", async () => {
        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(null);

        await expect(
            useCase.execute({ questionId: 999, userId: "user-123" })
        ).rejects.toThrow("Question not found");

        expect(mockQuestionRepository.deleteQuestion).not.toHaveBeenCalled();
    });

    it("throws error when reviewable item does not exist", async () => {
        const question = createMockQuestion(1);

        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(question);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(
            null
        );

        await expect(
            useCase.execute({ questionId: 1, userId: "user-123" })
        ).rejects.toThrow("Question not found");

        expect(mockQuestionRepository.deleteQuestion).not.toHaveBeenCalled();
    });

    it("throws error when question belongs to different user", async () => {
        const question = createMockQuestion(1);
        const reviewableItem = createMockReviewableItem(1, "other-user");

        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(question);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(
            reviewableItem
        );

        // Same error message as "not found" to avoid leaking info
        await expect(
            useCase.execute({ questionId: 1, userId: "user-123" })
        ).rejects.toThrow("Question not found");

        expect(mockQuestionRepository.deleteQuestion).not.toHaveBeenCalled();
    });
});
