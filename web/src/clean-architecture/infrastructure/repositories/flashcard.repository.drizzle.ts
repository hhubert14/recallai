import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";
import { db } from "@/drizzle";
import { flashcards } from "@/drizzle/schema";
import { eq, inArray, count } from "drizzle-orm";

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

    async findFlashcardsByUserId(userId: string): Promise<FlashcardEntity[]> {
        try {
            const data = await db
                .select()
                .from(flashcards)
                .where(eq(flashcards.userId, userId));

            return data.map((flashcard) => this.toEntity(flashcard));
        } catch (error) {
            console.error("Error finding flashcards by user ID:", error);
            throw error;
        }
    }

    async findFlashcardsByIds(flashcardIds: number[]): Promise<FlashcardEntity[]> {
        if (flashcardIds.length === 0) {
            return [];
        }

        try {
            const data = await db
                .select()
                .from(flashcards)
                .where(inArray(flashcards.id, flashcardIds));

            return data.map((flashcard) => this.toEntity(flashcard));
        } catch (error) {
            console.error("Error finding flashcards by IDs:", error);
            throw error;
        }
    }

    async countFlashcardsByVideoIds(videoIds: number[]): Promise<Record<number, number>> {
        if (videoIds.length === 0) {
            return {};
        }

        try {
            const rows = await db
                .select({
                    videoId: flashcards.videoId,
                    count: count(),
                })
                .from(flashcards)
                .where(inArray(flashcards.videoId, videoIds))
                .groupBy(flashcards.videoId);

            return Object.fromEntries(rows.map(r => [r.videoId, r.count]));
        } catch (error) {
            console.error("Error counting flashcards by video IDs:", error);
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
