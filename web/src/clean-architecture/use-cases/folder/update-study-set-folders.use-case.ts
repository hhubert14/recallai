import { IFolderRepository } from "@/clean-architecture/domain/repositories/folder.repository.interface";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";

export interface UpdateStudySetFoldersInput {
  studySetId: number;
  userId: string;
  folderIds: number[];
}

export class UpdateStudySetFoldersUseCase {
  constructor(
    private readonly folderRepository: IFolderRepository,
    private readonly studySetRepository: IStudySetRepository
  ) {}

  /**
   * Update the folder memberships for a study set.
   * Replaces the entire folder membership list with the provided folder IDs.
   * Only affects folders belonging to the user.
   */
  async execute(input: UpdateStudySetFoldersInput): Promise<void> {
    const { studySetId, userId, folderIds } = input;

    // Verify study set exists and belongs to user
    const studySet = await this.studySetRepository.findStudySetById(studySetId);
    if (!studySet || studySet.userId !== userId) {
      throw new Error("Study set not found");
    }

    // Get all folders belonging to this user
    const userFolders = await this.folderRepository.findFoldersByUserId(userId);
    const userFolderIds = new Set(userFolders.map((f) => f.id));

    // Verify all requested folder IDs belong to the user
    for (const folderId of folderIds) {
      if (!userFolderIds.has(folderId)) {
        throw new Error("Invalid folder");
      }
    }

    // Get current folder IDs for this study set
    const currentFolderIds =
      await this.folderRepository.findFolderIdsByStudySetId(studySetId);

    // Filter to only folders belonging to the user (for diff calculation)
    const currentUserFolderIds = currentFolderIds.filter((id) =>
      userFolderIds.has(id)
    );

    const currentSet = new Set(currentUserFolderIds);
    const targetSet = new Set(folderIds);

    // Calculate folders to add (in target but not in current)
    const foldersToAdd = folderIds.filter((id) => !currentSet.has(id));

    // Calculate folders to remove (in current but not in target)
    const foldersToRemove = currentUserFolderIds.filter(
      (id) => !targetSet.has(id)
    );

    // Execute adds
    for (const folderId of foldersToAdd) {
      await this.folderRepository.addStudySetToFolder(folderId, studySetId);
    }

    // Execute removes
    for (const folderId of foldersToRemove) {
      await this.folderRepository.removeStudySetFromFolder(folderId, studySetId);
    }
  }
}
