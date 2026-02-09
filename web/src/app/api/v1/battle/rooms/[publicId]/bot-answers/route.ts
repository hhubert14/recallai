import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { SimulateBotAnswersUseCase } from "@/clean-architecture/use-cases/battle/simulate-bot-answers.use-case";
import { DrizzleBattleRoomRepository } from "@/clean-architecture/infrastructure/repositories/battle-room.repository.drizzle";
import { DrizzleBattleRoomSlotRepository } from "@/clean-architecture/infrastructure/repositories/battle-room-slot.repository.drizzle";
import { DrizzleBattleGameAnswerRepository } from "@/clean-architecture/infrastructure/repositories/battle-game-answer.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { db } from "@/drizzle";

/**
 * POST /api/v1/battle/rooms/[publicId]/bot-answers
 * Simulate bot answers for the current question (any participant)
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
      const useCase = new SimulateBotAnswersUseCase(
        new DrizzleBattleRoomRepository(tx),
        new DrizzleBattleRoomSlotRepository(tx),
        new DrizzleBattleGameAnswerRepository(tx),
        new DrizzleQuestionRepository(tx)
      );

      return useCase.execute({
        userId: user.id,
        roomPublicId: publicId,
      });
    });

    return jsendSuccess({
      botAnswers: result.botAnswers,
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
      "POST /api/v1/battle/rooms/[publicId]/bot-answers error:",
      error
    );
    return jsendError("Internal server error");
  }
}
