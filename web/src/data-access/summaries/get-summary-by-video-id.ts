import { SummaryDto } from "./types";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { summaries } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function getSummaryByVideoId(
    videoId: number
): Promise<SummaryDto | null> {
    if (!videoId) {
        return null;
    }

    try {
        const [data] = await db
            .select()
            .from(summaries)
            .where(eq(summaries.videoId, videoId))

        return data;
    } catch (error) {
        logger.db.error("Error fetching summary by video ID", error, {
            videoId,
        });

        return null;
    }
}
