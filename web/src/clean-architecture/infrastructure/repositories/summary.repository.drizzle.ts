import { ISummaryRepository } from "@/clean-architecture/domain/repositories/summary.repository.interface";
import { SummaryEntity } from "@/clean-architecture/domain/entities/summary.entity";
import { db } from "@/drizzle";
import { summaries } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export class DrizzleSummaryRepository implements ISummaryRepository {
    async createSummary(videoId: number, content: string): Promise<SummaryEntity> {
        try {
            const [data] = await db.insert(summaries).values({videoId, content}).returning();
            return this.toEntity(data);
        } catch (error) {
            console.error("Error creating summary:", error);
            throw error;
        }
    }
    async findSummaryByVideoId(videoId: number): Promise<SummaryEntity | null> {
        try {
            const [data] = await db.select().from(summaries).where(eq(summaries.videoId, videoId));
            if (!data) return null;
            return this.toEntity(data);
        } catch (error) {
            console.error("Error finding summary by video id:", error);
            throw error;
        }
    }
    private toEntity(data: typeof summaries.$inferSelect): SummaryEntity {
        return new SummaryEntity(data.id, data.videoId, data.content);
    }
}