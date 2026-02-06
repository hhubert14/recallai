import { TranscriptWindowEntity } from "../entities/transcript-window.entity";

export interface WindowMatchResult {
  window: TranscriptWindowEntity;
  similarity: number;
}

export interface ITranscriptWindowRepository {
  createWindowsBatch(
    windows: {
      videoId: number;
      windowIndex: number;
      startTime: number;
      endTime: number;
      text: string;
      embedding: number[];
    }[]
  ): Promise<TranscriptWindowEntity[]>;

  findWindowsByVideoId(videoId: number): Promise<TranscriptWindowEntity[]>;

  findMostSimilarWindow(
    videoId: number,
    queryEmbedding: number[]
  ): Promise<WindowMatchResult | null>;

  findTopKSimilarWindows(
    videoId: number,
    queryEmbedding: number[],
    k: number
  ): Promise<WindowMatchResult[]>;

  deleteWindowsByVideoId(videoId: number): Promise<void>;
}
