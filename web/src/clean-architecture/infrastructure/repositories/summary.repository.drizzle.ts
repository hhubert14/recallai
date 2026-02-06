import { ISummaryRepository } from "@/clean-architecture/domain/repositories/summary.repository.interface";
import { SummaryEntity } from "@/clean-architecture/domain/entities/summary.entity";
import { db } from "@/drizzle";
import { dbRetry } from "@/lib/db";
import { summaries } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export class DrizzleSummaryRepository implements ISummaryRepository {
  async createSummary(
    videoId: number,
    content: string
  ): Promise<SummaryEntity> {
    const [data] = await dbRetry(() =>
      db.insert(summaries).values({ videoId, content }).returning()
    );
    return this.toEntity(data);
  }

  async findSummaryByVideoId(videoId: number): Promise<SummaryEntity | null> {
    const [data] = await dbRetry(() =>
      db.select().from(summaries).where(eq(summaries.videoId, videoId))
    );
    if (!data) return null;
    return this.toEntity(data);
  }

  private toEntity(data: typeof summaries.$inferSelect): SummaryEntity {
    return new SummaryEntity(data.id, data.videoId, data.content);
  }
}
