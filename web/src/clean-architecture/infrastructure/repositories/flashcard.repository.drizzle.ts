import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";
import { db as defaultDb } from "@/drizzle";
import { dbRetry } from "@/lib/db";
import { flashcards } from "@/drizzle/schema";
import { eq, inArray, count } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export class DrizzleFlashcardRepository implements IFlashcardRepository {
  constructor(private readonly db: PostgresJsDatabase = defaultDb) {}

  async createFlashcards(
    flashcardsData: {
      videoId: number | null;
      userId: string;
      front: string;
      back: string;
    }[]
  ): Promise<FlashcardEntity[]> {
    if (flashcardsData.length === 0) {
      return [];
    }

    const data = await dbRetry(() =>
      this.db.insert(flashcards).values(flashcardsData).returning()
    );

    return data.map((flashcard) => this.toEntity(flashcard));
  }

  async findFlashcardsByVideoId(videoId: number): Promise<FlashcardEntity[]> {
    const data = await dbRetry(() =>
      this.db.select().from(flashcards).where(eq(flashcards.videoId, videoId))
    );

    return data.map((flashcard) => this.toEntity(flashcard));
  }

  async findFlashcardsByIds(
    flashcardIds: number[]
  ): Promise<FlashcardEntity[]> {
    if (flashcardIds.length === 0) {
      return [];
    }

    const data = await dbRetry(() =>
      this.db
        .select()
        .from(flashcards)
        .where(inArray(flashcards.id, flashcardIds))
    );

    return data.map((flashcard) => this.toEntity(flashcard));
  }

  async countFlashcardsByVideoIds(
    videoIds: number[]
  ): Promise<Record<number, number>> {
    if (videoIds.length === 0) {
      return {};
    }

    const rows = await dbRetry(() =>
      this.db
        .select({
          videoId: flashcards.videoId,
          count: count(),
        })
        .from(flashcards)
        .where(inArray(flashcards.videoId, videoIds))
        .groupBy(flashcards.videoId)
    );

    return Object.fromEntries(rows.map((r) => [r.videoId, r.count]));
  }

  async findFlashcardById(
    flashcardId: number
  ): Promise<FlashcardEntity | null> {
    const [data] = await dbRetry(() =>
      this.db
        .select()
        .from(flashcards)
        .where(eq(flashcards.id, flashcardId))
        .limit(1)
    );

    if (!data) {
      return null;
    }

    return this.toEntity(data);
  }

  async updateFlashcard(
    flashcardId: number,
    front: string,
    back: string
  ): Promise<FlashcardEntity> {
    const [data] = await dbRetry(() =>
      this.db
        .update(flashcards)
        .set({ front, back, updatedAt: new Date().toISOString() })
        .where(eq(flashcards.id, flashcardId))
        .returning()
    );

    if (!data) {
      throw new Error("Flashcard not found");
    }

    return this.toEntity(data);
  }

  async deleteFlashcard(flashcardId: number): Promise<void> {
    await dbRetry(() =>
      this.db.delete(flashcards).where(eq(flashcards.id, flashcardId))
    );
  }

  private toEntity(data: typeof flashcards.$inferSelect): FlashcardEntity {
    return new FlashcardEntity(
      data.id,
      data.videoId,
      data.userId,
      data.front,
      data.back,
      data.createdAt
    );
  }
}
