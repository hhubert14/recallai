import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { AdvanceQuestionUseCase } from "@/clean-architecture/use-cases/battle/advance-question.use-case";
import { DrizzleBattleRoomRepository } from "@/clean-architecture/infrastructure/repositories/battle-room.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { db } from "@/drizzle";

/**
 * POST /api/v1/battle/rooms/[publicId]/advance
 * Advance to the next question (host only)
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

    const { publicId } = await params;

    const result = await db.transaction(async (tx) => {
      const useCase = new AdvanceQuestionUseCase(
        new DrizzleBattleRoomRepository(tx),
        new DrizzleQuestionRepository(tx)
      );

      return useCase.execute({
        userId: user.id,
        roomPublicId: publicId,
      });
    });

    return jsendSuccess({
      questionIndex: result.questionIndex,
      questionId: result.questionId,
      questionText: result.questionText,
      options: result.options,
      currentQuestionStartedAt: result.currentQuestionStartedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "Battle room not found") {
      return jsendFail({ error: message }, 404);
    }
    if (message === "Only the host can advance questions") {
      return jsendFail({ error: message }, 403);
    }
    if (
      message === "Battle room is not in game" ||
      message === "No more questions"
    ) {
      return jsendFail({ error: message }, 400);
    }

    console.error("POST /api/v1/battle/rooms/[publicId]/advance error:", error);
    return jsendError("Internal server error");
  }
}
