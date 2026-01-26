import { IFolderRepository } from "@/clean-architecture/domain/repositories/folder.repository.interface";
import { FolderEntity } from "@/clean-architecture/domain/entities/folder.entity";

export class GetFoldersByUserIdUseCase {
  constructor(private readonly folderRepository: IFolderRepository) {}

  async execute(userId: string): Promise<FolderEntity[]> {
    return this.folderRepository.findFoldersByUserId(userId);
  }
}
