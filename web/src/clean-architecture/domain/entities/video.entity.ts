export class VideoEntity {
    constructor(
        public readonly id: number,
        public readonly userId: string,
        public readonly platform: "YouTube" | "Vimeo",
        public readonly title: string,
        public readonly url: string,
        public readonly channelName: string,
        public readonly duration: number | null,
        public readonly createdAt: string,
    ) {}
}