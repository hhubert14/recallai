import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { AddQuestionToStudySetUseCase } from "@/clean-architecture/use-cases/question/add-question-to-study-set.use-case";
import {
  MultipleChoiceQuestionEntity,
  MultipleChoiceOption,
} from "@/clean-architecture/domain/entities/question.entity";
import type { NextRequest } from "next/server";

vi.mock("@/lib/auth-helpers");
vi.mock(
  "@/clean-architecture/use-cases/question/add-question-to-study-set.use-case"
);
vi.mock(
  "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle"
);
vi.mock(
  "@/clean-architecture/infrastructure/repositories/question.repository.drizzle"
);
vi.mock(
  "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle"
);
vi.mock("@/drizzle", () => ({
  db: {},
}));

function createMockRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/v1/study-sets/abc-123/questions", {
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

const validOptions = [
  { optionText: "Option A", isCorrect: true, explanation: "Correct!" },
  { optionText: "Option B", isCorrect: false, explanation: null },
  { optionText: "Option C", isCorrect: false, explanation: null },
  { optionText: "Option D", isCorrect: false, explanation: null },
];

describe("POST /api/v1/study-sets/[publicId]/questions", () => {
  const publicId = "abc-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if not authenticated", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      user: null,
      error: "Not authenticated",
    });

    const request = createMockRequest({
      questionText: "What is TDD?",
      options: validOptions,
    });

    const response = await POST(request, {
      params: Promise.resolve({ publicId }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Unauthorized");
  });

  it("returns 400 if questionText is missing", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const request = createMockRequest({ options: validOptions });

    const response = await POST(request, {
      params: Promise.resolve({ publicId }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Question text is required");
  });

  it("returns 400 if options is missing", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const request = createMockRequest({ questionText: "What is TDD?" });

    const response = await POST(request, {
      params: Promise.resolve({ publicId }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Options array is required");
  });

  it("returns 400 if options is not an array", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const request = createMockRequest({
      questionText: "What is TDD?",
      options: "not-an-array",
    });

    const response = await POST(request, {
      params: Promise.resolve({ publicId }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Options array is required");
  });

  it("creates question and returns 201", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockQuestion = new MultipleChoiceQuestionEntity(
      100,
      null,
      "What is TDD?",
      [
        new MultipleChoiceOption(1, "Option A", true, "Correct!"),
        new MultipleChoiceOption(2, "Option B", false, null),
        new MultipleChoiceOption(3, "Option C", false, null),
        new MultipleChoiceOption(4, "Option D", false, null),
      ]
    );

    const mockExecute = vi.fn().mockResolvedValue(mockQuestion);
    vi.mocked(AddQuestionToStudySetUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as AddQuestionToStudySetUseCase
    );

    const request = createMockRequest({
      questionText: "What is TDD?",
      options: validOptions,
    });

    const response = await POST(request, {
      params: Promise.resolve({ publicId }),
    });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.status).toBe("success");
    expect(data.data.question).toEqual({
      id: 100,
      videoId: null,
      questionText: "What is TDD?",
      options: [
        {
          id: 1,
          optionText: "Option A",
          isCorrect: true,
          explanation: "Correct!",
        },
        { id: 2, optionText: "Option B", isCorrect: false, explanation: null },
        { id: 3, optionText: "Option C", isCorrect: false, explanation: null },
        { id: 4, optionText: "Option D", isCorrect: false, explanation: null },
      ],
    });

    expect(mockExecute).toHaveBeenCalledWith({
      userId: "user-123",
      studySetPublicId: publicId,
      questionText: "What is TDD?",
      options: validOptions,
    });
  });

  it("returns 404 when study set not found", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockExecute = vi
      .fn()
      .mockRejectedValue(new Error("Study set not found"));
    vi.mocked(AddQuestionToStudySetUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as AddQuestionToStudySetUseCase
    );

    const request = createMockRequest({
      questionText: "What is TDD?",
      options: validOptions,
    });

    const response = await POST(request, {
      params: Promise.resolve({ publicId: "nonexistent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Study set not found");
  });

  it("returns 403 when user not authorized", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockExecute = vi
      .fn()
      .mockRejectedValue(
        new Error("Not authorized to add items to this study set")
      );
    vi.mocked(AddQuestionToStudySetUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as AddQuestionToStudySetUseCase
    );

    const request = createMockRequest({
      questionText: "What is TDD?",
      options: validOptions,
    });

    const response = await POST(request, {
      params: Promise.resolve({ publicId }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe(
      "Not authorized to add items to this study set"
    );
  });

  it("returns 400 when validation fails", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockExecute = vi
      .fn()
      .mockRejectedValue(new Error("Question must have exactly 4 options"));
    vi.mocked(AddQuestionToStudySetUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as AddQuestionToStudySetUseCase
    );

    const request = createMockRequest({
      questionText: "What is TDD?",
      options: validOptions,
    });

    const response = await POST(request, {
      params: Promise.resolve({ publicId }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe("fail");
    expect(data.data.error).toBe("Question must have exactly 4 options");
  });

  it("returns 500 for unexpected errors", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(
      mockAuthenticatedUser("user-123")
    );

    const mockExecute = vi
      .fn()
      .mockRejectedValue(new Error("Database connection failed"));
    vi.mocked(AddQuestionToStudySetUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as AddQuestionToStudySetUseCase
    );

    const request = createMockRequest({
      questionText: "What is TDD?",
      options: validOptions,
    });

    const response = await POST(request, {
      params: Promise.resolve({ publicId }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.status).toBe("error");
    expect(data.message).toBe("Database connection failed");
  });
});
