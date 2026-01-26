import { IFolderRepository } from "@/clean-architecture/domain/repositories/folder.repository.interface";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { FolderEntity } from "@/clean-architecture/domain/entities/folder.entity";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";

export interface GetFolderWithStudySetsInput {
  folderId: number;
  userId: string;
}

export interface FolderWithStudySets {
  folder: FolderEntity;
  studySets: StudySetEntity[];
}

export class GetFolderWithStudySetsUseCase {
  constructor(
    private readonly folderRepository: IFolderRepository,
    private readonly studySetRepository: IStudySetRepository
  ) {}

  async execute(
    input: GetFolderWithStudySetsInput
  ): Promise<FolderWithStudySets | null> {
    const folder = await this.folderRepository.findFolderById(input.folderId);

    if (!folder) {
      return null;
    }

    // Authorization check: folder must belong to requesting user
    if (folder.userId !== input.userId) {
      return null;
    }

    const studySetIds = await this.folderRepository.findStudySetIdsByFolderId(
      input.folderId
    );

    if (studySetIds.length === 0) {
      return { folder, studySets: [] };
    }

    const studySets =
      await this.studySetRepository.findStudySetsByIds(studySetIds);

    return { folder, studySets };
  }
}
