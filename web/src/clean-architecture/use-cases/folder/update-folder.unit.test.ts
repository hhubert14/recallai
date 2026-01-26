import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateFolderUseCase } from "./update-folder.use-case";
import { IFolderRepository } from "@/clean-architecture/domain/repositories/folder.repository.interface";
import { FolderEntity } from "@/clean-architecture/domain/entities/folder.entity";

describe("UpdateFolderUseCase", () => {
  let useCase: UpdateFolderUseCase;
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
    useCase = new UpdateFolderUseCase(mockFolderRepository);
  });

  it("updates folder name", async () => {
    const existingFolder = new FolderEntity(
      1,
      "user-123",
      "Old Name",
      "Description",
      "2025-01-25T10:00:00Z",
      "2025-01-25T10:00:00Z"
    );
    const updatedFolder = new FolderEntity(
      1,
      "user-123",
      "New Name",
      "Description",
      "2025-01-25T10:00:00Z",
      "2025-01-25T11:00:00Z"
    );

    vi.mocked(mockFolderRepository.findFolderById).mockResolvedValue(
      existingFolder
    );
    vi.mocked(mockFolderRepository.updateFolder).mockResolvedValue(
      updatedFolder
    );

    const result = await useCase.execute({
      folderId: 1,
      userId: "user-123",
      updates: { name: "New Name" },
    });

    expect(result).toEqual(updatedFolder);
    expect(mockFolderRepository.updateFolder).toHaveBeenCalledWith(1, {
      name: "New Name",
    });
  });

  it("updates folder description", async () => {
    const existingFolder = new FolderEntity(
      1,
      "user-123",
      "Name",
      "Old Description",
      "2025-01-25T10:00:00Z",
      "2025-01-25T10:00:00Z"
    );
    const updatedFolder = new FolderEntity(
      1,
      "user-123",
      "Name",
      "New Description",
      "2025-01-25T10:00:00Z",
      "2025-01-25T11:00:00Z"
    );

    vi.mocked(mockFolderRepository.findFolderById).mockResolvedValue(
      existingFolder
    );
    vi.mocked(mockFolderRepository.updateFolder).mockResolvedValue(
      updatedFolder
    );

    const result = await useCase.execute({
      folderId: 1,
      userId: "user-123",
      updates: { description: "New Description" },
    });

    expect(result).toEqual(updatedFolder);
    expect(mockFolderRepository.updateFolder).toHaveBeenCalledWith(1, {
      description: "New Description",
    });
  });

  it("updates both name and description", async () => {
    const existingFolder = new FolderEntity(
      1,
      "user-123",
      "Old Name",
      "Old Description",
      "2025-01-25T10:00:00Z",
      "2025-01-25T10:00:00Z"
    );
    const updatedFolder = new FolderEntity(
      1,
      "user-123",
      "New Name",
      "New Description",
      "2025-01-25T10:00:00Z",
      "2025-01-25T11:00:00Z"
    );

    vi.mocked(mockFolderRepository.findFolderById).mockResolvedValue(
      existingFolder
    );
    vi.mocked(mockFolderRepository.updateFolder).mockResolvedValue(
      updatedFolder
    );

    const result = await useCase.execute({
      folderId: 1,
      userId: "user-123",
      updates: { name: "New Name", description: "New Description" },
    });

    expect(result).toEqual(updatedFolder);
    expect(mockFolderRepository.updateFolder).toHaveBeenCalledWith(1, {
      name: "New Name",
      description: "New Description",
    });
  });

  it("returns null when folder does not exist", async () => {
    vi.mocked(mockFolderRepository.findFolderById).mockResolvedValue(null);

    const result = await useCase.execute({
      folderId: 999,
      userId: "user-123",
      updates: { name: "New Name" },
    });

    expect(result).toBeNull();
    expect(mockFolderRepository.updateFolder).not.toHaveBeenCalled();
  });

  it("returns null when folder belongs to different user", async () => {
    const existingFolder = new FolderEntity(
      1,
      "other-user",
      "Name",
      null,
      "2025-01-25T10:00:00Z",
      "2025-01-25T10:00:00Z"
    );

    vi.mocked(mockFolderRepository.findFolderById).mockResolvedValue(
      existingFolder
    );

    const result = await useCase.execute({
      folderId: 1,
      userId: "user-123",
      updates: { name: "New Name" },
    });

    expect(result).toBeNull();
    expect(mockFolderRepository.updateFolder).not.toHaveBeenCalled();
  });

  it("throws error when name update is empty", async () => {
    const existingFolder = new FolderEntity(
      1,
      "user-123",
      "Name",
      null,
      "2025-01-25T10:00:00Z",
      "2025-01-25T10:00:00Z"
    );

    vi.mocked(mockFolderRepository.findFolderById).mockResolvedValue(
      existingFolder
    );

    await expect(
      useCase.execute({
        folderId: 1,
        userId: "user-123",
        updates: { name: "" },
      })
    ).rejects.toThrow("Folder name cannot be empty");
  });

  it("throws error when name update is only whitespace", async () => {
    const existingFolder = new FolderEntity(
      1,
      "user-123",
      "Name",
      null,
      "2025-01-25T10:00:00Z",
      "2025-01-25T10:00:00Z"
    );

    vi.mocked(mockFolderRepository.findFolderById).mockResolvedValue(
      existingFolder
    );

    await expect(
      useCase.execute({
        folderId: 1,
        userId: "user-123",
        updates: { name: "   " },
      })
    ).rejects.toThrow("Folder name cannot be empty");
  });
});
