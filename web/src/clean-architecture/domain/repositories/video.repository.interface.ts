import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";

export interface IVideoRepository {
    createVideo(
        userId: string,
        platform: "YouTube" | "Vimeo",
        title: string,
        url: string,
        channelName: string,
        duration: number | null,
    ): Promise<VideoEntity>;

    findVideoById(id: number): Promise<VideoEntity | null>;

    findVideoByUserIdAndUrl(userId: string, url: string): Promise<VideoEntity | null>;

    findVideosByUserId(userId: string, limit?: number): Promise<VideoEntity[]>;
}
