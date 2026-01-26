import { IFolderRepository } from "@/clean-architecture/domain/repositories/folder.repository.interface";
import { FolderEntity } from "@/clean-architecture/domain/entities/folder.entity";

export interface UpdateFolderInput {
  folderId: number;
  userId: string;
  updates: {
    name?: string;
    description?: string | null;
  };
}

export class UpdateFolderUseCase {
  constructor(private readonly folderRepository: IFolderRepository) {}

  async execute(input: UpdateFolderInput): Promise<FolderEntity | null> {
    const folder = await this.folderRepository.findFolderById(input.folderId);

    if (!folder) {
      return null;
    }

    // Authorization check: folder must belong to requesting user
    if (folder.userId !== input.userId) {
      return null;
    }

    // Validate name if provided
    if (input.updates.name !== undefined) {
      const trimmedName = input.updates.name.trim();
      if (!trimmedName) {
        throw new Error("Folder name cannot be empty");
      }
      input.updates.name = trimmedName;
    }

    return this.folderRepository.updateFolder(input.folderId, input.updates);
  }
}
