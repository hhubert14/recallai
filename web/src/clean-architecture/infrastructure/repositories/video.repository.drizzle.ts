import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { db } from "@/drizzle";
import { videos } from "@/drizzle/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

export class DrizzleVideoRepository implements IVideoRepository {
    async createVideo(
        userId: string,
        title: string,
        url: string,
        channelName: string,
    ): Promise<VideoEntity> {
        try {
            const [data] = await db
                .insert(videos)
                .values({
                    userId,
                    title,
                    url,
                    channelName,
                })
                .returning();

            return this.toEntity(data);
        } catch (error) {
            console.error("Error creating video:", error);
            throw error;
        }
    }

    async findVideoById(id: number): Promise<VideoEntity | null> {
        try {
            const [data] = await db
                .select()
                .from(videos)
                .where(eq(videos.id, id))
                .limit(1);

            if (!data) return null;
            return this.toEntity(data);
        } catch (error) {
            console.error("Error finding video by ID:", error);
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
                .where(eq(videos.userId, userId))
                .orderBy(desc(videos.createdAt));

            const data = limit ? await baseQuery.limit(limit) : await baseQuery;

            return data.map((video) => this.toEntity(video));
        } catch (error) {
            console.error("Error finding videos by user ID:", error);
            throw error;
        }
    }

    async findVideosByIds(ids: number[]): Promise<VideoEntity[]> {
        if (ids.length === 0) {
            return [];
        }

        try {
            const data = await db
                .select()
                .from(videos)
                .where(inArray(videos.id, ids));

            return data.map((video) => this.toEntity(video));
        } catch (error) {
            console.error("Error finding videos by IDs:", error);
            throw error;
        }
    }

    private toEntity(data: typeof videos.$inferSelect): VideoEntity {
        return new VideoEntity(
            data.id,
            data.userId,
            data.title,
            data.url,
            data.channelName,
            data.createdAt,
        );
    }
}
