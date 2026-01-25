import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateStudySetUseCase } from "./create-study-set.use-case";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";

describe("CreateStudySetUseCase", () => {
  let useCase: CreateStudySetUseCase;
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
    useCase = new CreateStudySetUseCase(mockStudySetRepository);
  });

  it("creates a video-sourced study set", async () => {
    const expectedEntity = new StudySetEntity(
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

    vi.mocked(mockStudySetRepository.createStudySet).mockResolvedValue(expectedEntity);

    const result = await useCase.execute({
      userId: "user-123",
      name: "My Study Set",
      description: "Description",
      sourceType: "video",
      videoId: 42,
    });

    expect(result).toEqual(expectedEntity);
    expect(mockStudySetRepository.createStudySet).toHaveBeenCalledWith({
      userId: "user-123",
      name: "My Study Set",
      description: "Description",
      sourceType: "video",
      videoId: 42,
    });
  });

  it("creates a manual study set without video", async () => {
    const expectedEntity = new StudySetEntity(
      2,
      "public-id-456",
      "user-456",
      "Manual Study Set",
      null,
      "manual",
      null,
      "2025-01-20T10:00:00Z",
      "2025-01-20T10:00:00Z"
    );

    vi.mocked(mockStudySetRepository.createStudySet).mockResolvedValue(expectedEntity);

    const result = await useCase.execute({
      userId: "user-456",
      name: "Manual Study Set",
      description: null,
      sourceType: "manual",
      videoId: null,
    });

    expect(result).toEqual(expectedEntity);
    expect(mockStudySetRepository.createStudySet).toHaveBeenCalledWith({
      userId: "user-456",
      name: "Manual Study Set",
      description: null,
      sourceType: "manual",
      videoId: null,
    });
  });
});
