import { describe, it, expect, vi, beforeEach } from "vitest";
import { FindStudySetByPublicIdUseCase } from "./find-study-set-by-public-id.use-case";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";

describe("FindStudySetByPublicIdUseCase", () => {
  let useCase: FindStudySetByPublicIdUseCase;
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
    useCase = new FindStudySetByPublicIdUseCase(mockStudySetRepository);
  });

  it("returns study set when found and user matches", async () => {
    const studySet = new StudySetEntity(
      1,
      "public-id-123",
      "user-123",
      "My Study Set",
      "Description",
      "video",
      42,
      "2025-01-20T10:00:00Z",
      "2025-01-20T10:00:00Z"
    );

    vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(studySet);

    const result = await useCase.execute("public-id-123", "user-123");

    expect(result).toEqual(studySet);
    expect(mockStudySetRepository.findStudySetByPublicId).toHaveBeenCalledWith("public-id-123");
  });

  it("returns null when study set not found", async () => {
    vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(null);

    const result = await useCase.execute("non-existent", "user-123");

    expect(result).toBeNull();
  });

  it("returns null when user does not own the study set", async () => {
    const studySet = new StudySetEntity(
      1,
      "public-id-123",
      "other-user",
      "My Study Set",
      "Description",
      "video",
      42,
      "2025-01-20T10:00:00Z",
      "2025-01-20T10:00:00Z"
    );

    vi.mocked(mockStudySetRepository.findStudySetByPublicId).mockResolvedValue(studySet);

    const result = await useCase.execute("public-id-123", "user-123");

    expect(result).toBeNull();
  });
});
