export interface TranscriptSegment {
    text: string;
    startTime: number; // seconds
    endTime: number; // seconds
}

export class TranscriptEntity {
    constructor(
        public readonly id: number,
        public readonly videoId: number,
        public readonly segments: TranscriptSegment[],
        public readonly fullText: string,
        public readonly createdAt: string,
    ) {}
}
