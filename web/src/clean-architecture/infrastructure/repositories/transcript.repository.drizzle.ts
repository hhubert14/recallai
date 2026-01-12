import { ITranscriptRepository } from "@/clean-architecture/domain/repositories/transcript.repository.interface";
import { TranscriptEntity, TranscriptSegment } from "@/clean-architecture/domain/entities/transcript.entity";
import { db } from "@/drizzle";
import { videoTranscripts } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

export class DrizzleTranscriptRepository implements ITranscriptRepository {
    async createTranscript(
        videoId: number,
        segments: TranscriptSegment[],
        fullText: string,
    ): Promise<TranscriptEntity> {
        try {
            const [data] = await db
                .insert(videoTranscripts)
                .values({ videoId, segments, fullText })
                .returning();
            return this.toEntity(data);
        } catch (error) {
            logger.db.error("Error creating transcript", error);
            throw error;
        }
    }

    async findTranscriptByVideoId(videoId: number): Promise<TranscriptEntity | null> {
        try {
            const [data] = await db
                .select()
                .from(videoTranscripts)
                .where(eq(videoTranscripts.videoId, videoId));
            if (!data) return null;
            return this.toEntity(data);
        } catch (error) {
            logger.db.error("Error finding transcript by video id", error);
            throw error;
        }
    }

    private toEntity(data: typeof videoTranscripts.$inferSelect): TranscriptEntity {
        return new TranscriptEntity(
            data.id,
            data.videoId,
            data.segments as TranscriptSegment[],
            data.fullText,
            data.createdAt,
        );
    }
}
