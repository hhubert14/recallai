import { VideoDto } from "./types";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { videos } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function getVideoByUrl(
    videoUrl: string,
    userId: string
): Promise<VideoDto | undefined> {
    if (!videoUrl || !userId) {
        return undefined;
    }

    try {
        const [data] = await db
            .select()
            .from(videos)
            .where(
                and(
                    eq(videos.userId, userId),
                    eq(videos.url, videoUrl),
                )
            )
            .limit(1)

        if (!data) {
            return undefined;
        }

        return data;
    } catch (error) {
        logger.db.error("Error checking video existence", error, {
            videoUrl,
            userId,
        });
        return undefined;
    }
}
