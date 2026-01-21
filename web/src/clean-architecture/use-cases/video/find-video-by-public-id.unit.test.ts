import { describe, it, expect, vi, beforeEach } from "vitest";
import { FindVideoByPublicIdUseCase } from "./find-video-by-public-id.use-case";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";

// Helper to create mock VideoEntity
function createMockVideo(overrides: Partial<VideoEntity> = {}): VideoEntity {
    return new VideoEntity(
        overrides.id ?? 1,
        overrides.publicId ?? "550e8400-e29b-41d4-a716-446655440000",
        overrides.userId ?? "user-1",
        overrides.title ?? "Test Video Title",
        overrides.url ?? "https://www.youtube.com/watch?v=test123",
        overrides.channelName ?? "Test Channel",
        overrides.createdAt ?? new Date().toISOString(),
    );
}

describe("FindVideoByPublicIdUseCase", () => {
    let useCase: FindVideoByPublicIdUseCase;
    let mockVideoRepo: IVideoRepository;

    const testPublicId = "550e8400-e29b-41d4-a716-446655440000";
    const testUserId = "user-1";

    beforeEach(() => {
        mockVideoRepo = {
            createVideo: vi.fn(),
            findVideoById: vi.fn(),
            findVideoByPublicId: vi.fn(),
            findVideoByUserIdAndUrl: vi.fn(),
            findVideosByUserId: vi.fn(),
            findVideosByIds: vi.fn(),
        };

        useCase = new FindVideoByPublicIdUseCase(mockVideoRepo);
    });

    it("returns video when found and user is authorized", async () => {
        const video = createMockVideo({
            publicId: testPublicId,
            userId: testUserId,
        });

        vi.mocked(mockVideoRepo.findVideoByPublicId).mockResolvedValue(video);

        const result = await useCase.execute(testPublicId, testUserId);

        expect(result).not.toBeNull();
        expect(result?.publicId).toBe(testPublicId);
        expect(result?.userId).toBe(testUserId);
        expect(mockVideoRepo.findVideoByPublicId).toHaveBeenCalledWith(testPublicId);
    });

    it("returns null when video not found", async () => {
        vi.mocked(mockVideoRepo.findVideoByPublicId).mockResolvedValue(null);

        const result = await useCase.execute("non-existent-uuid", testUserId);

        expect(result).toBeNull();
    });

    it("returns null when user is not authorized (video belongs to different user)", async () => {
        const video = createMockVideo({
            publicId: testPublicId,
            userId: "different-user",
        });

        vi.mocked(mockVideoRepo.findVideoByPublicId).mockResolvedValue(video);

        const result = await useCase.execute(testPublicId, testUserId);

        expect(result).toBeNull();
    });
});
