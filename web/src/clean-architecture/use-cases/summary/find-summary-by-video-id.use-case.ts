import { ISummaryRepository } from "@/clean-architecture/domain/repositories/summary.repository.interface";
import { SummaryEntity } from "@/clean-architecture/domain/entities/summary.entity";

export class FindSummaryByVideoIdUseCase {
  constructor(private readonly summaryRepository: ISummaryRepository) {}

  async execute(videoId: number): Promise<SummaryEntity | null> {
    return await this.summaryRepository.findSummaryByVideoId(videoId);
  }
}
