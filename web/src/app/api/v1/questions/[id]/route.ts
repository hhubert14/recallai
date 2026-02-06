import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { EditQuestionUseCase } from "@/clean-architecture/use-cases/question/edit-question.use-case";
import { DeleteQuestionUseCase } from "@/clean-architecture/use-cases/question/delete-question.use-case";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";

/**
 * PATCH /api/v1/questions/[id]
 * Update a question's text and options
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const { id } = await params;
    const questionId = parseInt(id, 10);

    if (isNaN(questionId)) {
      return jsendFail({ error: "Invalid question ID" }, 400);
    }

    const body = await request.json();
    const { questionText, options } = body;

    // Validate required fields
    if (!questionText || typeof questionText !== "string") {
      return jsendFail({ error: "Question text is required" }, 400);
    }

    if (!options || !Array.isArray(options)) {
      return jsendFail(
        { error: "Options are required and must be an array" },
        400
      );
    }

    const useCase = new EditQuestionUseCase(
      new DrizzleQuestionRepository(),
      new DrizzleReviewableItemRepository()
    );

    const question = await useCase.execute({
      userId: user.id,
      questionId,
      questionText,
      options,
    });

    return jsendSuccess({
      question: {
        id: question.id,
        videoId: question.videoId,
        questionText: question.questionText,
        options: question.options.map((opt) => ({
          id: opt.id,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
          explanation: opt.explanation,
        })),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Map specific errors to appropriate HTTP status codes
    if (message === "Question not found") {
      return jsendFail({ error: message }, 404);
    }
    if (message === "Not authorized to edit this question") {
      return jsendFail({ error: message }, 403);
    }
    if (
      message.includes("cannot be empty") ||
      message.includes("cannot exceed") ||
      message.includes("Must provide exactly") ||
      message.includes("Exactly one option") ||
      message.includes("Invalid option ID")
    ) {
      return jsendFail({ error: message }, 400);
    }

    return jsendError(message);
  }
}

/**
 * DELETE /api/v1/questions/[id]
 * Delete a question
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const { id } = await params;
    const questionId = parseInt(id, 10);

    if (isNaN(questionId)) {
      return jsendFail({ error: "Invalid question ID" }, 400);
    }

    const useCase = new DeleteQuestionUseCase(
      new DrizzleQuestionRepository(),
      new DrizzleReviewableItemRepository()
    );

    await useCase.execute({
      questionId,
      userId: user.id,
    });

    return jsendSuccess({ message: "Question deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "Question not found") {
      return jsendFail({ error: message }, 404);
    }

    return jsendError(message);
  }
}
