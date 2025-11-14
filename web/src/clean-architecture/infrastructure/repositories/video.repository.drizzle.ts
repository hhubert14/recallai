import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { db } from "@/drizzle";
import { videos } from "@/drizzle/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

export class DrizzleVideoRepository implements IVideoRepository {
    async create(
        userId: string,
        platform: "YouTube" | "Vimeo",
        title: string,
        url: string,
        channelName: string,
        duration: number | null
    ): Promise<VideoEntity> {
        try {
            const [data] = await db
                .insert(videos)
                .values({
                    userId,
                    platform,
                    title,
                    url,
                    channelName,
                    duration,
                    shouldExpire: false,
                })
                .returning();

            return this.toEntity(data);
        } catch (error) {
            console.error("Error creating video:", error);
            throw error;
        }
    }

    async findVideoByUserIdAndUrl(userId: string, url: string): Promise<VideoEntity | null> {
        try {
            const [data] = await db
                .select()
                .from(videos)
                .where(and(eq(videos.userId, userId), eq(videos.url, url)))
                .limit(1);

            if (!data) return null;
            return this.toEntity(data);
        } catch (error) {
            console.error("Error finding video by user ID and URL:", error);
            throw error;
        }
    }

    async findVideosByUserId(userId: string, limit?: number): Promise<VideoEntity[]> {
        try {
            const baseQuery = db
                .select()
                .from(videos)
                .where(and(eq(videos.userId, userId), isNull(videos.deletedAt)))
                .orderBy(desc(videos.createdAt));

            const data = limit ? await baseQuery.limit(limit) : await baseQuery;

            return data.map((video) => this.toEntity(video));
        } catch (error) {
            console.error("Error finding videos by user ID:", error);
            throw error;
        }
    }

    private toEntity(data: typeof videos.$inferSelect): VideoEntity {
        return new VideoEntity(
            data.id,
            data.userId,
            data.platform,
            data.title,
            data.url,
            data.channelName,
            data.duration,
            data.createdAt,
        );
    }
}
