import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";

export class FindStudySetByPublicIdUseCase {
  constructor(private readonly studySetRepository: IStudySetRepository) {}

  async execute(
    publicId: string,
    userId: string
  ): Promise<StudySetEntity | null> {
    const studySet =
      await this.studySetRepository.findStudySetByPublicId(publicId);

    // Authorization check: ensure study set belongs to the user
    if (!studySet || studySet.userId !== userId) {
      return null;
    }

    return studySet;
  }
}
