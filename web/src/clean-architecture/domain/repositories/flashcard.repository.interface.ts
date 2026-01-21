import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";

export interface IFlashcardRepository {
    createFlashcards(
        flashcards: { videoId: number; userId: string; front: string; back: string }[]
    ): Promise<FlashcardEntity[]>;

    findFlashcardsByVideoId(videoId: number): Promise<FlashcardEntity[]>;

    findFlashcardsByUserId(userId: string): Promise<FlashcardEntity[]>;

    /**
     * Count flashcards grouped by video ID.
     * Returns a map of videoId -> count.
     */
    countFlashcardsByVideoIds(videoIds: number[]): Promise<Record<number, number>>;
}
