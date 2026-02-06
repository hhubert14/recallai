import { ISummaryRepository } from "@/clean-architecture/domain/repositories/summary.repository.interface";
import { SummaryEntity } from "@/clean-architecture/domain/entities/summary.entity";

export class CreateSummaryUseCase {
  constructor(private readonly summaryRepository: ISummaryRepository) {}

  async execute(videoId: number, content: string): Promise<SummaryEntity> {
    return await this.summaryRepository.createSummary(videoId, content);
  }
}
