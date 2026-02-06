import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddFlashcardToStudySetUseCase } from "./add-flashcard-to-study-set.use-case";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";
import { ReviewableItemEntity } from "@/clean-architecture/domain/entities/reviewable-item.entity";
import { STUDY_SET_ITEM_LIMIT } from "@/app/dashboard/study-set/[publicId]/_components/types";

describe("AddFlashcardToStudySetUseCase", () => {
    let useCase: AddFlashcardToStudySetUseCase;
    let mockStudySetRepository: IStudySetRepository;
    let mockFlashcardRepository: IFlashcardRepository;
    let mockReviewableItemRepository: IReviewableItemRepository;

    const userId = "user-123";
    const studySetPublicId = "abc-def-123";

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

        mockFlashcardRepository = {
            createFlashcards: vi.fn(),
            findFlashcardsByVideoId: vi.fn(),
            findFlashcardsByIds: vi.fn(),
            countFlashcardsByVideoIds: vi.fn(),
            findFlashcardById: vi.fn(),
            updateFlashcard: vi.fn(),
            deleteFlashcard: vi.fn(),
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

        useCase = new AddFlashcardToStudySetUseCase(
            mockStudySetRepository,
            mockFlashcardRepository,
            mockReviewableItemRepository
        );
    });

    it("adds a flashcard to a manual study set (no videoId)", async () => {
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

        const createdFlashcard = new FlashcardEntity(
            100,
            null, // no videoId for manual
            userId,
            "What is TDD?",
            "Test-Driven Development",
            "2025-01-20T10:00:00Z"
        );

        const reviewableItem = new ReviewableItemEntity(
            200,
            userId,
            "flashcard",
            null,
            100,
            null,
            1,
            "2025-01-20T10:00:00Z"
        );

        vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(manualStudySet);
        vi.mocked(mockReviewableItemRepository.countItemsByStudySetId).mockResolvedValue(0);
        vi.mocked(mockFlashcardRepository.createFlashcards).mockResolvedValue([createdFlashcard]);
        vi.mocked(mockReviewableItemRepository.createReviewableItemsForFlashcardsBatch).mockResolvedValue([reviewableItem]);

        const result = await useCase.execute({
            userId,
            studySetPublicId,
            front: "What is TDD?",
            back: "Test-Driven Development",
        });

        expect(result).toEqual(createdFlashcard);
        expect(mockFlashcardRepository.createFlashcards).toHaveBeenCalledWith([
            {
                videoId: null,
                userId,
                front: "What is TDD?",
                back: "Test-Driven Development",
            },
        ]);
        expect(mockReviewableItemRepository.createReviewableItemsForFlashcardsBatch).toHaveBeenCalledWith([
            {
                userId,
                flashcardId: 100,
                videoId: null,
                studySetId: 1,
            },
        ]);
    });

    it("adds a flashcard to a video-sourced study set (with videoId)", async () => {
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

        const createdFlashcard = new FlashcardEntity(
            101,
            42, // videoId from study set
            userId,
            "What is React?",
            "A JavaScript library for building user interfaces",
            "2025-01-20T10:00:00Z"
        );

        const reviewableItem = new ReviewableItemEntity(
            201,
            userId,
            "flashcard",
            null,
            101,
            42,
            2,
            "2025-01-20T10:00:00Z"
        );

        vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(videoStudySet);
        vi.mocked(mockReviewableItemRepository.countItemsByStudySetId).mockResolvedValue(0);
        vi.mocked(mockFlashcardRepository.createFlashcards).mockResolvedValue([createdFlashcard]);
        vi.mocked(mockReviewableItemRepository.createReviewableItemsForFlashcardsBatch).mockResolvedValue([reviewableItem]);

        const result = await useCase.execute({
            userId,
            studySetPublicId,
            front: "What is React?",
            back: "A JavaScript library for building user interfaces",
        });

        expect(result).toEqual(createdFlashcard);
        expect(mockFlashcardRepository.createFlashcards).toHaveBeenCalledWith([
            {
                videoId: 42,
                userId,
                front: "What is React?",
                back: "A JavaScript library for building user interfaces",
            },
        ]);
        expect(mockReviewableItemRepository.createReviewableItemsForFlashcardsBatch).toHaveBeenCalledWith([
            {
                userId,
                flashcardId: 101,
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
                front: "Question",
                back: "Answer",
            })
        ).rejects.toThrow("Study set not found");

        expect(mockFlashcardRepository.createFlashcards).not.toHaveBeenCalled();
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
                front: "Question",
                back: "Answer",
            })
        ).rejects.toThrow("Not authorized to add items to this study set");

        expect(mockFlashcardRepository.createFlashcards).not.toHaveBeenCalled();
    });

    it("throws error when front is empty", async () => {
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
                front: "   ",
                back: "Answer",
            })
        ).rejects.toThrow("Front of flashcard cannot be empty");

        expect(mockFlashcardRepository.createFlashcards).not.toHaveBeenCalled();
    });

    it("throws error when back is empty", async () => {
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
                front: "Question",
                back: "",
            })
        ).rejects.toThrow("Back of flashcard cannot be empty");

        expect(mockFlashcardRepository.createFlashcards).not.toHaveBeenCalled();
    });

    it("throws error when front exceeds 500 characters", async () => {
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

        const longFront = "a".repeat(501);

        await expect(
            useCase.execute({
                userId,
                studySetPublicId,
                front: longFront,
                back: "Answer",
            })
        ).rejects.toThrow("Front of flashcard cannot exceed 500 characters");

        expect(mockFlashcardRepository.createFlashcards).not.toHaveBeenCalled();
    });

    it("throws error when back exceeds 2000 characters", async () => {
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

        const longBack = "a".repeat(2001);

        await expect(
            useCase.execute({
                userId,
                studySetPublicId,
                front: "Question",
                back: longBack,
            })
        ).rejects.toThrow("Back of flashcard cannot exceed 2000 characters");

        expect(mockFlashcardRepository.createFlashcards).not.toHaveBeenCalled();
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
                front: "Question",
                back: "Answer",
            })
        ).rejects.toThrow(`Study set has reached the maximum limit of ${STUDY_SET_ITEM_LIMIT} items`);

        expect(mockFlashcardRepository.createFlashcards).not.toHaveBeenCalled();
    });

    it("allows adding flashcard when under item limit", async () => {
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

        const createdFlashcard = new FlashcardEntity(
            100,
            null,
            userId,
            "What is TDD?",
            "Test-Driven Development",
            "2025-01-20T10:00:00Z"
        );

        const reviewableItem = new ReviewableItemEntity(
            200,
            userId,
            "flashcard",
            null,
            100,
            null,
            1,
            "2025-01-20T10:00:00Z"
        );

        vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(studySet);
        vi.mocked(mockReviewableItemRepository.countItemsByStudySetId).mockResolvedValue(STUDY_SET_ITEM_LIMIT - 1);
        vi.mocked(mockFlashcardRepository.createFlashcards).mockResolvedValue([createdFlashcard]);
        vi.mocked(mockReviewableItemRepository.createReviewableItemsForFlashcardsBatch).mockResolvedValue([reviewableItem]);

        const result = await useCase.execute({
            userId,
            studySetPublicId,
            front: "What is TDD?",
            back: "Test-Driven Development",
        });

        expect(result).toEqual(createdFlashcard);
        expect(mockFlashcardRepository.createFlashcards).toHaveBeenCalled();
    });
});
