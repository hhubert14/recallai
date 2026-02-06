import { TranscriptSegment } from "@/clean-architecture/domain/entities/transcript.entity";

export interface TranscriptWindow {
  windowIndex: number;
  startTime: number;
  endTime: number;
  text: string;
}

export class WindowBuilder {
  private readonly segmentsPerWindow: number;
  private readonly overlapSegments: number;

  constructor(segmentsPerWindow = 20, overlapSegments = 10) {
    if (segmentsPerWindow <= overlapSegments) {
      throw new Error("segmentsPerWindow must be greater than overlapSegments");
    }
    this.segmentsPerWindow = segmentsPerWindow;
    this.overlapSegments = overlapSegments;
  }

  buildWindows(segments: TranscriptSegment[]): TranscriptWindow[] {
    if (segments.length === 0) {
      return [];
    }

    const windows: TranscriptWindow[] = [];
    const stride = this.segmentsPerWindow - this.overlapSegments;
    let windowIndex = 0;

    for (let i = 0; i < segments.length; i += stride) {
      const windowSegments = segments.slice(
        i,
        Math.min(i + this.segmentsPerWindow, segments.length)
      );

      const startTime = windowSegments[0].startTime;
      const endTime = windowSegments[windowSegments.length - 1].endTime;
      const text = windowSegments.map((s) => s.text).join(" ");

      windows.push({
        windowIndex,
        startTime: Math.floor(startTime),
        endTime: Math.ceil(endTime),
        text,
      });

      windowIndex++;
    }

    return windows;
  }

  estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
