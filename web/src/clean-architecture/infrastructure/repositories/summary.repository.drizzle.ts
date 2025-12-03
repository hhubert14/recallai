import { ISummaryRepository } from "@/clean-architecture/domain/repositories/summary.repository.interface";
import { SummaryEntity } from "@/clean-architecture/domain/entities/summary.entity";
import { db } from "@/drizzle";
import { summaries } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { withRepositoryErrorHandling } from "./base-repository-error-handler";

export class DrizzleSummaryRepository implements ISummaryRepository {
    async createSummary(videoId: number, content: string): Promise<SummaryEntity> {
        return withRepositoryErrorHandling(
            async () => {
                const [data] = await db.insert(summaries).values({videoId, content}).returning();
                return this.toEntity(data);
            },
            "creating summary"
        );
    }
    async findSummaryByVideoId(videoId: number): Promise<SummaryEntity | null> {
        return withRepositoryErrorHandling(
            async () => {
                const [data] = await db.select().from(summaries).where(eq(summaries.videoId, videoId));
                if (!data) return null;
                return this.toEntity(data);
            },
            "finding summary by video id"
        );
    }
    private toEntity(data: typeof summaries.$inferSelect): SummaryEntity {
        return new SummaryEntity(data.id, data.videoId, data.content);
    }
}