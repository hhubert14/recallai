import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { db } from "@/drizzle";
import { videos } from "@/drizzle/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { withRepositoryErrorHandling } from "./base-repository-error-handler";

export class DrizzleVideoRepository implements IVideoRepository {
    async createVideo(
        userId: string,
        platform: "YouTube" | "Vimeo",
        title: string,
        url: string,
        channelName: string,
        duration: number | null
    ): Promise<VideoEntity> {
        return withRepositoryErrorHandling(
            async () => {
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
            },
            "creating video"
        );
    }

    async findVideoById(id: number): Promise<VideoEntity | null> {
        return withRepositoryErrorHandling(
            async () => {
                const [data] = await db
                    .select()
                    .from(videos)
                    .where(eq(videos.id, id))
                    .limit(1);

                if (!data) return null;
                return this.toEntity(data);
            },
            "finding video by ID"
        );
    }

    async findVideoByUserIdAndUrl(userId: string, url: string): Promise<VideoEntity | null> {
        return withRepositoryErrorHandling(
            async () => {
                const [data] = await db
                    .select()
                    .from(videos)
                    .where(and(eq(videos.userId, userId), eq(videos.url, url)))
                    .limit(1);

                if (!data) return null;
                return this.toEntity(data);
            },
            "finding video by user ID and URL"
        );
    }

    async findVideosByUserId(userId: string, limit?: number): Promise<VideoEntity[]> {
        return withRepositoryErrorHandling(
            async () => {
                const baseQuery = db
                    .select()
                    .from(videos)
                    .where(and(eq(videos.userId, userId), isNull(videos.deletedAt)))
                    .orderBy(desc(videos.createdAt));

                const data = limit ? await baseQuery.limit(limit) : await baseQuery;

                return data.map((video) => this.toEntity(video));
            },
            "finding videos by user ID"
        );
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
