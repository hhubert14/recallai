import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";

export class FindVideoByIdUseCase {
  constructor(private readonly videoRepository: IVideoRepository) {}

  async execute(id: number, userId: string): Promise<VideoEntity | null> {
    const video = await this.videoRepository.findVideoById(id);

    // Authorization check: ensure video belongs to the user
    if (!video || video.userId !== userId) {
      return null;
    }

    return video;
  }
}
