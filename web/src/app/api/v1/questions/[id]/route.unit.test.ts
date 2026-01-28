import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH, DELETE } from "./route";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { EditQuestionUseCase } from "@/clean-architecture/use-cases/question/edit-question.use-case";
import { DeleteQuestionUseCase } from "@/clean-architecture/use-cases/question/delete-question.use-case";
import {
    MultipleChoiceQuestionEntity,
    MultipleChoiceOption,
} from "@/clean-architecture/domain/entities/question.entity";
import type { NextRequest } from "next/server";

vi.mock("@/lib/auth-helpers");
vi.mock("@/clean-architecture/use-cases/question/edit-question.use-case");
vi.mock("@/clean-architecture/use-cases/question/delete-question.use-case");
vi.mock("@/clean-architecture/infrastructure/repositories/question.repository.drizzle");
vi.mock("@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle");
vi.mock("@/drizzle", () => ({
    db: {},
}));

const validOptions = [
    { id: 1, optionText: "Option A", isCorrect: true, explanation: "Because..." },
    { id: 2, optionText: "Option B", isCorrect: false, explanation: null },
    { id: 3, optionText: "Option C", isCorrect: false, explanation: null },
    { id: 4, optionText: "Option D", isCorrect: false, explanation: null },
];

function createMockRequest(body: unknown): NextRequest {
    return new Request("http://localhost/api/v1/questions/100", {
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

describe("PATCH /api/v1/questions/[id]", () => {
    const questionId = "100";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 401 if not authenticated", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({
            user: null,
            error: "Not authenticated",
        });

        const request = createMockRequest({
            questionText: "New question?",
            options: validOptions,
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Unauthorized");
    });

    it("returns 400 if id is not a valid number", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const request = createMockRequest({
            questionText: "New question?",
            options: validOptions,
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: "invalid" }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Invalid question ID");
    });

    it("returns 400 if questionText is missing", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const request = createMockRequest({
            options: validOptions,
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Question text is required");
    });

    it("returns 400 if options is missing", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const request = createMockRequest({
            questionText: "New question?",
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Options are required and must be an array");
    });

    it("returns 400 if options is not an array", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const request = createMockRequest({
            questionText: "New question?",
            options: "not an array",
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Options are required and must be an array");
    });

    it("updates question and returns 200", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const updatedOptions = [
            new MultipleChoiceOption(1, "Updated A", true, "Because..."),
            new MultipleChoiceOption(2, "Updated B", false, null),
            new MultipleChoiceOption(3, "Updated C", false, null),
            new MultipleChoiceOption(4, "Updated D", false, null),
        ];

        const mockQuestion = new MultipleChoiceQuestionEntity(
            100,
            null,
            "Updated question?",
            updatedOptions,
            null,
            null
        );

        const mockExecute = vi.fn().mockResolvedValue(mockQuestion);
        vi.mocked(EditQuestionUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as EditQuestionUseCase);

        const request = createMockRequest({
            questionText: "Updated question?",
            options: [
                { id: 1, optionText: "Updated A", isCorrect: true, explanation: "Because..." },
                { id: 2, optionText: "Updated B", isCorrect: false, explanation: null },
                { id: 3, optionText: "Updated C", isCorrect: false, explanation: null },
                { id: 4, optionText: "Updated D", isCorrect: false, explanation: null },
            ],
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe("success");
        expect(data.data.question).toEqual({
            id: 100,
            videoId: null,
            questionText: "Updated question?",
            options: [
                { id: 1, optionText: "Updated A", isCorrect: true, explanation: "Because..." },
                { id: 2, optionText: "Updated B", isCorrect: false, explanation: null },
                { id: 3, optionText: "Updated C", isCorrect: false, explanation: null },
                { id: 4, optionText: "Updated D", isCorrect: false, explanation: null },
            ],
            sourceQuote: null,
            sourceTimestamp: null,
        });

        expect(mockExecute).toHaveBeenCalledWith({
            userId: "user-123",
            questionId: 100,
            questionText: "Updated question?",
            options: [
                { id: 1, optionText: "Updated A", isCorrect: true, explanation: "Because..." },
                { id: 2, optionText: "Updated B", isCorrect: false, explanation: null },
                { id: 3, optionText: "Updated C", isCorrect: false, explanation: null },
                { id: 4, optionText: "Updated D", isCorrect: false, explanation: null },
            ],
        });
    });

    it("returns 404 when question not found", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockRejectedValue(new Error("Question not found"));
        vi.mocked(EditQuestionUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as EditQuestionUseCase);

        const request = createMockRequest({
            questionText: "New question?",
            options: validOptions,
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: "999" }) });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Question not found");
    });

    it("returns 403 when user not authorized", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockRejectedValue(new Error("Not authorized to edit this question"));
        vi.mocked(EditQuestionUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as EditQuestionUseCase);

        const request = createMockRequest({
            questionText: "New question?",
            options: validOptions,
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Not authorized to edit this question");
    });

    it("returns 400 when question text is empty", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockRejectedValue(new Error("Question text cannot be empty"));
        vi.mocked(EditQuestionUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as EditQuestionUseCase);

        const request = createMockRequest({
            questionText: "   ",
            options: validOptions,
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Question text cannot be empty");
    });

    it("returns 400 when question text exceeds 1000 characters", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockRejectedValue(new Error("Question text cannot exceed 1000 characters"));
        vi.mocked(EditQuestionUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as EditQuestionUseCase);

        const request = createMockRequest({
            questionText: "a".repeat(1001),
            options: validOptions,
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Question text cannot exceed 1000 characters");
    });

    it("returns 400 when options count is wrong", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockRejectedValue(new Error("Must provide exactly 4 options"));
        vi.mocked(EditQuestionUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as EditQuestionUseCase);

        const request = createMockRequest({
            questionText: "New question?",
            options: validOptions.slice(0, 3), // Only 3 options
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Must provide exactly 4 options");
    });

    it("returns 400 when correct answer count is wrong", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockRejectedValue(new Error("Exactly one option must be marked as correct"));
        vi.mocked(EditQuestionUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as EditQuestionUseCase);

        const request = createMockRequest({
            questionText: "New question?",
            options: validOptions.map(o => ({ ...o, isCorrect: false })), // No correct answers
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Exactly one option must be marked as correct");
    });

    it("returns 400 when option text is empty", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockRejectedValue(new Error("Option text cannot be empty"));
        vi.mocked(EditQuestionUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as EditQuestionUseCase);

        const request = createMockRequest({
            questionText: "New question?",
            options: validOptions,
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Option text cannot be empty");
    });

    it("returns 400 when option text exceeds 500 characters", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockRejectedValue(new Error("Option text cannot exceed 500 characters"));
        vi.mocked(EditQuestionUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as EditQuestionUseCase);

        const request = createMockRequest({
            questionText: "New question?",
            options: validOptions,
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Option text cannot exceed 500 characters");
    });

    it("returns 400 when option ID does not belong to the question", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockRejectedValue(new Error("Invalid option ID: option does not belong to this question"));
        vi.mocked(EditQuestionUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as EditQuestionUseCase);

        const request = createMockRequest({
            questionText: "New question?",
            options: validOptions,
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Invalid option ID: option does not belong to this question");
    });

    it("returns 500 for unexpected errors", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockRejectedValue(new Error("Database connection failed"));
        vi.mocked(EditQuestionUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as EditQuestionUseCase);

        const request = createMockRequest({
            questionText: "New question?",
            options: validOptions,
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.status).toBe("error");
        expect(data.message).toBe("Database connection failed");
    });
});

function createDeleteRequest(): NextRequest {
    return new Request("http://localhost/api/v1/questions/100", {
        method: "DELETE",
    }) as unknown as NextRequest;
}

describe("DELETE /api/v1/questions/[id]", () => {
    const questionId = "100";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 401 if not authenticated", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({
            user: null,
            error: "Not authenticated",
        });

        const request = createDeleteRequest();

        const response = await DELETE(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Unauthorized");
    });

    it("returns 400 if id is not a valid number", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const request = createDeleteRequest();

        const response = await DELETE(request, { params: Promise.resolve({ id: "invalid" }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Invalid question ID");
    });

    it("deletes question and returns 200", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockResolvedValue(undefined);
        vi.mocked(DeleteQuestionUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as DeleteQuestionUseCase);

        const request = createDeleteRequest();

        const response = await DELETE(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe("success");
        expect(data.data.message).toBe("Question deleted");

        expect(mockExecute).toHaveBeenCalledWith({
            questionId: 100,
            userId: "user-123",
        });
    });

    it("returns 404 when question not found", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockRejectedValue(new Error("Question not found"));
        vi.mocked(DeleteQuestionUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as DeleteQuestionUseCase);

        const request = createDeleteRequest();

        const response = await DELETE(request, { params: Promise.resolve({ id: "999" }) });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Question not found");
    });

    it("returns 403 when user not authorized", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockRejectedValue(new Error("Not authorized to delete this question"));
        vi.mocked(DeleteQuestionUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as DeleteQuestionUseCase);

        const request = createDeleteRequest();

        const response = await DELETE(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.status).toBe("fail");
        expect(data.data.error).toBe("Not authorized to delete this question");
    });

    it("returns 500 for unexpected errors", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockAuthenticatedUser("user-123"));

        const mockExecute = vi.fn().mockRejectedValue(new Error("Database connection failed"));
        vi.mocked(DeleteQuestionUseCase).mockImplementation(() => ({
            execute: mockExecute,
        }) as unknown as DeleteQuestionUseCase);

        const request = createDeleteRequest();

        const response = await DELETE(request, { params: Promise.resolve({ id: questionId }) });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.status).toBe("error");
        expect(data.message).toBe("Database connection failed");
    });
});
