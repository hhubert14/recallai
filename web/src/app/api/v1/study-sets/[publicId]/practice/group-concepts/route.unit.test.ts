import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

// Mock dependencies
vi.mock("@/lib/auth-helpers", () => ({
    getAuthenticatedUser: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
    getRateLimiter: vi.fn(),
}));

vi.mock("@/clean-architecture/use-cases/practice/group-items-into-concepts.use-case", () => ({
    GroupItemsIntoConceptsUseCase: vi.fn(),
}));

vi.mock("@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle", () => ({
    DrizzleStudySetRepository: vi.fn(),
}));

vi.mock("@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle", () => ({
    DrizzleReviewableItemRepository: vi.fn(),
}));

vi.mock("@/clean-architecture/infrastructure/repositories/question.repository.drizzle", () => ({
    DrizzleQuestionRepository: vi.fn(),
}));

vi.mock("@/clean-architecture/infrastructure/repositories/flashcard.repository.drizzle", () => ({
    DrizzleFlashcardRepository: vi.fn(),
}));

vi.mock("@/clean-architecture/infrastructure/services/concept-grouper.service.langchain", () => ({
    LangChainConceptGrouperService: vi.fn(),
}));

import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { getRateLimiter } from "@/lib/rate-limit";
import { GroupItemsIntoConceptsUseCase } from "@/clean-architecture/use-cases/practice/group-items-into-concepts.use-case";

// Helper to create a mock authenticated user response
function mockAuthenticatedUser(userId: string) {
    return {
        user: { id: userId },
        error: null,
    } as Awaited<ReturnType<typeof getAuthenticatedUser>>;
}

function createMockRequest(): NextRequest {
    return new NextRequest("http://localhost:3000/api/v1/study-sets/abc123/practice/group-concepts", {
        method: "POST",
    });
}

function createParams(publicId: string = "abc123"): Promise<{ publicId: string }> {
    return Promise.resolve({ publicId });
}

describe("POST /api/v1/study-sets/[publicId]/practice/group-concepts", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 401 when user is not authenticated", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({
            user: null,
            error: "Not authenticated",
        });

        const response = await POST(createMockRequest(), { params: createParams() });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Unauthorized");
    });

    it("returns 429 when rate limit is exceeded", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({
            ...mockAuthenticatedUser("user-123"),
        });
        vi.mocked(getRateLimiter).mockReturnValue({
            limit: vi.fn().mockResolvedValue({ success: false }),
        } as unknown as ReturnType<typeof getRateLimiter>);

        const response = await POST(createMockRequest(), { params: createParams() });
        const data = await response.json();

        expect(response.status).toBe(429);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Rate limit exceeded. Please try again later.");
    });

    it("returns 404 when study set is not found", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({
            ...mockAuthenticatedUser("user-123"),
        });
        vi.mocked(getRateLimiter).mockReturnValue({
            limit: vi.fn().mockResolvedValue({ success: true }),
        } as unknown as ReturnType<typeof getRateLimiter>);

        const mockExecute = vi.fn().mockRejectedValue(new Error("Study set not found"));
        vi.mocked(GroupItemsIntoConceptsUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as GroupItemsIntoConceptsUseCase);

        const response = await POST(createMockRequest(), { params: createParams() });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Study set not found");
    });

    it("returns 403 when user does not own the study set", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({
            ...mockAuthenticatedUser("user-123"),
        });
        vi.mocked(getRateLimiter).mockReturnValue({
            limit: vi.fn().mockResolvedValue({ success: true }),
        } as unknown as ReturnType<typeof getRateLimiter>);

        const mockExecute = vi.fn().mockRejectedValue(new Error("Unauthorized"));
        vi.mocked(GroupItemsIntoConceptsUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as GroupItemsIntoConceptsUseCase);

        const response = await POST(createMockRequest(), { params: createParams() });
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Unauthorized");
    });

    it("returns 400 when study set has fewer than 5 items", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({
            ...mockAuthenticatedUser("user-123"),
        });
        vi.mocked(getRateLimiter).mockReturnValue({
            limit: vi.fn().mockResolvedValue({ success: true }),
        } as unknown as ReturnType<typeof getRateLimiter>);

        const mockExecute = vi.fn().mockRejectedValue(
            new Error("Practice requires at least 5 items in your study set")
        );
        vi.mocked(GroupItemsIntoConceptsUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as GroupItemsIntoConceptsUseCase);

        const response = await POST(createMockRequest(), { params: createParams() });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Practice requires at least 5 items in your study set");
    });

    it("returns concepts on success", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({
            ...mockAuthenticatedUser("user-123"),
        });
        vi.mocked(getRateLimiter).mockReturnValue({
            limit: vi.fn().mockResolvedValue({ success: true }),
        } as unknown as ReturnType<typeof getRateLimiter>);

        const mockConcepts = [
            {
                conceptName: "React Hooks",
                description: "Understanding React Hooks",
                itemIds: ["q-1", "f-2"],
            },
            {
                conceptName: "State Management",
                description: "Managing application state",
                itemIds: ["q-3", "f-4"],
            },
        ];

        const mockExecute = vi.fn().mockResolvedValue(mockConcepts);
        vi.mocked(GroupItemsIntoConceptsUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as GroupItemsIntoConceptsUseCase);

        const response = await POST(createMockRequest(), { params: createParams("test-public-id") });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe("success");
        expect(data.data.concepts).toEqual(mockConcepts);
        expect(mockExecute).toHaveBeenCalledWith("test-public-id", "user-123");
    });

    it("returns 500 for unexpected errors", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({
            ...mockAuthenticatedUser("user-123"),
        });
        vi.mocked(getRateLimiter).mockReturnValue({
            limit: vi.fn().mockResolvedValue({ success: true }),
        } as unknown as ReturnType<typeof getRateLimiter>);

        const mockExecute = vi.fn().mockRejectedValue(new Error("Database connection failed"));
        vi.mocked(GroupItemsIntoConceptsUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as GroupItemsIntoConceptsUseCase);

        const response = await POST(createMockRequest(), { params: createParams() });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.status).toBe("error");
        expect(data.message).toBe("Database connection failed");
    });
});
