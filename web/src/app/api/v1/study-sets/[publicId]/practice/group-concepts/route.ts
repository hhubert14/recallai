import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { getRateLimiter } from "@/lib/rate-limit";
import { GroupItemsIntoConceptsUseCase } from "@/clean-architecture/use-cases/practice/group-items-into-concepts.use-case";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { DrizzleFlashcardRepository } from "@/clean-architecture/infrastructure/repositories/flashcard.repository.drizzle";
import { LangChainConceptGrouperService } from "@/clean-architecture/infrastructure/services/concept-grouper.service.langchain";

/**
 * POST /api/v1/study-sets/[publicId]/practice/group-concepts
 * Group study set items into 2-5 concepts for practice mode
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    // Rate limiting
    const { success } = await getRateLimiter(
      "/api/v1/practice/group-concepts"
    ).limit(user.id);
    if (!success) {
      return jsendFail(
        { error: "Rate limit exceeded. Please try again later." },
        429
      );
    }

    const { publicId } = await params;

    const useCase = new GroupItemsIntoConceptsUseCase(
      new DrizzleStudySetRepository(),
      new DrizzleReviewableItemRepository(),
      new DrizzleQuestionRepository(),
      new DrizzleFlashcardRepository(),
      new LangChainConceptGrouperService()
    );

    const concepts = await useCase.execute(publicId, user.id);

    return jsendSuccess({ concepts });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Map specific errors to appropriate HTTP status codes
    if (message === "Study set not found") {
      return jsendFail({ error: message }, 404);
    }
    if (message === "Unauthorized") {
      return jsendFail({ error: message }, 403);
    }
    if (message === "Practice requires at least 5 items in your study set") {
      return jsendFail({ error: message }, 400);
    }

    return jsendError(message);
  }
}
