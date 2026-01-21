import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";

export interface IFlashcardRepository {
    createFlashcards(
        flashcards: { videoId: number; userId: string; front: string; back: string }[]
    ): Promise<FlashcardEntity[]>;

    findFlashcardsByVideoId(videoId: number): Promise<FlashcardEntity[]>;

    findFlashcardsByUserId(userId: string): Promise<FlashcardEntity[]>;
}
