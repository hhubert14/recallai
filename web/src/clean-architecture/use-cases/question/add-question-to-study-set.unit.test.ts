import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddQuestionToStudySetUseCase } from "./add-question-to-study-set.use-case";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";
import { MultipleChoiceQuestionEntity, MultipleChoiceOption } from "@/clean-architecture/domain/entities/question.entity";
import { ReviewableItemEntity } from "@/clean-architecture/domain/entities/reviewable-item.entity";
import { STUDY_SET_ITEM_LIMIT } from "@/app/dashboard/study-set/[publicId]/types";

describe("AddQuestionToStudySetUseCase", () => {
    let useCase: AddQuestionToStudySetUseCase;
    let mockStudySetRepository: IStudySetRepository;
    let mockQuestionRepository: IQuestionRepository;
    let mockReviewableItemRepository: IReviewableItemRepository;

    const userId = "user-123";
    const studySetPublicId = "abc-def-123";

    const validOptions = [
        { optionText: "Option A", isCorrect: true, explanation: "Correct because..." },
        { optionText: "Option B", isCorrect: false, explanation: null },
        { optionText: "Option C", isCorrect: false, explanation: null },
        { optionText: "Option D", isCorrect: false, explanation: null },
    ];

    beforeEach(() => {
        mockStudySetRepository = {
            createStudySet: vi.fn(),
            findStudySetById: vi.fn(),
            findStudySetByPublicId: vi.fn(),
            findStudySetsByUserId: vi.fn(),
            findStudySetByVideoId: vi.fn(),
            findStudySetsByIds: vi.fn(),
            updateStudySet: vi.fn(),
        };

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

        useCase = new AddQuestionToStudySetUseCase(
            mockStudySetRepository,
            mockQuestionRepository,
            mockReviewableItemRepository
        );
    });

    it("adds a question to a manual study set (no videoId)", async () => {
        const manualStudySet = new StudySetEntity(
            1,
            studySetPublicId,
            userId,
            "My Manual Set",
            null,
            "manual",
            null,
            "2025-01-20T10:00:00Z",
            "2025-01-20T10:00:00Z"
        );

        const createdQuestion = new MultipleChoiceQuestionEntity(
            100,
            null, // no videoId for manual
            "What is TDD?",
            [
                new MultipleChoiceOption(1, "Option A", true, "Correct because..."),
                new MultipleChoiceOption(2, "Option B", false, null),
                new MultipleChoiceOption(3, "Option C", false, null),
                new MultipleChoiceOption(4, "Option D", false, null),
            ]
        );

        const reviewableItem = new ReviewableItemEntity(
            200,
            userId,
            "question",
            100,
            null,
            null,
            1,
            "2025-01-20T10:00:00Z"
        );

        vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(manualStudySet);
        vi.mocked(mockReviewableItemRepository.countItemsByStudySetId).mockResolvedValue(0);
        vi.mocked(mockQuestionRepository.createMultipleChoiceQuestion).mockResolvedValue(createdQuestion);
        vi.mocked(mockReviewableItemRepository.createReviewableItemsForQuestionsBatch).mockResolvedValue([reviewableItem]);

        const result = await useCase.execute({
            userId,
            studySetPublicId,
            questionText: "What is TDD?",
            options: validOptions,
        });

        expect(result).toEqual(createdQuestion);
        expect(mockQuestionRepository.createMultipleChoiceQuestion).toHaveBeenCalledWith(
            null,
            "What is TDD?",
            validOptions
        );
        expect(mockReviewableItemRepository.createReviewableItemsForQuestionsBatch).toHaveBeenCalledWith([
            {
                userId,
                questionId: 100,
                videoId: null,
                studySetId: 1,
            },
        ]);
    });

    it("adds a question to a video-sourced study set (with videoId)", async () => {
        const videoStudySet = new StudySetEntity(
            2,
            studySetPublicId,
            userId,
            "Video Study Set",
            "From YouTube",
            "video",
            42,
            "2025-01-20T10:00:00Z",
            "2025-01-20T10:00:00Z"
        );

        const createdQuestion = new MultipleChoiceQuestionEntity(
            101,
            42,
            "What is React?",
            [
                new MultipleChoiceOption(5, "Option A", true, null),
                new MultipleChoiceOption(6, "Option B", false, null),
                new MultipleChoiceOption(7, "Option C", false, null),
                new MultipleChoiceOption(8, "Option D", false, null),
            ]
        );

        const reviewableItem = new ReviewableItemEntity(
            201,
            userId,
            "question",
            101,
            null,
            42,
            2,
            "2025-01-20T10:00:00Z"
        );

        vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(videoStudySet);
        vi.mocked(mockReviewableItemRepository.countItemsByStudySetId).mockResolvedValue(0);
        vi.mocked(mockQuestionRepository.createMultipleChoiceQuestion).mockResolvedValue(createdQuestion);
        vi.mocked(mockReviewableItemRepository.createReviewableItemsForQuestionsBatch).mockResolvedValue([reviewableItem]);

        const result = await useCase.execute({
            userId,
            studySetPublicId,
            questionText: "What is React?",
            options: validOptions,
        });

        expect(result).toEqual(createdQuestion);
        expect(mockQuestionRepository.createMultipleChoiceQuestion).toHaveBeenCalledWith(
            42,
            "What is React?",
            validOptions
        );
        expect(mockReviewableItemRepository.createReviewableItemsForQuestionsBatch).toHaveBeenCalledWith([
            {
                userId,
                questionId: 101,
                videoId: 42,
                studySetId: 2,
            },
        ]);
    });

    it("throws error when study set does not exist", async () => {
        vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(null);

        await expect(
            useCase.execute({
                userId,
                studySetPublicId: "nonexistent",
                questionText: "Question?",
                options: validOptions,
            })
        ).rejects.toThrow("Study set not found");

        expect(mockQuestionRepository.createMultipleChoiceQuestion).not.toHaveBeenCalled();
    });

    it("throws error when study set belongs to different user", async () => {
        const otherUserStudySet = new StudySetEntity(
            3,
            studySetPublicId,
            "other-user-456",
            "Other User's Set",
            null,
            "manual",
            null,
            "2025-01-20T10:00:00Z",
            "2025-01-20T10:00:00Z"
        );

        vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(otherUserStudySet);

        await expect(
            useCase.execute({
                userId,
                studySetPublicId,
                questionText: "Question?",
                options: validOptions,
            })
        ).rejects.toThrow("Not authorized to add items to this study set");

        expect(mockQuestionRepository.createMultipleChoiceQuestion).not.toHaveBeenCalled();
    });

    it("throws error when question text is empty", async () => {
        const studySet = new StudySetEntity(
            1,
            studySetPublicId,
            userId,
            "My Set",
            null,
            "manual",
            null,
            "2025-01-20T10:00:00Z",
            "2025-01-20T10:00:00Z"
        );

        vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(studySet);
        vi.mocked(mockReviewableItemRepository.countItemsByStudySetId).mockResolvedValue(0);

        await expect(
            useCase.execute({
                userId,
                studySetPublicId,
                questionText: "   ",
                options: validOptions,
            })
        ).rejects.toThrow("Question text cannot be empty");

        expect(mockQuestionRepository.createMultipleChoiceQuestion).not.toHaveBeenCalled();
    });

    it("throws error when options array does not have exactly 4 options", async () => {
        const studySet = new StudySetEntity(
            1,
            studySetPublicId,
            userId,
            "My Set",
            null,
            "manual",
            null,
            "2025-01-20T10:00:00Z",
            "2025-01-20T10:00:00Z"
        );

        vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(studySet);
        vi.mocked(mockReviewableItemRepository.countItemsByStudySetId).mockResolvedValue(0);

        await expect(
            useCase.execute({
                userId,
                studySetPublicId,
                questionText: "Question?",
                options: [
                    { optionText: "A", isCorrect: true, explanation: null },
                    { optionText: "B", isCorrect: false, explanation: null },
                    { optionText: "C", isCorrect: false, explanation: null },
                ],
            })
        ).rejects.toThrow("Question must have exactly 4 options");

        expect(mockQuestionRepository.createMultipleChoiceQuestion).not.toHaveBeenCalled();
    });

    it("throws error when no option is marked as correct", async () => {
        const studySet = new StudySetEntity(
            1,
            studySetPublicId,
            userId,
            "My Set",
            null,
            "manual",
            null,
            "2025-01-20T10:00:00Z",
            "2025-01-20T10:00:00Z"
        );

        vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(studySet);
        vi.mocked(mockReviewableItemRepository.countItemsByStudySetId).mockResolvedValue(0);

        await expect(
            useCase.execute({
                userId,
                studySetPublicId,
                questionText: "Question?",
                options: [
                    { optionText: "A", isCorrect: false, explanation: null },
                    { optionText: "B", isCorrect: false, explanation: null },
                    { optionText: "C", isCorrect: false, explanation: null },
                    { optionText: "D", isCorrect: false, explanation: null },
                ],
            })
        ).rejects.toThrow("Question must have exactly one correct answer");

        expect(mockQuestionRepository.createMultipleChoiceQuestion).not.toHaveBeenCalled();
    });

    it("throws error when multiple options are marked as correct", async () => {
        const studySet = new StudySetEntity(
            1,
            studySetPublicId,
            userId,
            "My Set",
            null,
            "manual",
            null,
            "2025-01-20T10:00:00Z",
            "2025-01-20T10:00:00Z"
        );

        vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(studySet);
        vi.mocked(mockReviewableItemRepository.countItemsByStudySetId).mockResolvedValue(0);

        await expect(
            useCase.execute({
                userId,
                studySetPublicId,
                questionText: "Question?",
                options: [
                    { optionText: "A", isCorrect: true, explanation: null },
                    { optionText: "B", isCorrect: true, explanation: null },
                    { optionText: "C", isCorrect: false, explanation: null },
                    { optionText: "D", isCorrect: false, explanation: null },
                ],
            })
        ).rejects.toThrow("Question must have exactly one correct answer");

        expect(mockQuestionRepository.createMultipleChoiceQuestion).not.toHaveBeenCalled();
    });

    it("throws error when any option text is empty", async () => {
        const studySet = new StudySetEntity(
            1,
            studySetPublicId,
            userId,
            "My Set",
            null,
            "manual",
            null,
            "2025-01-20T10:00:00Z",
            "2025-01-20T10:00:00Z"
        );

        vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(studySet);
        vi.mocked(mockReviewableItemRepository.countItemsByStudySetId).mockResolvedValue(0);

        await expect(
            useCase.execute({
                userId,
                studySetPublicId,
                questionText: "Question?",
                options: [
                    { optionText: "A", isCorrect: true, explanation: null },
                    { optionText: "", isCorrect: false, explanation: null },
                    { optionText: "C", isCorrect: false, explanation: null },
                    { optionText: "D", isCorrect: false, explanation: null },
                ],
            })
        ).rejects.toThrow("All option texts must be non-empty");

        expect(mockQuestionRepository.createMultipleChoiceQuestion).not.toHaveBeenCalled();
    });

    it("throws error when question text exceeds 1000 characters", async () => {
        const studySet = new StudySetEntity(
            1,
            studySetPublicId,
            userId,
            "My Set",
            null,
            "manual",
            null,
            "2025-01-20T10:00:00Z",
            "2025-01-20T10:00:00Z"
        );

        vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(studySet);
        vi.mocked(mockReviewableItemRepository.countItemsByStudySetId).mockResolvedValue(0);

        const longQuestionText = "a".repeat(1001);

        await expect(
            useCase.execute({
                userId,
                studySetPublicId,
                questionText: longQuestionText,
                options: validOptions,
            })
        ).rejects.toThrow("Question text cannot exceed 1000 characters");

        expect(mockQuestionRepository.createMultipleChoiceQuestion).not.toHaveBeenCalled();
    });

    it("throws error when option text exceeds 500 characters", async () => {
        const studySet = new StudySetEntity(
            1,
            studySetPublicId,
            userId,
            "My Set",
            null,
            "manual",
            null,
            "2025-01-20T10:00:00Z",
            "2025-01-20T10:00:00Z"
        );

        vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(studySet);
        vi.mocked(mockReviewableItemRepository.countItemsByStudySetId).mockResolvedValue(0);

        const longOptionText = "a".repeat(501);

        await expect(
            useCase.execute({
                userId,
                studySetPublicId,
                questionText: "Question?",
                options: [
                    { optionText: longOptionText, isCorrect: true, explanation: null },
                    { optionText: "B", isCorrect: false, explanation: null },
                    { optionText: "C", isCorrect: false, explanation: null },
                    { optionText: "D", isCorrect: false, explanation: null },
                ],
            })
        ).rejects.toThrow("Option text cannot exceed 500 characters");

        expect(mockQuestionRepository.createMultipleChoiceQuestion).not.toHaveBeenCalled();
    });

    it("throws error when study set has reached item limit", async () => {
        const studySet = new StudySetEntity(
            1,
            studySetPublicId,
            userId,
            "My Set",
            null,
            "manual",
            null,
            "2025-01-20T10:00:00Z",
            "2025-01-20T10:00:00Z"
        );

        vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(studySet);
        vi.mocked(mockReviewableItemRepository.countItemsByStudySetId).mockResolvedValue(STUDY_SET_ITEM_LIMIT);

        await expect(
            useCase.execute({
                userId,
                studySetPublicId,
                questionText: "Question?",
                options: validOptions,
            })
        ).rejects.toThrow(`Study set has reached the maximum limit of ${STUDY_SET_ITEM_LIMIT} items`);

        expect(mockQuestionRepository.createMultipleChoiceQuestion).not.toHaveBeenCalled();
    });

    it("allows adding question when under item limit", async () => {
        const studySet = new StudySetEntity(
            1,
            studySetPublicId,
            userId,
            "My Set",
            null,
            "manual",
            null,
            "2025-01-20T10:00:00Z",
            "2025-01-20T10:00:00Z"
        );

        const createdQuestion = new MultipleChoiceQuestionEntity(
            100,
            null,
            "What is TDD?",
            [
                new MultipleChoiceOption(1, "Option A", true, "Correct because..."),
                new MultipleChoiceOption(2, "Option B", false, null),
                new MultipleChoiceOption(3, "Option C", false, null),
                new MultipleChoiceOption(4, "Option D", false, null),
            ]
        );

        const reviewableItem = new ReviewableItemEntity(
            200,
            userId,
            "question",
            100,
            null,
            null,
            1,
            "2025-01-20T10:00:00Z"
        );

        vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(studySet);
        vi.mocked(mockReviewableItemRepository.countItemsByStudySetId).mockResolvedValue(STUDY_SET_ITEM_LIMIT - 1);
        vi.mocked(mockQuestionRepository.createMultipleChoiceQuestion).mockResolvedValue(createdQuestion);
        vi.mocked(mockReviewableItemRepository.createReviewableItemsForQuestionsBatch).mockResolvedValue([reviewableItem]);

        const result = await useCase.execute({
            userId,
            studySetPublicId,
            questionText: "What is TDD?",
            options: validOptions,
        });

        expect(result).toEqual(createdQuestion);
        expect(mockQuestionRepository.createMultipleChoiceQuestion).toHaveBeenCalled();
    });
});
