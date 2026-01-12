import {
    TranscriptEntity,
    TranscriptSegment,
} from "@/clean-architecture/domain/entities/transcript.entity";

export interface ITranscriptRepository {
    createTranscript(
        videoId: number,
        segments: TranscriptSegment[],
        fullText: string,
    ): Promise<TranscriptEntity>;

    findTranscriptByVideoId(videoId: number): Promise<TranscriptEntity | null>;
}
