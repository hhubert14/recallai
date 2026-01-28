import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";

export interface IFlashcardRepository {
    createFlashcards(
        flashcards: { videoId: number | null; userId: string; front: string; back: string }[]
    ): Promise<FlashcardEntity[]>;

    findFlashcardsByVideoId(videoId: number): Promise<FlashcardEntity[]>;

    /**
     * Find flashcards by their IDs.
     * Used to fetch full flashcard data after getting reviewable items.
     */
    findFlashcardsByIds(flashcardIds: number[]): Promise<FlashcardEntity[]>;

    /**
     * Count flashcards grouped by video ID.
     * Returns a map of videoId -> count.
     */
    countFlashcardsByVideoIds(videoIds: number[]): Promise<Record<number, number>>;

    /**
     * Find a flashcard by its ID.
     * Used to validate ownership before editing.
     */
    findFlashcardById(flashcardId: number): Promise<FlashcardEntity | null>;

    /**
     * Update a flashcard's front and back text.
     * Returns the updated flashcard.
     */
    updateFlashcard(flashcardId: number, front: string, back: string): Promise<FlashcardEntity>;

    /**
     * Delete a flashcard by its ID.
     * Database cascades handle cleanup of related reviewable_items and review_progress.
     */
    deleteFlashcard(flashcardId: number): Promise<void>;
}
