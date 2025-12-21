import { TranscriptWindowEntity } from "@/clean-architecture/domain/entities/transcript-window.entity";
import { TranscriptSegment } from "@/clean-architecture/domain/services/video-transcript.interface";

export interface ITranscriptWindowGeneratorService {
    generate(
        videoId: number,
        segments: TranscriptSegment[]
    ): Promise<TranscriptWindowEntity[]>;
}
