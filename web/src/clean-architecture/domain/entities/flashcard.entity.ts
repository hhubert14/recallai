export class FlashcardEntity {
    constructor(
        public readonly id: number,
        public readonly videoId: number,
        public readonly userId: string,
        public readonly front: string,
        public readonly back: string,
        public readonly createdAt: string,
    ) {}
}
