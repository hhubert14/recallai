import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { UpdateBattleRoomSlotUseCase } from "@/clean-architecture/use-cases/battle/update-battle-room-slot.use-case";
import { KickPlayerUseCase } from "@/clean-architecture/use-cases/battle/kick-player.use-case";
import { DrizzleBattleRoomRepository } from "@/clean-architecture/infrastructure/repositories/battle-room.repository.drizzle";
import { DrizzleBattleRoomSlotRepository } from "@/clean-architecture/infrastructure/repositories/battle-room-slot.repository.drizzle";

/**
 * PATCH /api/v1/battle/rooms/[publicId]/slots/[slotIndex]
 * Update a slot or kick a player
 *
 * Body for update: { action: "update", slotType: "bot" | "empty" | "locked" }
 * Body for kick:   { action: "kick" }
 */
export async function PATCH(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ publicId: string; slotIndex: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const { publicId, slotIndex: slotIndexStr } = await params;
    const slotIndex = parseInt(slotIndexStr, 10);

    if (isNaN(slotIndex)) {
      return jsendFail({ error: "Invalid slot index" }, 400);
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return jsendFail({ error: "Invalid JSON body" }, 400);
    }
    const { action } = body;

    if (action === "kick") {
      const useCase = new KickPlayerUseCase(
        new DrizzleBattleRoomRepository(),
        new DrizzleBattleRoomSlotRepository()
      );

      const slot = await useCase.execute({
        userId: user.id,
        roomPublicId: publicId,
        slotIndex,
      });

      return jsendSuccess({
        slot: {
          slotIndex: slot.slotIndex,
          slotType: slot.slotType,
          userId: slot.userId,
          botName: slot.botName,
        },
      });
    }

    if (action === "update") {
      const { slotType } = body;

      if (!slotType || !["empty", "bot", "locked"].includes(slotType)) {
        return jsendFail(
          { error: "slotType must be 'empty', 'bot', or 'locked'" },
          400
        );
      }

      const useCase = new UpdateBattleRoomSlotUseCase(
        new DrizzleBattleRoomRepository(),
        new DrizzleBattleRoomSlotRepository()
      );

      const slot = await useCase.execute({
        userId: user.id,
        roomPublicId: publicId,
        slotIndex,
        slotType,
      });

      return jsendSuccess({
        slot: {
          slotIndex: slot.slotIndex,
          slotType: slot.slotType,
          userId: slot.userId,
          botName: slot.botName,
        },
      });
    }

    return jsendFail({ error: "action must be 'update' or 'kick'" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "Battle room not found") {
      return jsendFail({ error: message }, 404);
    }
    if (
      message === "Only the host can modify slots" ||
      message === "Only the host can kick players"
    ) {
      return jsendFail({ error: message }, 403);
    }
    if (
      message === "Battle room is not in waiting status" ||
      message === "Invalid slot index" ||
      message === "Cannot modify the host slot" ||
      message === "Cannot modify a slot occupied by a player" ||
      message === "Cannot kick yourself" ||
      message === "Slot does not contain a player"
    ) {
      return jsendFail({ error: message }, 400);
    }

    console.error("PATCH /api/v1/battle/rooms/[publicId]/slots/[slotIndex] error:", error);
    return jsendError("Internal server error");
  }
}
