import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";
import type { NextRequest } from "next/server";

vi.mock("@/lib/auth-helpers");
vi.mock("@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle");
vi.mock("@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle");
vi.mock("@/drizzle", () => ({
    db: {},
}));

function createMockRequest(): NextRequest {
    return new Request("http://localhost/api/v1/study-sets/abc-123/count", {
        method: "GET",
    }) as unknown as NextRequest;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockAuthenticatedUser(userId: string): any {
    return {
        user: { id: userId },
        error: null,
    };
}

describe("GET /api/v1/study-sets/[publicId]/count", () => {
    const publicId = "abc-123";
    const userId = "user-123";

    let mockFindStudySetByPublicId: ReturnType<typeof vi.fn>;
    let mockCountItemsByStudySetId: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();

        mockFindStudySetByPublicId = vi.fn();
        mockCountItemsByStudySetId = vi.fn();

        vi.mocked(DrizzleStudySetRepository).mockImplementation(() => ({
            findStudySetByPublicId: mockFindStudySetByPublicId,
        }) as unknown as DrizzleStudySetRepository);

        vi.mocked(DrizzleReviewableItemRepository).mockImplementation(() => ({
            countItemsByStudySetId: mockCountItemsByStudySetId,
        }) as unknown as DrizzleReviewableItemRepository);
    });

    it("returns 401 if not authenticated", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({
            user: null,
            error: "Not authenticated",
        });

        const request = createMockRequest();

        const response = await GET(request, { params: Promise.resolve({ publicId }) });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Unauthorized");
    });

    it("returns 404 if study set not found", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser(userId));
        mockFindStudySetByPublicId.mockResolvedValue(null);

        const request = createMockRequest();

        const response = await GET(request, { params: Promise.resolve({ publicId }) });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Study set not found");
    });

    it("returns 403 if user does not own the study set", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser(userId));

        const otherUserStudySet = new StudySetEntity(
            1,
            publicId,
            "other-user-456",
            "Other User's Set",
            null,
            "manual",
            null,
            "2025-01-20T10:00:00Z",
            "2025-01-20T10:00:00Z"
        );
        mockFindStudySetByPublicId.mockResolvedValue(otherUserStudySet);

        const request = createMockRequest();

        const response = await GET(request, { params: Promise.resolve({ publicId }) });
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Not authorized to access this study set");
    });

    it("returns count for study set owned by user", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser(userId));

        const studySet = new StudySetEntity(
            1,
            publicId,
            userId,
            "My Study Set",
            null,
            "manual",
            null,
            "2025-01-20T10:00:00Z",
            "2025-01-20T10:00:00Z"
        );
        mockFindStudySetByPublicId.mockResolvedValue(studySet);
        mockCountItemsByStudySetId.mockResolvedValue(42);

        const request = createMockRequest();

        const response = await GET(request, { params: Promise.resolve({ publicId }) });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe("success");
        expect(data.data.count).toBe(42);

        expect(mockFindStudySetByPublicId).toHaveBeenCalledWith(publicId);
        expect(mockCountItemsByStudySetId).toHaveBeenCalledWith(1);
    });

    it("returns 0 for empty study set", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser(userId));

        const studySet = new StudySetEntity(
            1,
            publicId,
            userId,
            "Empty Study Set",
            null,
            "manual",
            null,
            "2025-01-20T10:00:00Z",
            "2025-01-20T10:00:00Z"
        );
        mockFindStudySetByPublicId.mockResolvedValue(studySet);
        mockCountItemsByStudySetId.mockResolvedValue(0);

        const request = createMockRequest();

        const response = await GET(request, { params: Promise.resolve({ publicId }) });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe("success");
        expect(data.data.count).toBe(0);
    });
});
