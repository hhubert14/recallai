import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteFolderUseCase } from "./delete-folder.use-case";
import { IFolderRepository } from "@/clean-architecture/domain/repositories/folder.repository.interface";
import { FolderEntity } from "@/clean-architecture/domain/entities/folder.entity";

describe("DeleteFolderUseCase", () => {
  let useCase: DeleteFolderUseCase;
  let mockFolderRepository: IFolderRepository;

  beforeEach(() => {
    mockFolderRepository = {
      createFolder: vi.fn(),
      findFolderById: vi.fn(),
      findFoldersByUserId: vi.fn(),
      updateFolder: vi.fn(),
      deleteFolder: vi.fn(),
      addStudySetToFolder: vi.fn(),
      removeStudySetFromFolder: vi.fn(),
      findStudySetIdsByFolderId: vi.fn(),
      findFolderIdsByStudySetId: vi.fn(),
    };
    useCase = new DeleteFolderUseCase(mockFolderRepository);
  });

  it("deletes a folder belonging to the user", async () => {
    const folder = new FolderEntity(
      1,
      "user-123",
      "My Folder",
      null,
      "2025-01-25T10:00:00Z",
      "2025-01-25T10:00:00Z"
    );

    vi.mocked(mockFolderRepository.findFolderById).mockResolvedValue(folder);
    vi.mocked(mockFolderRepository.deleteFolder).mockResolvedValue(undefined);

    await useCase.execute({ folderId: 1, userId: "user-123" });

    expect(mockFolderRepository.deleteFolder).toHaveBeenCalledWith(1);
  });

  it("throws error when folder does not exist", async () => {
    vi.mocked(mockFolderRepository.findFolderById).mockResolvedValue(null);

    await expect(
      useCase.execute({ folderId: 999, userId: "user-123" })
    ).rejects.toThrow("Folder not found");

    expect(mockFolderRepository.deleteFolder).not.toHaveBeenCalled();
  });

  it("throws error when folder belongs to different user", async () => {
    const folder = new FolderEntity(
      1,
      "other-user",
      "Someone Else's Folder",
      null,
      "2025-01-25T10:00:00Z",
      "2025-01-25T10:00:00Z"
    );

    vi.mocked(mockFolderRepository.findFolderById).mockResolvedValue(folder);

    await expect(
      useCase.execute({ folderId: 1, userId: "user-123" })
    ).rejects.toThrow("Folder not found");

    expect(mockFolderRepository.deleteFolder).not.toHaveBeenCalled();
  });
});
