export class SummaryEntity {
    constructor(
        public readonly id: number,
        public readonly videoId: number,
        public readonly content: string,
    ) {};
}