import { FolderEntity } from "../entities/folder.entity";

export interface IFolderRepository {
  /**
   * Create a new folder.
   */
  createFolder(
    userId: string,
    name: string,
    description?: string | null
  ): Promise<FolderEntity>;

  /**
   * Find a folder by its ID.
   */
  findFolderById(id: number): Promise<FolderEntity | null>;

  /**
   * Find all folders for a user.
   */
  findFoldersByUserId(userId: string): Promise<FolderEntity[]>;

  /**
   * Update a folder's name and/or description.
   */
  updateFolder(
    id: number,
    updates: { name?: string; description?: string | null }
  ): Promise<FolderEntity | null>;

  /**
   * Delete a folder by its ID.
   * Note: This cascades to folder_study_sets but NOT to the study sets themselves.
   */
  deleteFolder(id: number): Promise<void>;

  /**
   * Add a study set to a folder.
   * @throws if the study set is already in the folder (unique constraint)
   */
  addStudySetToFolder(folderId: number, studySetId: number): Promise<void>;

  /**
   * Remove a study set from a folder.
   */
  removeStudySetFromFolder(folderId: number, studySetId: number): Promise<void>;

  /**
   * Find all study set IDs in a folder.
   */
  findStudySetIdsByFolderId(folderId: number): Promise<number[]>;

  /**
   * Find all folder IDs that contain a study set.
   */
  findFolderIdsByStudySetId(studySetId: number): Promise<number[]>;
}
