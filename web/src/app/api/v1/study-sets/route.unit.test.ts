import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { CreateStudySetUseCase } from "@/clean-architecture/use-cases/study-set/create-study-set.use-case";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";
import type { NextRequest } from "next/server";

vi.mock("@/lib/auth-helpers");
vi.mock("@/clean-architecture/use-cases/study-set/create-study-set.use-case");
vi.mock("@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle");
vi.mock("@/drizzle", () => ({
  db: {},
}));

function createMockRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/v1/study-sets", {
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

describe("POST /api/v1/study-sets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if not authenticated", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      user: null,
      error: "Not authenticated",
    });

    const request = createMockRequest({ name: "Test Study Set" });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Unauthorized");
  });

  it("returns 400 if name is missing", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

    const request = createMockRequest({});

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Study set name is required");
  });

  it("returns 400 if name is not a string", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

    const request = createMockRequest({ name: 123 });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Study set name is required");
  });

  it("creates a manual study set and returns 201", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

    const mockStudySet = new StudySetEntity(
      1,
      "public-id-abc",
      "user-123",
      "My Study Set",
      "A description",
      "manual",
      null,
      "2025-01-27T10:00:00Z",
      "2025-01-27T10:00:00Z"
    );

    const mockExecute = vi.fn().mockResolvedValue(mockStudySet);
    vi.mocked(CreateStudySetUseCase).mockImplementation(() => ({
      execute: mockExecute,
    }) as unknown as CreateStudySetUseCase);

    const request = createMockRequest({ name: "My Study Set", description: "A description" });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.status).toBe("success");
    expect(data.data.studySet).toEqual({
      id: 1,
      publicId: "public-id-abc",
      name: "My Study Set",
      description: "A description",
      sourceType: "manual",
      videoId: null,
      createdAt: "2025-01-27T10:00:00Z",
      updatedAt: "2025-01-27T10:00:00Z",
    });

    expect(mockExecute).toHaveBeenCalledWith({
      userId: "user-123",
      name: "My Study Set",
      description: "A description",
      sourceType: "manual",
      videoId: null,
    });
  });

  it("creates study set with null description when not provided", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

    const mockStudySet = new StudySetEntity(
      2,
      "public-id-xyz",
      "user-123",
      "Study Set Without Description",
      null,
      "manual",
      null,
      "2025-01-27T10:00:00Z",
      "2025-01-27T10:00:00Z"
    );

    const mockExecute = vi.fn().mockResolvedValue(mockStudySet);
    vi.mocked(CreateStudySetUseCase).mockImplementation(() => ({
      execute: mockExecute,
    }) as unknown as CreateStudySetUseCase);

    const request = createMockRequest({ name: "Study Set Without Description" });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.studySet.description).toBeNull();

    expect(mockExecute).toHaveBeenCalledWith({
      userId: "user-123",
      name: "Study Set Without Description",
      description: null,
      sourceType: "manual",
      videoId: null,
    });
  });

  it("trims whitespace from name", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

    const mockStudySet = new StudySetEntity(
      3,
      "public-id-trim",
      "user-123",
      "Trimmed Name",
      null,
      "manual",
      null,
      "2025-01-27T10:00:00Z",
      "2025-01-27T10:00:00Z"
    );

    const mockExecute = vi.fn().mockResolvedValue(mockStudySet);
    vi.mocked(CreateStudySetUseCase).mockImplementation(() => ({
      execute: mockExecute,
    }) as unknown as CreateStudySetUseCase);

    const request = createMockRequest({ name: "  Trimmed Name  " });

    await POST(request);

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Trimmed Name" })
    );
  });

  it("returns 500 when use case throws an error", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

    const mockExecute = vi.fn().mockRejectedValue(new Error("Database error"));
    vi.mocked(CreateStudySetUseCase).mockImplementation(() => ({
      execute: mockExecute,
    }) as unknown as CreateStudySetUseCase);

    const request = createMockRequest({ name: "My Study Set" });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.status).toBe("error");
    expect(data.message).toBe("Database error");
  });
});
