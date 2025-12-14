export interface TranscriptSegment {
    text: string;
    startTime: number; // seconds
    endTime: number; // seconds
}

export interface TranscriptResult {
    fullText: string;
    segments: TranscriptSegment[];
}

export interface IVideoTranscriptService {
    get(videoId: string): Promise<TranscriptResult | null>;
}
