import { describe, it, expect, vi, beforeEach } from "vitest";
import { FindStudySetsByUserIdUseCase } from "./find-study-sets-by-user-id.use-case";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";

describe("FindStudySetsByUserIdUseCase", () => {
  let useCase: FindStudySetsByUserIdUseCase;
  let mockStudySetRepository: IStudySetRepository;

  beforeEach(() => {
    mockStudySetRepository = {
      createStudySet: vi.fn(),
      findStudySetById: vi.fn(),
      findStudySetByPublicId: vi.fn(),
      findStudySetsByUserId: vi.fn(),
      findStudySetByVideoId: vi.fn(),
      findStudySetsByIds: vi.fn(),
      updateStudySet: vi.fn(),
    };
    useCase = new FindStudySetsByUserIdUseCase(mockStudySetRepository);
  });

  it("returns all study sets for a user", async () => {
    const studySets = [
      new StudySetEntity(
        1,
        "public-id-123",
        "user-123",
        "Study Set 1",
        "Description 1",
        "video",
        42,
        "2025-01-20T10:00:00Z",
        "2025-01-20T10:00:00Z"
      ),
      new StudySetEntity(
        2,
        "public-id-456",
        "user-123",
        "Study Set 2",
        null,
        "manual",
        null,
        "2025-01-21T10:00:00Z",
        "2025-01-21T10:00:00Z"
      ),
    ];

    vi.mocked(mockStudySetRepository.findStudySetsByUserId).mockResolvedValue(
      studySets
    );

    const result = await useCase.execute("user-123");

    expect(result).toEqual(studySets);
    expect(result).toHaveLength(2);
    expect(mockStudySetRepository.findStudySetsByUserId).toHaveBeenCalledWith(
      "user-123"
    );
  });

  it("returns empty array when user has no study sets", async () => {
    vi.mocked(mockStudySetRepository.findStudySetsByUserId).mockResolvedValue(
      []
    );

    const result = await useCase.execute("user-with-no-sets");

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
    expect(mockStudySetRepository.findStudySetsByUserId).toHaveBeenCalledWith(
      "user-with-no-sets"
    );
  });

  it("delegates to repository with correct user ID", async () => {
    vi.mocked(mockStudySetRepository.findStudySetsByUserId).mockResolvedValue(
      []
    );

    await useCase.execute("specific-user-id");

    expect(mockStudySetRepository.findStudySetsByUserId).toHaveBeenCalledTimes(
      1
    );
    expect(mockStudySetRepository.findStudySetsByUserId).toHaveBeenCalledWith(
      "specific-user-id"
    );
  });
});
