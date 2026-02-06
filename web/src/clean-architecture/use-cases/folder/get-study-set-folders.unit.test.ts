import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetStudySetFoldersUseCase } from "./get-study-set-folders.use-case";
import { IFolderRepository } from "@/clean-architecture/domain/repositories/folder.repository.interface";
import { FolderEntity } from "@/clean-architecture/domain/entities/folder.entity";

describe("GetStudySetFoldersUseCase", () => {
  let useCase: GetStudySetFoldersUseCase;
  let mockFolderRepository: IFolderRepository;

  const createMockFolder = (
    id: number,
    userId: string,
    name: string
  ): FolderEntity => {
    return new FolderEntity(
      id,
      userId,
      name,
      null,
      "2025-01-25T10:00:00Z",
      "2025-01-25T10:00:00Z"
    );
  };

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
    useCase = new GetStudySetFoldersUseCase(mockFolderRepository);
  });

  it("returns folders that contain the study set", async () => {
    const userFolders = [
      createMockFolder(1, "user-123", "Folder 1"),
      createMockFolder(2, "user-123", "Folder 2"),
      createMockFolder(3, "user-123", "Folder 3"),
    ];
    const studySetFolderIds = [1, 3]; // Study set is in folders 1 and 3

    vi.mocked(mockFolderRepository.findFolderIdsByStudySetId).mockResolvedValue(
      studySetFolderIds
    );
    vi.mocked(mockFolderRepository.findFoldersByUserId).mockResolvedValue(
      userFolders
    );

    const result = await useCase.execute({
      studySetId: 101,
      userId: "user-123",
    });

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(userFolders[0]); // Folder 1
    expect(result).toContainEqual(userFolders[2]); // Folder 3
    expect(result).not.toContainEqual(userFolders[1]); // Folder 2 should not be included
    expect(mockFolderRepository.findFolderIdsByStudySetId).toHaveBeenCalledWith(
      101
    );
    expect(mockFolderRepository.findFoldersByUserId).toHaveBeenCalledWith(
      "user-123"
    );
  });

  it("returns empty array when study set is not in any folders", async () => {
    const userFolders = [
      createMockFolder(1, "user-123", "Folder 1"),
      createMockFolder(2, "user-123", "Folder 2"),
    ];

    vi.mocked(mockFolderRepository.findFolderIdsByStudySetId).mockResolvedValue(
      []
    );
    vi.mocked(mockFolderRepository.findFoldersByUserId).mockResolvedValue(
      userFolders
    );

    const result = await useCase.execute({
      studySetId: 101,
      userId: "user-123",
    });

    expect(result).toEqual([]);
  });

  it("returns empty array when user has no folders", async () => {
    vi.mocked(mockFolderRepository.findFolderIdsByStudySetId).mockResolvedValue(
      [1, 2]
    );
    vi.mocked(mockFolderRepository.findFoldersByUserId).mockResolvedValue([]);

    const result = await useCase.execute({
      studySetId: 101,
      userId: "user-123",
    });

    expect(result).toEqual([]);
  });

  it("only returns folders belonging to the user", async () => {
    // Study set is in folders 1 and 2, but user only owns folder 1
    const userFolders = [createMockFolder(1, "user-123", "User's Folder")];
    const studySetFolderIds = [1, 2]; // Folder 2 belongs to another user

    vi.mocked(mockFolderRepository.findFolderIdsByStudySetId).mockResolvedValue(
      studySetFolderIds
    );
    vi.mocked(mockFolderRepository.findFoldersByUserId).mockResolvedValue(
      userFolders
    );

    const result = await useCase.execute({
      studySetId: 101,
      userId: "user-123",
    });

    // Only returns the folder that belongs to the user
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });
});
