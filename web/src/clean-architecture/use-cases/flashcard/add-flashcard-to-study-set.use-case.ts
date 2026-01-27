import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";

export interface AddFlashcardInput {
    userId: string;
    studySetPublicId: string;
    front: string;
    back: string;
}

export class AddFlashcardToStudySetUseCase {
    constructor(
        private readonly studySetRepository: IStudySetRepository,
        private readonly flashcardRepository: IFlashcardRepository,
        private readonly reviewableItemRepository: IReviewableItemRepository
    ) {}

    async execute(input: AddFlashcardInput): Promise<FlashcardEntity> {
        const { userId, studySetPublicId, front, back } = input;

        // Find the study set
        const studySet = await this.studySetRepository.findStudySetByPublicId(studySetPublicId);
        if (!studySet) {
            throw new Error("Study set not found");
        }

        // Verify ownership
        if (studySet.userId !== userId) {
            throw new Error("Not authorized to add items to this study set");
        }

        // Validate inputs
        if (!front.trim()) {
            throw new Error("Front of flashcard cannot be empty");
        }
        if (!back.trim()) {
            throw new Error("Back of flashcard cannot be empty");
        }
        if (front.length > 500) {
            throw new Error("Front of flashcard cannot exceed 500 characters");
        }
        if (back.length > 2000) {
            throw new Error("Back of flashcard cannot exceed 2000 characters");
        }

        // Create the flashcard (use study set's videoId which may be null)
        const [flashcard] = await this.flashcardRepository.createFlashcards([
            {
                videoId: studySet.videoId,
                userId,
                front,
                back,
            },
        ]);

        // Create reviewable item for spaced repetition tracking
        await this.reviewableItemRepository.createReviewableItemsForFlashcardsBatch([
            {
                userId,
                flashcardId: flashcard.id,
                videoId: studySet.videoId,
                studySetId: studySet.id,
            },
        ]);

        return flashcard;
    }
}
