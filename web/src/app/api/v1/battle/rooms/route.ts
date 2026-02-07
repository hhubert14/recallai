import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { CreateBattleRoomUseCase } from "@/clean-architecture/use-cases/battle/create-battle-room.use-case";
import { ListBattleRoomsUseCase } from "@/clean-architecture/use-cases/battle/list-battle-rooms.use-case";
import { DrizzleBattleRoomRepository } from "@/clean-architecture/infrastructure/repositories/battle-room.repository.drizzle";
import { DrizzleBattleRoomSlotRepository } from "@/clean-architecture/infrastructure/repositories/battle-room-slot.repository.drizzle";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { db } from "@/drizzle";

/**
 * POST /api/v1/battle/rooms
 * Create a new battle room
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return jsendFail({ error: "Invalid JSON body" }, 400);
    }
    const {
      studySetPublicId,
      name,
      visibility,
      password,
      timeLimitSeconds,
      questionCount,
    } = body;

    if (!studySetPublicId || typeof studySetPublicId !== "string") {
      return jsendFail({ error: "Study set public ID is required" }, 400);
    }

    if (!name || typeof name !== "string") {
      return jsendFail({ error: "Room name is required" }, 400);
    }

    if (!visibility || !["public", "private"].includes(visibility)) {
      return jsendFail({ error: "Visibility must be 'public' or 'private'" }, 400);
    }

    const { room, slots } = await db.transaction(async (tx) => {
      const useCase = new CreateBattleRoomUseCase(
        new DrizzleBattleRoomRepository(tx),
        new DrizzleBattleRoomSlotRepository(tx),
        new DrizzleStudySetRepository(tx),
        new DrizzleReviewableItemRepository(tx)
      );

      return useCase.execute({
        userId: user.id,
        studySetPublicId,
        name,
        visibility,
        password,
        timeLimitSeconds,
        questionCount,
      });
    });

    return jsendSuccess(
      {
        room: {
          publicId: room.publicId,
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
      },
      201
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "Study set not found") {
      return jsendFail({ error: message }, 404);
    }
    if (
      message === "Not authorized to use this study set"
    ) {
      return jsendFail({ error: message }, 403);
    }
    if (message === "User is already in a battle room") {
      return jsendFail({ error: message }, 409);
    }
    if (
      message === "Room name is required" ||
      message === "Invalid time limit" ||
      message === "Invalid question count" ||
      message === "Password is required for private rooms" ||
      message === "Study set does not have enough questions"
    ) {
      return jsendFail({ error: message }, 400);
    }

    console.error("POST /api/v1/battle/rooms error:", error);
    return jsendError("Internal server error");
  }
}

/**
 * GET /api/v1/battle/rooms
 * List all waiting battle rooms
 */
export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const useCase = new ListBattleRoomsUseCase(
      new DrizzleBattleRoomRepository(),
      new DrizzleBattleRoomSlotRepository()
    );

    const rooms = await useCase.execute();

    return jsendSuccess({
      rooms: rooms.map(({ room, slotSummary }) => ({
        publicId: room.publicId,
        name: room.name,
        visibility: room.visibility,
        status: room.status,
        timeLimitSeconds: room.timeLimitSeconds,
        questionCount: room.questionCount,
        createdAt: room.createdAt,
        slotSummary,
      })),
    });
  } catch (error) {
    console.error("GET /api/v1/battle/rooms error:", error);
    return jsendError("Internal server error");
  }
}
