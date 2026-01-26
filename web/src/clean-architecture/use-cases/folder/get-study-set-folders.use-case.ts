import { IFolderRepository } from "@/clean-architecture/domain/repositories/folder.repository.interface";
import { FolderEntity } from "@/clean-architecture/domain/entities/folder.entity";

export interface GetStudySetFoldersInput {
  studySetId: number;
  userId: string;
}

export class GetStudySetFoldersUseCase {
  constructor(private readonly folderRepository: IFolderRepository) {}

  /**
   * Get all folders that contain a given study set.
   * Only returns folders belonging to the specified user.
   */
  async execute(input: GetStudySetFoldersInput): Promise<FolderEntity[]> {
    const { studySetId, userId } = input;

    // Get folder IDs that contain this study set
    const folderIds =
      await this.folderRepository.findFolderIdsByStudySetId(studySetId);

    if (folderIds.length === 0) {
      return [];
    }

    // Get all folders belonging to this user
    const userFolders =
      await this.folderRepository.findFoldersByUserId(userId);

    // Filter to only folders that contain this study set (and belong to user)
    const folderIdsSet = new Set(folderIds);
    return userFolders.filter((folder) => folderIdsSet.has(folder.id));
  }
}
