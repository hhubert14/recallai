import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH, DELETE } from "./route";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { EditFlashcardUseCase } from "@/clean-architecture/use-cases/flashcard/edit-flashcard.use-case";
import { DeleteFlashcardUseCase } from "@/clean-architecture/use-cases/flashcard/delete-flashcard.use-case";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";
import type { NextRequest } from "next/server";

vi.mock("@/lib/auth-helpers");
vi.mock("@/clean-architecture/use-cases/flashcard/edit-flashcard.use-case");
vi.mock("@/clean-architecture/use-cases/flashcard/delete-flashcard.use-case");
vi.mock(
  "@/clean-architecture/infrastructure/repositories/flashcard.repository.drizzle"
);
vi.mock("@/drizzle", () => ({
  db: {},
}));

function createMockRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/v1/flashcards/100", {
    method: "PATCH",
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

describe("PATCH /api/v1/flashcards/[id]", () => {
  const flashcardId = "100";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if not authenticated", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      user: null,
      error: "Not authenticated",
    });

    const request = createMockRequest({ front: "New front", back: "New back" });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: flashcardId }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Unauthorized");
  });

  it("returns 400 if id is not a valid number", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const request = createMockRequest({ front: "New front", back: "New back" });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "invalid" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Invalid flashcard ID");
  });

  it("returns 400 if front is missing", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const request = createMockRequest({ back: "New back" });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: flashcardId }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Front of flashcard is required");
  });

  it("returns 400 if back is missing", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const request = createMockRequest({ front: "New front" });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: flashcardId }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Back of flashcard is required");
  });

  it("updates flashcard and returns 200", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockFlashcard = new FlashcardEntity(
      100,
      null,
      "user-123",
      "Updated front",
      "Updated back",
      "2025-01-27T10:00:00Z"
    );

    const mockExecute = vi.fn().mockResolvedValue(mockFlashcard);
    vi.mocked(EditFlashcardUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as EditFlashcardUseCase
    );

    const request = createMockRequest({
      front: "Updated front",
      back: "Updated back",
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: flashcardId }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("success");
    expect(data.data.flashcard).toEqual({
      id: 100,
      videoId: null,
      userId: "user-123",
      front: "Updated front",
      back: "Updated back",
      createdAt: "2025-01-27T10:00:00Z",
    });

    expect(mockExecute).toHaveBeenCalledWith({
      userId: "user-123",
      flashcardId: 100,
      front: "Updated front",
      back: "Updated back",
    });
  });

  it("returns 404 when flashcard not found", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockExecute = vi
      .fn()
      .mockRejectedValue(new Error("Flashcard not found"));
    vi.mocked(EditFlashcardUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as EditFlashcardUseCase
    );

    const request = createMockRequest({ front: "New front", back: "New back" });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "999" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Flashcard not found");
  });

  it("returns 403 when user not authorized", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockExecute = vi
      .fn()
      .mockRejectedValue(new Error("Not authorized to edit this flashcard"));
    vi.mocked(EditFlashcardUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as EditFlashcardUseCase
    );

    const request = createMockRequest({ front: "New front", back: "New back" });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: flashcardId }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Not authorized to edit this flashcard");
  });

  it("returns 400 when front is empty", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockExecute = vi
      .fn()
      .mockRejectedValue(new Error("Front of flashcard cannot be empty"));
    vi.mocked(EditFlashcardUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as EditFlashcardUseCase
    );

    const request = createMockRequest({ front: "   ", back: "New back" });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: flashcardId }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Front of flashcard cannot be empty");
  });

  it("returns 400 when front exceeds 500 characters", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockExecute = vi
      .fn()
      .mockRejectedValue(
        new Error("Front of flashcard cannot exceed 500 characters")
      );
    vi.mocked(EditFlashcardUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as EditFlashcardUseCase
    );

    const request = createMockRequest({
      front: "a".repeat(501),
      back: "New back",
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: flashcardId }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe(
      "Front of flashcard cannot exceed 500 characters"
    );
  });

  it("returns 400 when back exceeds 2000 characters", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockExecute = vi
      .fn()
      .mockRejectedValue(
        new Error("Back of flashcard cannot exceed 2000 characters")
      );
    vi.mocked(EditFlashcardUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as EditFlashcardUseCase
    );

    const request = createMockRequest({
      front: "New front",
      back: "a".repeat(2001),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: flashcardId }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe(
      "Back of flashcard cannot exceed 2000 characters"
    );
  });

  it("returns 500 for unexpected errors", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockExecute = vi
      .fn()
      .mockRejectedValue(new Error("Database connection failed"));
    vi.mocked(EditFlashcardUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as EditFlashcardUseCase
    );

    const request = createMockRequest({ front: "New front", back: "New back" });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: flashcardId }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.status).toBe("error");
    expect(data.message).toBe("Database connection failed");
  });
});

function createDeleteRequest(): NextRequest {
  return new Request("http://localhost/api/v1/flashcards/100", {
    method: "DELETE",
  }) as unknown as NextRequest;
}

describe("DELETE /api/v1/flashcards/[id]", () => {
  const flashcardId = "100";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if not authenticated", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      user: null,
      error: "Not authenticated",
    });

    const request = createDeleteRequest();

    const response = await DELETE(request, {
      params: Promise.resolve({ id: flashcardId }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Unauthorized");
  });

  it("returns 400 if id is not a valid number", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const request = createDeleteRequest();

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "invalid" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Invalid flashcard ID");
  });

  it("deletes flashcard and returns 200", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockExecute = vi.fn().mockResolvedValue(undefined);
    vi.mocked(DeleteFlashcardUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as DeleteFlashcardUseCase
    );

    const request = createDeleteRequest();

    const response = await DELETE(request, {
      params: Promise.resolve({ id: flashcardId }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("success");
    expect(data.data.message).toBe("Flashcard deleted");

    expect(mockExecute).toHaveBeenCalledWith({
      flashcardId: 100,
      userId: "user-123",
    });
  });

  it("returns 404 when flashcard not found", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockExecute = vi
      .fn()
      .mockRejectedValue(new Error("Flashcard not found"));
    vi.mocked(DeleteFlashcardUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as DeleteFlashcardUseCase
    );

    const request = createDeleteRequest();

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "999" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Flashcard not found");
  });

  it("returns 500 for unexpected errors", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockExecute = vi
      .fn()
      .mockRejectedValue(new Error("Database connection failed"));
    vi.mocked(DeleteFlashcardUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as DeleteFlashcardUseCase
    );

    const request = createDeleteRequest();

    const response = await DELETE(request, {
      params: Promise.resolve({ id: flashcardId }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.status).toBe("error");
    expect(data.message).toBe("Database connection failed");
  });
});
