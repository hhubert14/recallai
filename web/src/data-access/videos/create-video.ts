import { CreateVideoDto } from "./types";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { videos } from "@/drizzle/schema";

export async function createVideo(videoData: CreateVideoDto) {
    try {
        const [data] = await db
            .insert(videos)
            .values({
                ...videoData,
                shouldExpire: false,
            })
            .returning();

        return data;
    } catch (error) {
        logger.db.error("Error creating video", error, {
            userId: videoData.userId,
            url: videoData.url,
        });
        throw error;
    }
}
