import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";

export interface IVideoRepository {
    create(
        userId: string,
        platform: "YouTube" | "Vimeo",
        title: string,
        url: string,
        channelName: string,
        duration: number | null,
    ): Promise<VideoEntity>;

    findVideoByUserIdAndUrl(userId: string, url: string): Promise<VideoEntity | null>;

    findVideosByUserId(userId: string, limit?: number): Promise<VideoEntity[]>;
}
