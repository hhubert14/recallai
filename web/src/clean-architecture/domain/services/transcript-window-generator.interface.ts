import { TranscriptWindowEntity } from "@/clean-architecture/domain/entities/transcript-window.entity";
import { TranscriptSegment } from "@/clean-architecture/domain/entities/transcript.entity";

export interface ITranscriptWindowGeneratorService {
  generate(
    videoId: number,
    segments: TranscriptSegment[]
  ): Promise<TranscriptWindowEntity[]>;
}
