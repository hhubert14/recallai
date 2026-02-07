import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { FinishBattleGameUseCase } from "@/clean-architecture/use-cases/battle/finish-battle-game.use-case";
import { DrizzleBattleRoomRepository } from "@/clean-architecture/infrastructure/repositories/battle-room.repository.drizzle";
import { db } from "@/drizzle";

/**
 * POST /api/v1/battle/rooms/[publicId]/finish
 * Finish a battle game (host only)
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

    const room = await db.transaction(async (tx) => {
      const useCase = new FinishBattleGameUseCase(
        new DrizzleBattleRoomRepository(tx)
      );

      return useCase.execute({
        userId: user.id,
        roomPublicId: publicId,
      });
    });

    return jsendSuccess({
      room: {
        publicId: room.publicId,
        status: room.status,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "Battle room not found") {
      return jsendFail({ error: message }, 404);
    }
    if (message === "Only the host can finish the game") {
      return jsendFail({ error: message }, 403);
    }
    if (message === "Battle room is not in game") {
      return jsendFail({ error: message }, 400);
    }

    console.error("POST /api/v1/battle/rooms/[publicId]/finish error:", error);
    return jsendError("Internal server error");
  }
}
