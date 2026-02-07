import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { GetBattleRoomUseCase } from "@/clean-architecture/use-cases/battle/get-battle-room.use-case";
import { DrizzleBattleRoomRepository } from "@/clean-architecture/infrastructure/repositories/battle-room.repository.drizzle";
import { DrizzleBattleRoomSlotRepository } from "@/clean-architecture/infrastructure/repositories/battle-room-slot.repository.drizzle";

/**
 * GET /api/v1/battle/rooms/[publicId]
 * Get a battle room with its slots
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

    const useCase = new GetBattleRoomUseCase(
      new DrizzleBattleRoomRepository(),
      new DrizzleBattleRoomSlotRepository()
    );

    const { room, slots } = await useCase.execute(publicId);

    return jsendSuccess({
      room: {
        publicId: room.publicId,
        hostUserId: room.hostUserId,
        name: room.name,
        visibility: room.visibility,
        status: room.status,
        timeLimitSeconds: room.timeLimitSeconds,
        questionCount: room.questionCount,
        createdAt: room.createdAt,
      },
      slots: slots.map((s) => ({
        slotIndex: s.slotIndex,
        slotType: s.slotType,
        userId: s.userId,
        botName: s.botName,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "Battle room not found") {
      return jsendFail({ error: message }, 404);
    }

    return jsendError(message);
  }
}
