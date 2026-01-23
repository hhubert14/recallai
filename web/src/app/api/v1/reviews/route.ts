import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GetItemsForReviewUseCase } from "@/clean-architecture/use-cases/review/get-items-for-review.use-case";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { DrizzleReviewProgressRepository } from "@/clean-architecture/infrastructure/repositories/review-progress.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { DrizzleFlashcardRepository } from "@/clean-architecture/infrastructure/repositories/flashcard.repository.drizzle";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import {
  StudyMode,
  ItemTypeFilter,
} from "@/clean-architecture/use-cases/review/types";
import { toReviewItemApiResponse } from "@/clean-architecture/use-cases/review/review-item-transformer";

const VALID_MODES: StudyMode[] = ["due", "new", "random"];
const VALID_TYPES: ItemTypeFilter[] = ["all", "question", "flashcard"];
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const modeParam = searchParams.get("mode") || "due";
    const typeParam = searchParams.get("type") || "all";
    const limitParam = searchParams.get("limit");

    if (!VALID_MODES.includes(modeParam as StudyMode)) {
      return jsendFail({
        error: `Invalid mode. Must be one of: ${VALID_MODES.join(", ")}`,
      });
    }

    if (!VALID_TYPES.includes(typeParam as ItemTypeFilter)) {
      return jsendFail({
        error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`,
      });
    }

    let limit = DEFAULT_LIMIT;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return jsendFail({ error: "Limit must be a positive integer" });
      }
      limit = Math.min(parsedLimit, MAX_LIMIT);
    }

    const useCase = new GetItemsForReviewUseCase(
      new DrizzleReviewableItemRepository(),
      new DrizzleReviewProgressRepository(),
      new DrizzleQuestionRepository(),
      new DrizzleFlashcardRepository(),
      new DrizzleVideoRepository()
    );

    const items = await useCase.execute(
      user.id,
      { mode: modeParam as StudyMode, itemType: typeParam as ItemTypeFilter },
      limit
    );

    const response = items.map(toReviewItemApiResponse);

    return jsendSuccess({ items: response });
  } catch (error) {
    return jsendError(String(error));
  }
}
