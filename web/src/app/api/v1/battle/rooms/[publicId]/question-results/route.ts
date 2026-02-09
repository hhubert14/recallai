import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { GetQuestionResultsUseCase } from "@/clean-architecture/use-cases/battle/get-question-results.use-case";
import { DrizzleBattleRoomRepository } from "@/clean-architecture/infrastructure/repositories/battle-room.repository.drizzle";
import { DrizzleBattleRoomSlotRepository } from "@/clean-architecture/infrastructure/repositories/battle-room-slot.repository.drizzle";
import { DrizzleBattleGameAnswerRepository } from "@/clean-architecture/infrastructure/repositories/battle-game-answer.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";

/**
 * GET /api/v1/battle/rooms/[publicId]/question-results
 * Get results for the current question (any participant)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const { publicId } = await params;

    const useCase = new GetQuestionResultsUseCase(
      new DrizzleBattleRoomRepository(),
      new DrizzleBattleRoomSlotRepository(),
      new DrizzleBattleGameAnswerRepository(),
      new DrizzleQuestionRepository()
    );

    const result = await useCase.execute({
      userId: user.id,
      roomPublicId: publicId,
    });

    return jsendSuccess({
      questionIndex: result.questionIndex,
      correctOptionId: result.correctOptionId,
      results: result.results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "Battle room not found") {
      return jsendFail({ error: message }, 404);
    }
    if (message === "User is not a participant in this battle") {
      return jsendFail({ error: message }, 403);
    }
    if (
      message === "Battle room is not in game" ||
      message === "No active question"
    ) {
      return jsendFail({ error: message }, 400);
    }

    console.error(
      "GET /api/v1/battle/rooms/[publicId]/question-results error:",
      error
    );
    return jsendError("Internal server error");
  }
}
