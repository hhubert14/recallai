export interface IVideoTranscriptService {
    get(videoId: string): Promise<string | null>;
}
