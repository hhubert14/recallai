import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { LeaveBattleRoomUseCase } from "@/clean-architecture/use-cases/battle/leave-battle-room.use-case";
import { DrizzleBattleRoomRepository } from "@/clean-architecture/infrastructure/repositories/battle-room.repository.drizzle";
import { DrizzleBattleRoomSlotRepository } from "@/clean-architecture/infrastructure/repositories/battle-room-slot.repository.drizzle";
import { db } from "@/drizzle";

/**
 * POST /api/v1/battle/rooms/[publicId]/leave
 * Leave a battle room
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

    await db.transaction(async (tx) => {
      const useCase = new LeaveBattleRoomUseCase(
        new DrizzleBattleRoomRepository(tx),
        new DrizzleBattleRoomSlotRepository(tx)
      );

      await useCase.execute({
        userId: user.id,
        roomPublicId: publicId,
      });
    });

    return jsendSuccess({ message: "Left the battle room" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "Battle room not found") {
      return jsendFail({ error: message }, 404);
    }
    if (message === "User is not in this battle room") {
      return jsendFail({ error: message }, 400);
    }

    console.error("POST /api/v1/battle/rooms/[publicId]/leave error:", error);
    return jsendError("Internal server error");
  }
}
