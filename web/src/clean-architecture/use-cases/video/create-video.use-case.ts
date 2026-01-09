import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";

export class CreateVideoUseCase {
    constructor(private readonly videoRepository: IVideoRepository) {}

    async execute(
        userId: string,
        title: string,
        url: string,
        channelName: string,
    ): Promise<VideoEntity> {
        return await this.videoRepository.createVideo(userId, title, url, channelName);
    }
}
