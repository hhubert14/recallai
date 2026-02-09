import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { DrizzleBattleRoomRepository } from "@/clean-architecture/infrastructure/repositories/battle-room.repository.drizzle";
import { DrizzleBattleRoomSlotRepository } from "@/clean-architecture/infrastructure/repositories/battle-room-slot.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";

/**
 * GET /api/v1/battle/rooms/[publicId]/current-question
 * Get the current question data (read-only, for late-joiners or missed broadcasts)
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

    const roomRepo = new DrizzleBattleRoomRepository();
    const slotRepo = new DrizzleBattleRoomSlotRepository();
    const questionRepo = new DrizzleQuestionRepository();

    const room = await roomRepo.findBattleRoomByPublicId(publicId);
    if (!room) return jsendFail({ error: "Battle room not found" }, 404);
    if (!room.isInGame())
      return jsendFail({ error: "Battle room is not in game" }, 400);

    const slot = await slotRepo.findSlotByUserId(user.id);
    if (!slot || slot.roomId !== room.id)
      return jsendFail(
        { error: "User is not a participant in this battle" },
        403
      );

    if (
      room.currentQuestionIndex === null ||
      room.currentQuestionStartedAt === null ||
      !room.questionIds
    ) {
      return jsendFail({ error: "No active question" }, 400);
    }

    const questionId = room.questionIds[room.currentQuestionIndex];
    if (questionId === undefined) {
      return jsendFail({ error: "Question not found" }, 400);
    }

    const question = await questionRepo.findQuestionById(questionId);
    if (!question) {
      return jsendFail({ error: "Question not found" }, 400);
    }

    return jsendSuccess({
      questionIndex: room.currentQuestionIndex,
      questionText: question.questionText,
      options: question.options.map((opt) => ({
        id: opt.id,
        optionText: opt.optionText,
      })),
      startedAt: room.currentQuestionStartedAt,
    });
  } catch (error) {
    console.error(
      "GET /api/v1/battle/rooms/[publicId]/current-question error:",
      error
    );
    return jsendError("Internal server error");
  }
}
