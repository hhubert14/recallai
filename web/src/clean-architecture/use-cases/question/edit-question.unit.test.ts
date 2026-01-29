import { describe, it, expect, vi, beforeEach } from "vitest";
import { EditQuestionUseCase } from "./edit-question.use-case";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import {
    MultipleChoiceQuestionEntity,
    MultipleChoiceOption,
} from "@/clean-architecture/domain/entities/question.entity";
import { ReviewableItemEntity } from "@/clean-architecture/domain/entities/reviewable-item.entity";

describe("EditQuestionUseCase", () => {
    let useCase: EditQuestionUseCase;
    let mockQuestionRepository: IQuestionRepository;
    let mockReviewableItemRepository: IReviewableItemRepository;

    const userId = "user-123";
    const questionId = 100;

    const existingOptions = [
        new MultipleChoiceOption(1, "Option A", true, "Explanation A"),
        new MultipleChoiceOption(2, "Option B", false, null),
        new MultipleChoiceOption(3, "Option C", false, null),
        new MultipleChoiceOption(4, "Option D", false, null),
    ];

    const existingQuestion = new MultipleChoiceQuestionEntity(
        questionId,
        null,
        "Original question text",
        existingOptions,
        null,
        null
    );

    const reviewableItem = new ReviewableItemEntity(
        200,
        userId,
        "question",
        questionId,
        null,
        null,
        1,
        "2025-01-20T10:00:00Z"
    );

    const validUpdateOptions = [
        { id: 1, optionText: "Updated A", isCorrect: false, explanation: null },
        { id: 2, optionText: "Updated B", isCorrect: true, explanation: "Now correct" },
        { id: 3, optionText: "Updated C", isCorrect: false, explanation: null },
        { id: 4, optionText: "Updated D", isCorrect: false, explanation: null },
    ];

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

        useCase = new EditQuestionUseCase(
            mockQuestionRepository,
            mockReviewableItemRepository
        );
    });

    it("updates a question successfully", async () => {
        const updatedOptions = [
            new MultipleChoiceOption(1, "Updated A", false, null),
            new MultipleChoiceOption(2, "Updated B", true, "Now correct"),
            new MultipleChoiceOption(3, "Updated C", false, null),
            new MultipleChoiceOption(4, "Updated D", false, null),
        ];

        const updatedQuestion = new MultipleChoiceQuestionEntity(
            questionId,
            null,
            "Updated question text",
            updatedOptions,
            null,
            null
        );

        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(existingQuestion);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(reviewableItem);
        vi.mocked(mockQuestionRepository.updateQuestion).mockResolvedValue(updatedQuestion);

        const result = await useCase.execute({
            userId,
            questionId,
            questionText: "Updated question text",
            options: validUpdateOptions,
        });

        expect(result).toEqual(updatedQuestion);
        expect(mockQuestionRepository.findQuestionById).toHaveBeenCalledWith(questionId);
        expect(mockReviewableItemRepository.findReviewableItemByQuestionId).toHaveBeenCalledWith(questionId);
        expect(mockQuestionRepository.updateQuestion).toHaveBeenCalledWith(
            questionId,
            "Updated question text",
            validUpdateOptions
        );
    });

    it("throws 'Question not found' when question does not exist", async () => {
        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(null);

        await expect(
            useCase.execute({
                userId,
                questionId: 999,
                questionText: "New text",
                options: validUpdateOptions,
            })
        ).rejects.toThrow("Question not found");

        expect(mockQuestionRepository.updateQuestion).not.toHaveBeenCalled();
    });

    it("throws 'Not authorized to edit this question' when user does not own the question", async () => {
        const otherUserReviewableItem = new ReviewableItemEntity(
            200,
            "other-user-456",
            "question",
            questionId,
            null,
            null,
            1,
            "2025-01-20T10:00:00Z"
        );

        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(existingQuestion);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(otherUserReviewableItem);

        await expect(
            useCase.execute({
                userId,
                questionId,
                questionText: "New text",
                options: validUpdateOptions,
            })
        ).rejects.toThrow("Not authorized to edit this question");

        expect(mockQuestionRepository.updateQuestion).not.toHaveBeenCalled();
    });

    it("throws 'Not authorized to edit this question' when reviewable item not found", async () => {
        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(existingQuestion);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(null);

        await expect(
            useCase.execute({
                userId,
                questionId,
                questionText: "New text",
                options: validUpdateOptions,
            })
        ).rejects.toThrow("Not authorized to edit this question");

        expect(mockQuestionRepository.updateQuestion).not.toHaveBeenCalled();
    });

    it("throws 'Question text cannot be empty' when question text is empty", async () => {
        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(existingQuestion);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(reviewableItem);

        await expect(
            useCase.execute({
                userId,
                questionId,
                questionText: "   ",
                options: validUpdateOptions,
            })
        ).rejects.toThrow("Question text cannot be empty");

        expect(mockQuestionRepository.updateQuestion).not.toHaveBeenCalled();
    });

    it("throws 'Question text cannot exceed 1000 characters' when question text is too long", async () => {
        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(existingQuestion);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(reviewableItem);

        const longQuestionText = "a".repeat(1001);

        await expect(
            useCase.execute({
                userId,
                questionId,
                questionText: longQuestionText,
                options: validUpdateOptions,
            })
        ).rejects.toThrow("Question text cannot exceed 1000 characters");

        expect(mockQuestionRepository.updateQuestion).not.toHaveBeenCalled();
    });

    it("accepts question text with exactly 1000 characters", async () => {
        const updatedQuestion = new MultipleChoiceQuestionEntity(
            questionId,
            null,
            "a".repeat(1000),
            existingOptions,
            null,
            null
        );

        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(existingQuestion);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(reviewableItem);
        vi.mocked(mockQuestionRepository.updateQuestion).mockResolvedValue(updatedQuestion);

        const result = await useCase.execute({
            userId,
            questionId,
            questionText: "a".repeat(1000),
            options: validUpdateOptions,
        });

        expect(result).toEqual(updatedQuestion);
    });

    it("throws 'Must provide exactly 4 options' when less than 4 options provided", async () => {
        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(existingQuestion);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(reviewableItem);

        await expect(
            useCase.execute({
                userId,
                questionId,
                questionText: "Question text",
                options: [
                    { id: 1, optionText: "A", isCorrect: true, explanation: null },
                    { id: 2, optionText: "B", isCorrect: false, explanation: null },
                    { id: 3, optionText: "C", isCorrect: false, explanation: null },
                ],
            })
        ).rejects.toThrow("Must provide exactly 4 options");

        expect(mockQuestionRepository.updateQuestion).not.toHaveBeenCalled();
    });

    it("throws 'Must provide exactly 4 options' when more than 4 options provided", async () => {
        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(existingQuestion);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(reviewableItem);

        await expect(
            useCase.execute({
                userId,
                questionId,
                questionText: "Question text",
                options: [
                    { id: 1, optionText: "A", isCorrect: true, explanation: null },
                    { id: 2, optionText: "B", isCorrect: false, explanation: null },
                    { id: 3, optionText: "C", isCorrect: false, explanation: null },
                    { id: 4, optionText: "D", isCorrect: false, explanation: null },
                    { id: 5, optionText: "E", isCorrect: false, explanation: null },
                ],
            })
        ).rejects.toThrow("Must provide exactly 4 options");

        expect(mockQuestionRepository.updateQuestion).not.toHaveBeenCalled();
    });

    it("throws error when option ID does not belong to the question", async () => {
        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(existingQuestion);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(reviewableItem);

        const optionsWithInvalidId = [
            { id: 1, optionText: "A", isCorrect: true, explanation: null },
            { id: 2, optionText: "B", isCorrect: false, explanation: null },
            { id: 3, optionText: "C", isCorrect: false, explanation: null },
            { id: 999, optionText: "D", isCorrect: false, explanation: null }, // Invalid ID
        ];

        await expect(
            useCase.execute({
                userId,
                questionId,
                questionText: "Question text",
                options: optionsWithInvalidId,
            })
        ).rejects.toThrow("Invalid option ID: option does not belong to this question");

        expect(mockQuestionRepository.updateQuestion).not.toHaveBeenCalled();
    });

    it("throws error when all option IDs are from a different question", async () => {
        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(existingQuestion);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(reviewableItem);

        const optionsFromDifferentQuestion = [
            { id: 100, optionText: "A", isCorrect: true, explanation: null },
            { id: 101, optionText: "B", isCorrect: false, explanation: null },
            { id: 102, optionText: "C", isCorrect: false, explanation: null },
            { id: 103, optionText: "D", isCorrect: false, explanation: null },
        ];

        await expect(
            useCase.execute({
                userId,
                questionId,
                questionText: "Question text",
                options: optionsFromDifferentQuestion,
            })
        ).rejects.toThrow("Invalid option ID: option does not belong to this question");

        expect(mockQuestionRepository.updateQuestion).not.toHaveBeenCalled();
    });

    it("throws 'Exactly one option must be marked as correct' when no option is correct", async () => {
        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(existingQuestion);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(reviewableItem);

        await expect(
            useCase.execute({
                userId,
                questionId,
                questionText: "Question text",
                options: [
                    { id: 1, optionText: "A", isCorrect: false, explanation: null },
                    { id: 2, optionText: "B", isCorrect: false, explanation: null },
                    { id: 3, optionText: "C", isCorrect: false, explanation: null },
                    { id: 4, optionText: "D", isCorrect: false, explanation: null },
                ],
            })
        ).rejects.toThrow("Exactly one option must be marked as correct");

        expect(mockQuestionRepository.updateQuestion).not.toHaveBeenCalled();
    });

    it("throws 'Exactly one option must be marked as correct' when multiple options are correct", async () => {
        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(existingQuestion);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(reviewableItem);

        await expect(
            useCase.execute({
                userId,
                questionId,
                questionText: "Question text",
                options: [
                    { id: 1, optionText: "A", isCorrect: true, explanation: null },
                    { id: 2, optionText: "B", isCorrect: true, explanation: null },
                    { id: 3, optionText: "C", isCorrect: false, explanation: null },
                    { id: 4, optionText: "D", isCorrect: false, explanation: null },
                ],
            })
        ).rejects.toThrow("Exactly one option must be marked as correct");

        expect(mockQuestionRepository.updateQuestion).not.toHaveBeenCalled();
    });

    it("throws 'Option text cannot be empty' when any option text is empty", async () => {
        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(existingQuestion);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(reviewableItem);

        await expect(
            useCase.execute({
                userId,
                questionId,
                questionText: "Question text",
                options: [
                    { id: 1, optionText: "A", isCorrect: true, explanation: null },
                    { id: 2, optionText: "   ", isCorrect: false, explanation: null },
                    { id: 3, optionText: "C", isCorrect: false, explanation: null },
                    { id: 4, optionText: "D", isCorrect: false, explanation: null },
                ],
            })
        ).rejects.toThrow("Option text cannot be empty");

        expect(mockQuestionRepository.updateQuestion).not.toHaveBeenCalled();
    });

    it("throws 'Option text cannot exceed 500 characters' when any option text is too long", async () => {
        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(existingQuestion);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(reviewableItem);

        const longOptionText = "a".repeat(501);

        await expect(
            useCase.execute({
                userId,
                questionId,
                questionText: "Question text",
                options: [
                    { id: 1, optionText: longOptionText, isCorrect: true, explanation: null },
                    { id: 2, optionText: "B", isCorrect: false, explanation: null },
                    { id: 3, optionText: "C", isCorrect: false, explanation: null },
                    { id: 4, optionText: "D", isCorrect: false, explanation: null },
                ],
            })
        ).rejects.toThrow("Option text cannot exceed 500 characters");

        expect(mockQuestionRepository.updateQuestion).not.toHaveBeenCalled();
    });

    it("accepts option text with exactly 500 characters", async () => {
        const updatedQuestion = new MultipleChoiceQuestionEntity(
            questionId,
            null,
            "Question text",
            existingOptions,
            null,
            null
        );

        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(existingQuestion);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(reviewableItem);
        vi.mocked(mockQuestionRepository.updateQuestion).mockResolvedValue(updatedQuestion);

        const optionsWithLongText = [
            { id: 1, optionText: "a".repeat(500), isCorrect: true, explanation: null },
            { id: 2, optionText: "B", isCorrect: false, explanation: null },
            { id: 3, optionText: "C", isCorrect: false, explanation: null },
            { id: 4, optionText: "D", isCorrect: false, explanation: null },
        ];

        const result = await useCase.execute({
            userId,
            questionId,
            questionText: "Question text",
            options: optionsWithLongText,
        });

        expect(result).toEqual(updatedQuestion);
    });

    it("trims whitespace from questionText and optionText before saving", async () => {
        const updatedQuestion = new MultipleChoiceQuestionEntity(
            questionId,
            null,
            "Trimmed question",
            existingOptions,
            null,
            null
        );

        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(existingQuestion);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(reviewableItem);
        vi.mocked(mockQuestionRepository.updateQuestion).mockResolvedValue(updatedQuestion);

        await useCase.execute({
            userId,
            questionId,
            questionText: "  Trimmed question  ",
            options: [
                { id: 1, optionText: "  Trimmed A  ", isCorrect: true, explanation: null },
                { id: 2, optionText: "  Trimmed B  ", isCorrect: false, explanation: null },
                { id: 3, optionText: "  Trimmed C  ", isCorrect: false, explanation: null },
                { id: 4, optionText: "  Trimmed D  ", isCorrect: false, explanation: null },
            ],
        });

        expect(mockQuestionRepository.updateQuestion).toHaveBeenCalledWith(
            questionId,
            "Trimmed question",
            [
                { id: 1, optionText: "Trimmed A", isCorrect: true, explanation: null },
                { id: 2, optionText: "Trimmed B", isCorrect: false, explanation: null },
                { id: 3, optionText: "Trimmed C", isCorrect: false, explanation: null },
                { id: 4, optionText: "Trimmed D", isCorrect: false, explanation: null },
            ]
        );
    });

    it("updates a question with videoId", async () => {
        const questionWithVideo = new MultipleChoiceQuestionEntity(
            questionId,
            42,
            "Original question",
            existingOptions,
            "Source quote",
            120
        );

        const reviewableItemWithVideo = new ReviewableItemEntity(
            200,
            userId,
            "question",
            questionId,
            null,
            42,
            1,
            "2025-01-20T10:00:00Z"
        );

        const updatedQuestion = new MultipleChoiceQuestionEntity(
            questionId,
            42,
            "Updated question",
            existingOptions,
            "Source quote",
            120
        );

        vi.mocked(mockQuestionRepository.findQuestionById).mockResolvedValue(questionWithVideo);
        vi.mocked(mockReviewableItemRepository.findReviewableItemByQuestionId).mockResolvedValue(reviewableItemWithVideo);
        vi.mocked(mockQuestionRepository.updateQuestion).mockResolvedValue(updatedQuestion);

        const result = await useCase.execute({
            userId,
            questionId,
            questionText: "Updated question",
            options: validUpdateOptions,
        });

        expect(result).toEqual(updatedQuestion);
    });
});
