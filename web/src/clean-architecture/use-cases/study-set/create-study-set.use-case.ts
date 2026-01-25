import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import {
  StudySetEntity,
  StudySetSourceType,
} from "@/clean-architecture/domain/entities/study-set.entity";

export interface CreateStudySetInput {
  userId: string;
  name: string;
  description: string | null;
  sourceType: StudySetSourceType;
  videoId: number | null;
}

export class CreateStudySetUseCase {
  constructor(private readonly studySetRepository: IStudySetRepository) {}

  async execute(input: CreateStudySetInput): Promise<StudySetEntity> {
    return this.studySetRepository.createStudySet({
      userId: input.userId,
      name: input.name,
      description: input.description,
      sourceType: input.sourceType,
      videoId: input.videoId,
    });
  }
}
