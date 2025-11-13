import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";

export class FindVideosByUserIdUseCase {
    constructor(private readonly videoRepository: IVideoRepository) {}

    async execute(userId: string, limit?: number): Promise<VideoEntity[]> {
        return await this.videoRepository.findVideosByUserId(userId, limit);
    }
}
