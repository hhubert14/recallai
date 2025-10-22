import { CreateSummaryDto } from "./types";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { summaries } from "@/drizzle/schema";

export async function createSummary(summaryData: CreateSummaryDto) {
    try {
        const [data] = await db
            .insert(summaries)
            .values(summaryData)
            .returning()
        if (!data) {
            throw new Error("No data returned from summary creation");
        }
        return data
    } catch (error) {
        logger.db.error("Error creating summary", error, {
            video_id: summaryData.videoId,
        });
        throw error;
    }
}
