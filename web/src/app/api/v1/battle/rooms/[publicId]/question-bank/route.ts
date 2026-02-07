import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { GetBattleRoomUseCase } from "@/clean-architecture/use-cases/battle/get-battle-room.use-case";
import { GetStudySetItemsUseCase } from "@/clean-architecture/use-cases/study-set/get-study-set-items.use-case";
import { DrizzleBattleRoomRepository } from "@/clean-architecture/infrastructure/repositories/battle-room.repository.drizzle";
import { DrizzleBattleRoomSlotRepository } from "@/clean-architecture/infrastructure/repositories/battle-room-slot.repository.drizzle";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { DrizzleFlashcardRepository } from "@/clean-architecture/infrastructure/repositories/flashcard.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";

/**
 * GET /api/v1/battle/rooms/[publicId]/question-bank
 * Returns question texts (no answers) for the room's study set
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

    const getRoomUseCase = new GetBattleRoomUseCase(
      new DrizzleBattleRoomRepository(),
      new DrizzleBattleRoomSlotRepository()
    );

    const { room, slots } = await getRoomUseCase.execute(publicId);

    const isMember =
      room.hostUserId === user.id ||
      slots.some((s) => s.slotType === "player" && s.userId === user.id);

    if (!isMember) {
      return jsendFail({ error: "Forbidden" }, 403);
    }

    const getItemsUseCase = new GetStudySetItemsUseCase(
      new DrizzleReviewableItemRepository(),
      new DrizzleFlashcardRepository(),
      new DrizzleQuestionRepository()
    );

    const { items } = await getItemsUseCase.execute(room.studySetId);

    const questions = items
      .filter((item) => item.itemType === "question")
      .map((item) => ({
        questionText: item.question.questionText,
        options: item.question.options.map((o) => o.optionText),
      }));

    return jsendSuccess({ questions });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "Battle room not found") {
      return jsendFail({ error: message }, 404);
    }

    console.error(
      "GET /api/v1/battle/rooms/[publicId]/question-bank error:",
      error
    );
    return jsendError("Internal server error");
  }
}
