import { TranscriptSegment } from "../entities/transcript.entity";

export type GeneratedSummaryDto = {
  summary: string;
};

export type TranscriptWithTimestamps = {
  fullText: string;
  segments: TranscriptSegment[];
};

export interface IVideoSummarizerService {
  generate(
    title: string,
    description: string,
    transcript: TranscriptWithTimestamps
  ): Promise<GeneratedSummaryDto | undefined>;
}
