import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";

export class CreateVideoUseCase {
    constructor(private readonly videoRepository: IVideoRepository) {}

    async execute(
        userId: string,
        platform: "YouTube" | "Vimeo",
        title: string,
        url: string,
        channelName: string,
        duration: number | null,
    ): Promise<VideoEntity> {
        return await this.videoRepository.create(userId, platform, title, url, channelName, duration);
    }
}
