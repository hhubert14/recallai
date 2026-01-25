export class VideoEntity {
    constructor(
        public readonly id: number,
        public readonly userId: string,
        public readonly title: string,
        public readonly url: string,
        public readonly channelName: string,
        public readonly createdAt: string,
    ) {}
}