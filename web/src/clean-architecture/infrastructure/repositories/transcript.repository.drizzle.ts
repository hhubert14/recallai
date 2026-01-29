import { ITranscriptRepository } from "@/clean-architecture/domain/repositories/transcript.repository.interface";
import { TranscriptEntity, TranscriptSegment } from "@/clean-architecture/domain/entities/transcript.entity";
import { db } from "@/drizzle";
import { dbRetry } from "@/lib/db";
import { videoTranscripts } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export class DrizzleTranscriptRepository implements ITranscriptRepository {
    async createTranscript(
        videoId: number,
        segments: TranscriptSegment[],
        fullText: string,
    ): Promise<TranscriptEntity> {
        const [data] = await dbRetry(() =>
            db
                .insert(videoTranscripts)
                .values({ videoId, segments, fullText })
                .returning()
        );
        return this.toEntity(data);
    }

    async findTranscriptByVideoId(videoId: number): Promise<TranscriptEntity | null> {
        const [data] = await dbRetry(() =>
            db
                .select()
                .from(videoTranscripts)
                .where(eq(videoTranscripts.videoId, videoId))
        );
        if (!data) return null;
        return this.toEntity(data);
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
