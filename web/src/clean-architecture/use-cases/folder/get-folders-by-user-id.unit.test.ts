import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetFoldersByUserIdUseCase } from "./get-folders-by-user-id.use-case";
import { IFolderRepository } from "@/clean-architecture/domain/repositories/folder.repository.interface";
import { FolderEntity } from "@/clean-architecture/domain/entities/folder.entity";

describe("GetFoldersByUserIdUseCase", () => {
  let useCase: GetFoldersByUserIdUseCase;
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
    useCase = new GetFoldersByUserIdUseCase(mockFolderRepository);
  });

  it("returns folders for a user", async () => {
    const expectedFolders = [
      new FolderEntity(
        1,
        "user-123",
        "Folder 1",
        "Description 1",
        "2025-01-25T10:00:00Z",
        "2025-01-25T10:00:00Z"
      ),
      new FolderEntity(
        2,
        "user-123",
        "Folder 2",
        null,
        "2025-01-25T11:00:00Z",
        "2025-01-25T11:00:00Z"
      ),
    ];

    vi.mocked(mockFolderRepository.findFoldersByUserId).mockResolvedValue(
      expectedFolders
    );

    const result = await useCase.execute("user-123");

    expect(result).toEqual(expectedFolders);
    expect(mockFolderRepository.findFoldersByUserId).toHaveBeenCalledWith(
      "user-123"
    );
  });

  it("returns empty array when user has no folders", async () => {
    vi.mocked(mockFolderRepository.findFoldersByUserId).mockResolvedValue([]);

    const result = await useCase.execute("user-with-no-folders");

    expect(result).toEqual([]);
    expect(mockFolderRepository.findFoldersByUserId).toHaveBeenCalledWith(
      "user-with-no-folders"
    );
  });
});
