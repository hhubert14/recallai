import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";

export class FindVideoByUserIdAndUrlUseCase {
  constructor(private readonly videoRepository: IVideoRepository) {}

  async execute(userId: string, url: string): Promise<VideoEntity | null> {
    return await this.videoRepository.findVideoByUserIdAndUrl(userId, url);
  }
}
