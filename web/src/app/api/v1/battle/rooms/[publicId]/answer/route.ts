import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { SubmitBattleAnswerUseCase } from "@/clean-architecture/use-cases/battle/submit-battle-answer.use-case";
import { DrizzleBattleRoomRepository } from "@/clean-architecture/infrastructure/repositories/battle-room.repository.drizzle";
import { DrizzleBattleRoomSlotRepository } from "@/clean-architecture/infrastructure/repositories/battle-room-slot.repository.drizzle";
import { DrizzleBattleGameAnswerRepository } from "@/clean-architecture/infrastructure/repositories/battle-game-answer.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { db } from "@/drizzle";

/**
 * POST /api/v1/battle/rooms/[publicId]/answer
 * Submit an answer to the current question
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

    const { publicId } = await params;
    const body = await request.json().catch(() => ({}));
    const { selectedOptionId } = body;

    if (typeof selectedOptionId !== "number") {
      return jsendFail({ error: "selectedOptionId is required" }, 400);
    }

    const result = await db.transaction(async (tx) => {
      const useCase = new SubmitBattleAnswerUseCase(
        new DrizzleBattleRoomRepository(tx),
        new DrizzleBattleRoomSlotRepository(tx),
        new DrizzleBattleGameAnswerRepository(tx),
        new DrizzleQuestionRepository(tx)
      );

      return useCase.execute({
        userId: user.id,
        roomPublicId: publicId,
        selectedOptionId,
      });
    });

    return jsendSuccess({
      isCorrect: result.isCorrect,
      score: result.score,
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
      message === "No active question" ||
      message === "Invalid option" ||
      message === "Already answered this question"
    ) {
      return jsendFail({ error: message }, 400);
    }

    console.error("POST /api/v1/battle/rooms/[publicId]/answer error:", error);
    return jsendError("Internal server error");
  }
}
