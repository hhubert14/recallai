export class TranscriptWindowEntity {
  constructor(
    public readonly id: number,
    public readonly videoId: number,
    public readonly windowIndex: number,
    public readonly startTime: number,
    public readonly endTime: number,
    public readonly text: string,
    public readonly embedding: number[],
    public readonly createdAt: string
  ) {}
}
