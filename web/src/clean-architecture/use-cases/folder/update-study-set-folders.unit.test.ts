import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateStudySetFoldersUseCase } from "./update-study-set-folders.use-case";
import { IFolderRepository } from "@/clean-architecture/domain/repositories/folder.repository.interface";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { FolderEntity } from "@/clean-architecture/domain/entities/folder.entity";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";

describe("UpdateStudySetFoldersUseCase", () => {
  let useCase: UpdateStudySetFoldersUseCase;
  let mockFolderRepository: IFolderRepository;
  let mockStudySetRepository: IStudySetRepository;

  const createMockFolder = (id: number, userId: string): FolderEntity => {
    return new FolderEntity(
      id,
      userId,
      `Folder ${id}`,
      null,
      "2025-01-25T10:00:00Z",
      "2025-01-25T10:00:00Z"
    );
  };

  const createMockStudySet = (
    id: number,
    userId: string
  ): StudySetEntity => {
    return new StudySetEntity(
      id,
      `public-id-${id}`,
      userId,
      `Study Set ${id}`,
      null,
      "video",
      1,
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
    mockStudySetRepository = {
      createStudySet: vi.fn(),
      findStudySetById: vi.fn(),
      findStudySetByPublicId: vi.fn(),
      findStudySetsByUserId: vi.fn(),
      findStudySetByVideoId: vi.fn(),
      findStudySetsByIds: vi.fn(),
      updateStudySet: vi.fn(),
    };
    useCase = new UpdateStudySetFoldersUseCase(
      mockFolderRepository,
      mockStudySetRepository
    );
  });

  it("adds study set to new folders", async () => {
    const studySet = createMockStudySet(101, "user-123");
    const userFolders = [
      createMockFolder(1, "user-123"),
      createMockFolder(2, "user-123"),
      createMockFolder(3, "user-123"),
    ];

    vi.mocked(mockStudySetRepository.findStudySetById).mockResolvedValue(
      studySet
    );
    vi.mocked(mockFolderRepository.findFolderIdsByStudySetId).mockResolvedValue(
      []
    ); // Currently in no folders
    vi.mocked(mockFolderRepository.findFoldersByUserId).mockResolvedValue(
      userFolders
    );

    await useCase.execute({
      studySetId: 101,
      userId: "user-123",
      folderIds: [1, 2], // Add to folders 1 and 2
    });

    expect(mockFolderRepository.addStudySetToFolder).toHaveBeenCalledTimes(2);
    expect(mockFolderRepository.addStudySetToFolder).toHaveBeenCalledWith(
      1,
      101
    );
    expect(mockFolderRepository.addStudySetToFolder).toHaveBeenCalledWith(
      2,
      101
    );
    expect(mockFolderRepository.removeStudySetFromFolder).not.toHaveBeenCalled();
  });

  it("removes study set from folders", async () => {
    const studySet = createMockStudySet(101, "user-123");
    const userFolders = [
      createMockFolder(1, "user-123"),
      createMockFolder(2, "user-123"),
    ];

    vi.mocked(mockStudySetRepository.findStudySetById).mockResolvedValue(
      studySet
    );
    vi.mocked(mockFolderRepository.findFolderIdsByStudySetId).mockResolvedValue(
      [1, 2]
    ); // Currently in folders 1 and 2
    vi.mocked(mockFolderRepository.findFoldersByUserId).mockResolvedValue(
      userFolders
    );

    await useCase.execute({
      studySetId: 101,
      userId: "user-123",
      folderIds: [], // Remove from all folders
    });

    expect(mockFolderRepository.removeStudySetFromFolder).toHaveBeenCalledTimes(
      2
    );
    expect(mockFolderRepository.removeStudySetFromFolder).toHaveBeenCalledWith(
      1,
      101
    );
    expect(mockFolderRepository.removeStudySetFromFolder).toHaveBeenCalledWith(
      2,
      101
    );
    expect(mockFolderRepository.addStudySetToFolder).not.toHaveBeenCalled();
  });

  it("handles mixed add and remove operations", async () => {
    const studySet = createMockStudySet(101, "user-123");
    const userFolders = [
      createMockFolder(1, "user-123"),
      createMockFolder(2, "user-123"),
      createMockFolder(3, "user-123"),
    ];

    vi.mocked(mockStudySetRepository.findStudySetById).mockResolvedValue(
      studySet
    );
    vi.mocked(mockFolderRepository.findFolderIdsByStudySetId).mockResolvedValue(
      [1, 2]
    ); // Currently in folders 1 and 2
    vi.mocked(mockFolderRepository.findFoldersByUserId).mockResolvedValue(
      userFolders
    );

    await useCase.execute({
      studySetId: 101,
      userId: "user-123",
      folderIds: [2, 3], // Keep folder 2, remove folder 1, add folder 3
    });

    expect(mockFolderRepository.addStudySetToFolder).toHaveBeenCalledTimes(1);
    expect(mockFolderRepository.addStudySetToFolder).toHaveBeenCalledWith(
      3,
      101
    );
    expect(mockFolderRepository.removeStudySetFromFolder).toHaveBeenCalledTimes(
      1
    );
    expect(mockFolderRepository.removeStudySetFromFolder).toHaveBeenCalledWith(
      1,
      101
    );
  });

  it("does nothing when folder membership is unchanged", async () => {
    const studySet = createMockStudySet(101, "user-123");
    const userFolders = [
      createMockFolder(1, "user-123"),
      createMockFolder(2, "user-123"),
    ];

    vi.mocked(mockStudySetRepository.findStudySetById).mockResolvedValue(
      studySet
    );
    vi.mocked(mockFolderRepository.findFolderIdsByStudySetId).mockResolvedValue(
      [1, 2]
    );
    vi.mocked(mockFolderRepository.findFoldersByUserId).mockResolvedValue(
      userFolders
    );

    await useCase.execute({
      studySetId: 101,
      userId: "user-123",
      folderIds: [1, 2], // Same as current
    });

    expect(mockFolderRepository.addStudySetToFolder).not.toHaveBeenCalled();
    expect(mockFolderRepository.removeStudySetFromFolder).not.toHaveBeenCalled();
  });

  it("throws error when study set does not exist", async () => {
    vi.mocked(mockStudySetRepository.findStudySetById).mockResolvedValue(null);

    await expect(
      useCase.execute({
        studySetId: 999,
        userId: "user-123",
        folderIds: [1],
      })
    ).rejects.toThrow("Study set not found");
  });

  it("throws error when study set belongs to different user", async () => {
    const studySet = createMockStudySet(101, "other-user");

    vi.mocked(mockStudySetRepository.findStudySetById).mockResolvedValue(
      studySet
    );

    await expect(
      useCase.execute({
        studySetId: 101,
        userId: "user-123",
        folderIds: [1],
      })
    ).rejects.toThrow("Study set not found");
  });

  it("throws error when folder does not belong to user", async () => {
    const studySet = createMockStudySet(101, "user-123");
    const userFolders = [createMockFolder(1, "user-123")]; // Only owns folder 1

    vi.mocked(mockStudySetRepository.findStudySetById).mockResolvedValue(
      studySet
    );
    vi.mocked(mockFolderRepository.findFolderIdsByStudySetId).mockResolvedValue(
      []
    );
    vi.mocked(mockFolderRepository.findFoldersByUserId).mockResolvedValue(
      userFolders
    );

    await expect(
      useCase.execute({
        studySetId: 101,
        userId: "user-123",
        folderIds: [1, 2], // Trying to add to folder 2 which user doesn't own
      })
    ).rejects.toThrow("Invalid folder");
  });

  it("only modifies folders belonging to the user", async () => {
    const studySet = createMockStudySet(101, "user-123");
    // User owns folders 1 and 2, but study set is also in folder 3 (owned by another user)
    const userFolders = [
      createMockFolder(1, "user-123"),
      createMockFolder(2, "user-123"),
    ];

    vi.mocked(mockStudySetRepository.findStudySetById).mockResolvedValue(
      studySet
    );
    vi.mocked(mockFolderRepository.findFolderIdsByStudySetId).mockResolvedValue(
      [1, 3]
    ); // In folder 1 (user's) and folder 3 (other user's)
    vi.mocked(mockFolderRepository.findFoldersByUserId).mockResolvedValue(
      userFolders
    );

    await useCase.execute({
      studySetId: 101,
      userId: "user-123",
      folderIds: [2], // Want to be in folder 2 only (from user's folders)
    });

    // Should remove from folder 1 (user's) and add to folder 2
    // Should NOT touch folder 3 (other user's)
    expect(mockFolderRepository.addStudySetToFolder).toHaveBeenCalledTimes(1);
    expect(mockFolderRepository.addStudySetToFolder).toHaveBeenCalledWith(
      2,
      101
    );
    expect(mockFolderRepository.removeStudySetFromFolder).toHaveBeenCalledTimes(
      1
    );
    expect(mockFolderRepository.removeStudySetFromFolder).toHaveBeenCalledWith(
      1,
      101
    );
  });
});
