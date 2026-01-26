import { IFolderRepository } from "@/clean-architecture/domain/repositories/folder.repository.interface";
import { FolderEntity } from "@/clean-architecture/domain/entities/folder.entity";

export interface CreateFolderInput {
  userId: string;
  name: string;
  description?: string;
}

export class CreateFolderUseCase {
  constructor(private readonly folderRepository: IFolderRepository) {}

  async execute(input: CreateFolderInput): Promise<FolderEntity> {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      throw new Error("Folder name is required");
    }

    return this.folderRepository.createFolder(
      input.userId,
      trimmedName,
      input.description
    );
  }
}
