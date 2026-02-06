import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { GetStreakUseCase } from "@/clean-architecture/use-cases/streak/get-streak.use-case";
import type { NextRequest } from "next/server";

vi.mock("@/lib/auth-helpers");
vi.mock("@/clean-architecture/use-cases/streak/get-streak.use-case");
vi.mock(
  "@/clean-architecture/infrastructure/repositories/streak.repository.drizzle"
);
vi.mock("@/drizzle", () => ({
  db: {},
}));

function createMockRequest(url: string): NextRequest {
  return new Request(url, {
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

describe("GET /api/v1/streaks/[userId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if not authenticated (error returned)", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      user: null,
      error: "Not authenticated",
    });

    const request = createMockRequest(
      "http://localhost/api/v1/streaks/user-123"
    );
    const params = Promise.resolve({ userId: "user-123" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Unauthorized");
  });

  it("returns 401 if no user returned", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      user: null,
      error: "Unauthorized",
    });

    const request = createMockRequest(
      "http://localhost/api/v1/streaks/user-123"
    );
    const params = Promise.resolve({ userId: "user-123" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Unauthorized");
  });

  it("returns 403 when authenticated user.id !== requested userId", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const request = createMockRequest(
      "http://localhost/api/v1/streaks/user-456"
    );
    const params = Promise.resolve({ userId: "user-456" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Forbidden");
  });

  it("returns 200 with streak data when authenticated user matches requested userId", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockStreak = {
      currentStreak: 5,
      longestStreak: 10,
      lastActivityDate: "2025-01-30",
    };

    const mockExecute = vi.fn().mockResolvedValue(mockStreak);
    vi.mocked(GetStreakUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as GetStreakUseCase
    );

    const request = createMockRequest(
      "http://localhost/api/v1/streaks/user-123"
    );
    const params = Promise.resolve({ userId: "user-123" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("success");
    expect(data.data).toEqual(mockStreak);

    // Verify use case was called with correct userId and no timezone
    expect(mockExecute).toHaveBeenCalledWith("user-123", undefined);
  });

  it("passes timezone query parameter to GetStreakUseCase.execute()", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockStreak = {
      currentStreak: 3,
      longestStreak: 8,
      lastActivityDate: "2025-01-29",
    };

    const mockExecute = vi.fn().mockResolvedValue(mockStreak);
    vi.mocked(GetStreakUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as GetStreakUseCase
    );

    const request = createMockRequest(
      "http://localhost/api/v1/streaks/user-123?timezone=America/New_York"
    );
    const params = Promise.resolve({ userId: "user-123" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("success");

    // Verify timezone was passed to use case
    expect(mockExecute).toHaveBeenCalledWith("user-123", "America/New_York");
  });

  it("returns 500 when use case throws an error", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockExecute = vi.fn().mockRejectedValue(new Error("Database error"));
    vi.mocked(GetStreakUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as GetStreakUseCase
    );

    const request = createMockRequest(
      "http://localhost/api/v1/streaks/user-123"
    );
    const params = Promise.resolve({ userId: "user-123" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.status).toBe("error");
    expect(data.message).toBe("Failed to fetch streak");
  });
});
