import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { getRateLimiter } from "@/lib/rate-limit";
import { GeneratePracticeFeedbackUseCase } from "@/clean-architecture/use-cases/practice/generate-practice-feedback.use-case";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { LangChainFeedbackGeneratorService } from "@/clean-architecture/infrastructure/services/feedback-generator.service.langchain";
import { ConversationMessage } from "@/clean-architecture/domain/services/feedback-generator.interface";

/**
 * POST /api/v1/study-sets/[publicId]/practice/generate-feedback
 * Generate AI feedback for a completed practice session
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    // Rate limiting
    const { success } = await getRateLimiter(
      "/api/v1/practice/generate-feedback"
    ).limit(user.id);
    if (!success) {
      return jsendFail(
        { error: "Rate limit exceeded. Please try again later." },
        429
      );
    }

    const { publicId } = await params;
    const body = await request.json();
    const {
      conceptName,
      conversationHistory,
    }: {
      conceptName: string;
      conversationHistory: ConversationMessage[];
    } = body;

    // Validate required fields
    if (!conceptName || typeof conceptName !== "string") {
      return jsendFail({ error: "Concept name is required" }, 400);
    }

    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return jsendFail({ error: "Conversation history is required" }, 400);
    }

    // Validate conversation has at least one user message
    const hasUserMessage = conversationHistory.some(
      (msg) => msg.role === "user"
    );
    if (!hasUserMessage) {
      return jsendFail(
        {
          error: "Conversation must have at least one user message",
        },
        400
      );
    }

    const useCase = new GeneratePracticeFeedbackUseCase(
      new DrizzleStudySetRepository(),
      new LangChainFeedbackGeneratorService()
    );

    const feedback = await useCase.execute(
      publicId,
      user.id,
      conceptName,
      conversationHistory
    );

    return jsendSuccess({ feedback });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Map specific errors to appropriate HTTP status codes
    if (message === "Study set not found") {
      return jsendFail({ error: message }, 404);
    }
    if (message === "Unauthorized") {
      return jsendFail({ error: message }, 403);
    }
    if (message === "Conversation history cannot be empty") {
      return jsendFail({ error: message }, 400);
    }

    return jsendError(message);
  }
}
