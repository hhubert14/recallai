export class FlashcardEntity {
    constructor(
        public readonly id: number,
        // NOTE: nullable to support manual study sets without video source
        public readonly videoId: number | null,
        public readonly userId: string,
        public readonly front: string,
        public readonly back: string,
        public readonly createdAt: string,
    ) {}
}
