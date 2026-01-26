import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetFolderWithStudySetsUseCase } from "./get-folder-with-study-sets.use-case";
import { IFolderRepository } from "@/clean-architecture/domain/repositories/folder.repository.interface";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { FolderEntity } from "@/clean-architecture/domain/entities/folder.entity";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";

describe("GetFolderWithStudySetsUseCase", () => {
  let useCase: GetFolderWithStudySetsUseCase;
  let mockFolderRepository: IFolderRepository;
  let mockStudySetRepository: IStudySetRepository;

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
    mockStudySetRepository = {
      createStudySet: vi.fn(),
      findStudySetById: vi.fn(),
      findStudySetByPublicId: vi.fn(),
      findStudySetsByUserId: vi.fn(),
      findStudySetByVideoId: vi.fn(),
      findStudySetsByIds: vi.fn(),
      updateStudySet: vi.fn(),
    };
    useCase = new GetFolderWithStudySetsUseCase(
      mockFolderRepository,
      mockStudySetRepository
    );
  });

  it("returns folder with its study sets", async () => {
    const folder = new FolderEntity(
      1,
      "user-123",
      "My Folder",
      "Description",
      "2025-01-25T10:00:00Z",
      "2025-01-25T10:00:00Z"
    );
    const studySets = [
      new StudySetEntity(
        101,
        "public-id-1",
        "user-123",
        "Study Set 1",
        "Desc 1",
        "video",
        1,
        "2025-01-25T10:00:00Z",
        "2025-01-25T10:00:00Z"
      ),
      new StudySetEntity(
        102,
        "public-id-2",
        "user-123",
        "Study Set 2",
        null,
        "manual",
        null,
        "2025-01-25T11:00:00Z",
        "2025-01-25T11:00:00Z"
      ),
    ];

    vi.mocked(mockFolderRepository.findFolderById).mockResolvedValue(folder);
    vi.mocked(mockFolderRepository.findStudySetIdsByFolderId).mockResolvedValue([
      101, 102,
    ]);
    vi.mocked(mockStudySetRepository.findStudySetsByIds).mockResolvedValue(
      studySets
    );

    const result = await useCase.execute({ folderId: 1, userId: "user-123" });

    expect(result).toEqual({ folder, studySets });
    expect(mockFolderRepository.findFolderById).toHaveBeenCalledWith(1);
    expect(mockFolderRepository.findStudySetIdsByFolderId).toHaveBeenCalledWith(
      1
    );
    expect(mockStudySetRepository.findStudySetsByIds).toHaveBeenCalledWith([
      101, 102,
    ]);
  });

  it("returns folder with empty study sets array when folder is empty", async () => {
    const folder = new FolderEntity(
      2,
      "user-123",
      "Empty Folder",
      null,
      "2025-01-25T10:00:00Z",
      "2025-01-25T10:00:00Z"
    );

    vi.mocked(mockFolderRepository.findFolderById).mockResolvedValue(folder);
    vi.mocked(mockFolderRepository.findStudySetIdsByFolderId).mockResolvedValue(
      []
    );

    const result = await useCase.execute({ folderId: 2, userId: "user-123" });

    expect(result).toEqual({ folder, studySets: [] });
    expect(mockStudySetRepository.findStudySetsByIds).not.toHaveBeenCalled();
  });

  it("returns null when folder does not exist", async () => {
    vi.mocked(mockFolderRepository.findFolderById).mockResolvedValue(null);

    const result = await useCase.execute({
      folderId: 999,
      userId: "user-123",
    });

    expect(result).toBeNull();
  });

  it("returns null when folder belongs to different user", async () => {
    const folder = new FolderEntity(
      1,
      "other-user",
      "Someone Else's Folder",
      null,
      "2025-01-25T10:00:00Z",
      "2025-01-25T10:00:00Z"
    );

    vi.mocked(mockFolderRepository.findFolderById).mockResolvedValue(folder);

    const result = await useCase.execute({ folderId: 1, userId: "user-123" });

    expect(result).toBeNull();
  });
});
