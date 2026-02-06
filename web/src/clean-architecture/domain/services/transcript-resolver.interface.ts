import { TranscriptResult } from "./video-transcript.interface";

export interface ITranscriptResolverService {
  getTranscript(
    videoId: number,
    youtubeVideoId: string
  ): Promise<TranscriptResult>;
}
