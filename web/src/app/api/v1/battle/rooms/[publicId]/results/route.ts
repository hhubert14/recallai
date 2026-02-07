import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { GetBattleResultsUseCase } from "@/clean-architecture/use-cases/battle/get-battle-results.use-case";
import { DrizzleBattleRoomRepository } from "@/clean-architecture/infrastructure/repositories/battle-room.repository.drizzle";
import { DrizzleBattleRoomSlotRepository } from "@/clean-architecture/infrastructure/repositories/battle-room-slot.repository.drizzle";
import { DrizzleBattleGameAnswerRepository } from "@/clean-architecture/infrastructure/repositories/battle-game-answer.repository.drizzle";
import { db } from "@/drizzle";

/**
 * GET /api/v1/battle/rooms/[publicId]/results
 * Get battle game results
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

    const useCase = new GetBattleResultsUseCase(
      new DrizzleBattleRoomRepository(db),
      new DrizzleBattleRoomSlotRepository(db),
      new DrizzleBattleGameAnswerRepository(db)
    );

    const result = await useCase.execute({ roomPublicId: publicId });

    return jsendSuccess({
      room: {
        publicId: result.room.publicId,
        name: result.room.name,
        status: result.room.status,
        questionCount: result.room.questionCount,
        timeLimitSeconds: result.room.timeLimitSeconds,
      },
      results: result.results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "Battle room not found") {
      return jsendFail({ error: message }, 404);
    }
    if (message === "Game has not finished yet") {
      return jsendFail({ error: message }, 400);
    }

    console.error("GET /api/v1/battle/rooms/[publicId]/results error:", error);
    return jsendError("Internal server error");
  }
}
