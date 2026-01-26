import { IFolderRepository } from "@/clean-architecture/domain/repositories/folder.repository.interface";

export interface DeleteFolderInput {
  folderId: number;
  userId: string;
}

export class DeleteFolderUseCase {
  constructor(private readonly folderRepository: IFolderRepository) {}

  async execute(input: DeleteFolderInput): Promise<void> {
    const folder = await this.folderRepository.findFolderById(input.folderId);

    // Return same error for both "not found" and "wrong user" to avoid leaking info
    if (!folder || folder.userId !== input.userId) {
      throw new Error("Folder not found");
    }

    await this.folderRepository.deleteFolder(input.folderId);
  }
}
