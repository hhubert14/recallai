import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateFolderUseCase } from "./create-folder.use-case";
import { IFolderRepository } from "@/clean-architecture/domain/repositories/folder.repository.interface";
import { FolderEntity } from "@/clean-architecture/domain/entities/folder.entity";

describe("CreateFolderUseCase", () => {
  let useCase: CreateFolderUseCase;
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
    useCase = new CreateFolderUseCase(mockFolderRepository);
  });

  it("creates a folder with name only", async () => {
    const expectedEntity = new FolderEntity(
      1,
      "user-123",
      "My Folder",
      null,
      "2025-01-25T10:00:00Z",
      "2025-01-25T10:00:00Z"
    );

    vi.mocked(mockFolderRepository.createFolder).mockResolvedValue(
      expectedEntity
    );

    const result = await useCase.execute({
      userId: "user-123",
      name: "My Folder",
    });

    expect(result).toEqual(expectedEntity);
    expect(mockFolderRepository.createFolder).toHaveBeenCalledWith(
      "user-123",
      "My Folder",
      undefined
    );
  });

  it("creates a folder with name and description", async () => {
    const expectedEntity = new FolderEntity(
      2,
      "user-456",
      "Study Materials",
      "Contains all my study materials",
      "2025-01-25T10:00:00Z",
      "2025-01-25T10:00:00Z"
    );

    vi.mocked(mockFolderRepository.createFolder).mockResolvedValue(
      expectedEntity
    );

    const result = await useCase.execute({
      userId: "user-456",
      name: "Study Materials",
      description: "Contains all my study materials",
    });

    expect(result).toEqual(expectedEntity);
    expect(mockFolderRepository.createFolder).toHaveBeenCalledWith(
      "user-456",
      "Study Materials",
      "Contains all my study materials"
    );
  });

  it("throws error when name is empty", async () => {
    await expect(
      useCase.execute({
        userId: "user-123",
        name: "",
      })
    ).rejects.toThrow("Folder name is required");
  });

  it("throws error when name is only whitespace", async () => {
    await expect(
      useCase.execute({
        userId: "user-123",
        name: "   ",
      })
    ).rejects.toThrow("Folder name is required");
  });
});
