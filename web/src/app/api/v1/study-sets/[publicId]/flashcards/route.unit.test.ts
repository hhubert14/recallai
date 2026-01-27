import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { AddFlashcardToStudySetUseCase } from "@/clean-architecture/use-cases/flashcard/add-flashcard-to-study-set.use-case";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";
import type { NextRequest } from "next/server";

vi.mock("@/lib/auth-helpers");
vi.mock("@/clean-architecture/use-cases/flashcard/add-flashcard-to-study-set.use-case");
vi.mock("@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle");
vi.mock("@/clean-architecture/infrastructure/repositories/flashcard.repository.drizzle");
vi.mock("@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle");
vi.mock("@/drizzle", () => ({
    db: {},
}));

function createMockRequest(body: unknown): NextRequest {
    return new Request("http://localhost/api/v1/study-sets/abc-123/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    }) as unknown as NextRequest;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockAuthenticatedUser(userId: string): any {
    return {
        user: { id: userId },
        error: null,
    };
}

describe("POST /api/v1/study-sets/[publicId]/flashcards", () => {
    const publicId = "abc-123";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 401 if not authenticated", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({
            user: null,
            error: "Not authenticated",
        });

        const request = createMockRequest({ front: "Question?", back: "Answer" });

        const response = await POST(request, { params: Promise.resolve({ publicId }) });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Unauthorized");
    });

    it("returns 400 if front is missing", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const request = createMockRequest({ back: "Answer" });

        const response = await POST(request, { params: Promise.resolve({ publicId }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Front of flashcard is required");
    });

    it("returns 400 if back is missing", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const request = createMockRequest({ front: "Question?" });

        const response = await POST(request, { params: Promise.resolve({ publicId }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Back of flashcard is required");
    });

    it("creates flashcard and returns 201", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockFlashcard = new FlashcardEntity(
            100,
            null,
            "user-123",
            "What is TDD?",
            "Test-Driven Development",
            "2025-01-27T10:00:00Z"
        );

        const mockExecute = vi.fn().mockResolvedValue(mockFlashcard);
        vi.mocked(AddFlashcardToStudySetUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as AddFlashcardToStudySetUseCase);

        const request = createMockRequest({ front: "What is TDD?", back: "Test-Driven Development" });

        const response = await POST(request, { params: Promise.resolve({ publicId }) });
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.status).toBe("success");
        expect(data.data.flashcard).toEqual({
            id: 100,
            videoId: null,
            userId: "user-123",
            front: "What is TDD?",
            back: "Test-Driven Development",
            createdAt: "2025-01-27T10:00:00Z",
        });

        expect(mockExecute).toHaveBeenCalledWith({
            userId: "user-123",
            studySetPublicId: publicId,
            front: "What is TDD?",
            back: "Test-Driven Development",
        });
    });

    it("returns 404 when study set not found", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockRejectedValue(new Error("Study set not found"));
        vi.mocked(AddFlashcardToStudySetUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as AddFlashcardToStudySetUseCase);

        const request = createMockRequest({ front: "Question?", back: "Answer" });

        const response = await POST(request, { params: Promise.resolve({ publicId: "nonexistent" }) });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Study set not found");
    });

    it("returns 403 when user not authorized", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockRejectedValue(new Error("Not authorized to add items to this study set"));
        vi.mocked(AddFlashcardToStudySetUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as AddFlashcardToStudySetUseCase);

        const request = createMockRequest({ front: "Question?", back: "Answer" });

        const response = await POST(request, { params: Promise.resolve({ publicId }) });
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Not authorized to add items to this study set");
    });

    it("returns 400 when front is empty", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockRejectedValue(new Error("Front of flashcard cannot be empty"));
        vi.mocked(AddFlashcardToStudySetUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as AddFlashcardToStudySetUseCase);

        const request = createMockRequest({ front: "   ", back: "Answer" });

        const response = await POST(request, { params: Promise.resolve({ publicId }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Front of flashcard cannot be empty");
    });

    it("returns 500 for unexpected errors", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockRejectedValue(new Error("Database connection failed"));
        vi.mocked(AddFlashcardToStudySetUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as AddFlashcardToStudySetUseCase);

        const request = createMockRequest({ front: "Question?", back: "Answer" });

        const response = await POST(request, { params: Promise.resolve({ publicId }) });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.status).toBe("error");
        expect(data.message).toBe("Database connection failed");
    });
});
