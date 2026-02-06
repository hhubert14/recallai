import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { db } from "@/drizzle";
import { dbRetry } from "@/lib/db";
import { videos } from "@/drizzle/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

export class DrizzleVideoRepository implements IVideoRepository {
  async createVideo(
    userId: string,
    title: string,
    url: string,
    channelName: string
  ): Promise<VideoEntity> {
    const [data] = await dbRetry(() =>
      db
        .insert(videos)
        .values({
          userId,
          title,
          url,
          channelName,
        })
        .returning()
    );

    return this.toEntity(data);
  }

  async findVideoById(id: number): Promise<VideoEntity | null> {
    const [data] = await dbRetry(() =>
      db.select().from(videos).where(eq(videos.id, id)).limit(1)
    );

    if (!data) return null;
    return this.toEntity(data);
  }

  async findVideoByUserIdAndUrl(
    userId: string,
    url: string
  ): Promise<VideoEntity | null> {
    const [data] = await dbRetry(() =>
      db
        .select()
        .from(videos)
        .where(and(eq(videos.userId, userId), eq(videos.url, url)))
        .limit(1)
    );

    if (!data) return null;
    return this.toEntity(data);
  }

  async findVideosByUserId(
    userId: string,
    limit?: number
  ): Promise<VideoEntity[]> {
    const data = await dbRetry(async () => {
      const baseQuery = db
        .select()
        .from(videos)
        .where(eq(videos.userId, userId))
        .orderBy(desc(videos.createdAt));

      return limit ? baseQuery.limit(limit) : baseQuery;
    });

    return data.map((video) => this.toEntity(video));
  }

  async findVideosByIds(ids: number[]): Promise<VideoEntity[]> {
    if (ids.length === 0) {
      return [];
    }

    const data = await dbRetry(() =>
      db.select().from(videos).where(inArray(videos.id, ids))
    );

    return data.map((video) => this.toEntity(video));
  }

  private toEntity(data: typeof videos.$inferSelect): VideoEntity {
    return new VideoEntity(
      data.id,
      data.userId,
      data.title,
      data.url,
      data.channelName,
      data.createdAt
    );
  }
}
