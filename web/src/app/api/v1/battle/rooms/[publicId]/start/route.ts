import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { StartBattleGameUseCase } from "@/clean-architecture/use-cases/battle/start-battle-game.use-case";
import { DrizzleBattleRoomRepository } from "@/clean-architecture/infrastructure/repositories/battle-room.repository.drizzle";
import { DrizzleBattleRoomSlotRepository } from "@/clean-architecture/infrastructure/repositories/battle-room-slot.repository.drizzle";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { db } from "@/drizzle";

/**
 * POST /api/v1/battle/rooms/[publicId]/start
 * Start a battle game (host only)
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
      const useCase = new StartBattleGameUseCase(
        new DrizzleBattleRoomRepository(tx),
        new DrizzleBattleRoomSlotRepository(tx),
        new DrizzleReviewableItemRepository(tx)
      );

      return useCase.execute({
        userId: user.id,
        roomPublicId: publicId,
      });
    });

    return jsendSuccess({
      room: {
        publicId: result.room.publicId,
        status: result.room.status,
        questionCount: result.room.questionCount,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "Battle room not found") {
      return jsendFail({ error: message }, 404);
    }
    if (message === "Only the host can start the game") {
      return jsendFail({ error: message }, 403);
    }
    if (
      message === "Battle room is not in waiting status" ||
      message === "Not enough questions available"
    ) {
      return jsendFail({ error: message }, 400);
    }

    console.error("POST /api/v1/battle/rooms/[publicId]/start error:", error);
    return jsendError("Internal server error");
  }
}
