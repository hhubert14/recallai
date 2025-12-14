import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";
import { db } from "@/drizzle";
import { flashcards } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export class DrizzleFlashcardRepository implements IFlashcardRepository {
    async createFlashcards(
        flashcardsData: { videoId: number; userId: string; front: string; back: string }[]
    ): Promise<FlashcardEntity[]> {
        try {
            if (flashcardsData.length === 0) {
                return [];
            }

            const data = await db
                .insert(flashcards)
                .values(flashcardsData)
                .returning();

            return data.map((flashcard) => this.toEntity(flashcard));
        } catch (error) {
            console.error("Error creating flashcards:", error);
            throw error;
        }
    }

    async findFlashcardsByVideoId(videoId: number): Promise<FlashcardEntity[]> {
        try {
            const data = await db
                .select()
                .from(flashcards)
                .where(eq(flashcards.videoId, videoId));

            return data.map((flashcard) => this.toEntity(flashcard));
        } catch (error) {
            console.error("Error finding flashcards by video ID:", error);
            throw error;
        }
    }

    private toEntity(data: typeof flashcards.$inferSelect): FlashcardEntity {
        return new FlashcardEntity(
            data.id,
            data.videoId,
            data.userId,
            data.front,
            data.back,
            data.createdAt,
        );
    }
}
