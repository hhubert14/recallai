import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GetQuestionsForReviewUseCase } from "@/clean-architecture/use-cases/progress/get-questions-for-review.use-case";
import { DrizzleProgressRepository } from "@/clean-architecture/infrastructure/repositories/progress.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { StudyMode } from "@/clean-architecture/use-cases/progress/types";

const VALID_MODES: StudyMode[] = ["due", "new", "random"];
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
    const limitParam = searchParams.get("limit");

    if (!VALID_MODES.includes(modeParam as StudyMode)) {
      return jsendFail({
        error: `Invalid mode. Must be one of: ${VALID_MODES.join(", ")}`,
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

    const useCase = new GetQuestionsForReviewUseCase(
      new DrizzleProgressRepository(),
      new DrizzleQuestionRepository()
    );

    const questions = await useCase.execute(
      user.id,
      { mode: modeParam as StudyMode },
      limit
    );

    // Fetch video info for the questions
    const videoIds = [...new Set(questions.map((q) => q.question.videoId))];
    const videoRepo = new DrizzleVideoRepository();
    const videos = await videoRepo.findVideosByIds(videoIds);
    const videoMap = new Map(videos.map((v) => [v.id, { title: v.title, publicId: v.publicId }]));

    // Add video title and publicId to each question
    const questionsWithVideoInfo = questions.map((q) => {
      const videoInfo = videoMap.get(q.question.videoId);
      return {
        ...q,
        question: {
          ...q.question,
          videoTitle: videoInfo?.title || "Unknown Video",
          videoPublicId: videoInfo?.publicId || "",
        },
      };
    });

    return jsendSuccess({ questions: questionsWithVideoInfo });
  } catch (error) {
    return jsendError(String(error));
  }
}
