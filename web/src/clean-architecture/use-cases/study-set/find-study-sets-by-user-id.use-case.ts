import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";

export class FindStudySetsByUserIdUseCase {
  constructor(private readonly studySetRepository: IStudySetRepository) {}

  async execute(userId: string): Promise<StudySetEntity[]> {
    return this.studySetRepository.findStudySetsByUserId(userId);
  }
}
