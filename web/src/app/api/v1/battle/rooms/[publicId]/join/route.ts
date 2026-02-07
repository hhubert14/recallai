import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { JoinBattleRoomUseCase } from "@/clean-architecture/use-cases/battle/join-battle-room.use-case";
import { DrizzleBattleRoomRepository } from "@/clean-architecture/infrastructure/repositories/battle-room.repository.drizzle";
import { DrizzleBattleRoomSlotRepository } from "@/clean-architecture/infrastructure/repositories/battle-room-slot.repository.drizzle";
import { db } from "@/drizzle";

/**
 * POST /api/v1/battle/rooms/[publicId]/join
 * Join a battle room
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
    const { password } = body;

    const slot = await db.transaction(async (tx) => {
      const useCase = new JoinBattleRoomUseCase(
        new DrizzleBattleRoomRepository(tx),
        new DrizzleBattleRoomSlotRepository(tx)
      );

      return useCase.execute({
        userId: user.id,
        roomPublicId: publicId,
        password,
      });
    });

    return jsendSuccess({
      slot: {
        slotIndex: slot.slotIndex,
        slotType: slot.slotType,
        userId: slot.userId,
        botName: slot.botName,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "Battle room not found") {
      return jsendFail({ error: message }, 404);
    }
    if (
      message === "Incorrect password" ||
      message === "Battle room is not accepting players"
    ) {
      return jsendFail({ error: message }, 403);
    }
    if (message === "User is already in a battle room") {
      return jsendFail({ error: message }, 409);
    }
    if (message === "Battle room is full") {
      return jsendFail({ error: message }, 400);
    }

    return jsendError(message);
  }
}
