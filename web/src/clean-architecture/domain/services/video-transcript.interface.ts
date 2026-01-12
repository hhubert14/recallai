import { TranscriptSegment } from "../entities/transcript.entity";

export interface TranscriptResult {
    fullText: string;
    segments: TranscriptSegment[];
}

export interface IVideoTranscriptService {
    get(videoId: string): Promise<TranscriptResult | null>;
}
