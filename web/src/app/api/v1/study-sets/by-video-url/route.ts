import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { FindStudySetByVideoUrlUseCase } from "@/clean-architecture/use-cases/study-set/find-study-set-by-video-url.use-case";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { DrizzleSummaryRepository } from "@/clean-architecture/infrastructure/repositories/summary.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { DrizzleFlashcardRepository } from "@/clean-architecture/infrastructure/repositories/flashcard.repository.drizzle";

/**
 * GET /api/v1/study-sets/by-video-url?url=<encoded-url>
 *
 * Fetches all study set content for a video by its URL.
 * Used by the Chrome extension side panel to display content.
 *
 * Response:
 * - exists: false if video hasn't been processed
 * - exists: true with all content if video exists
 */
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const url = request.nextUrl.searchParams.get("url");
    if (!url) {
      return jsendFail({ error: "Missing url query parameter" }, 400);
    }

    const useCase = new FindStudySetByVideoUrlUseCase(
      new DrizzleVideoRepository(),
      new DrizzleStudySetRepository(),
      new DrizzleSummaryRepository(),
      new DrizzleQuestionRepository(),
      new DrizzleFlashcardRepository()
    );

    const result = await useCase.execute(user.id, url);

    if (!result.exists) {
      return jsendSuccess({
        exists: false,
        studySet: null,
        video: null,
        summary: null,
        questions: [],
        flashcards: [],
      });
    }

    return jsendSuccess({
      exists: true,
      studySet: result.studySet
        ? {
            id: result.studySet.id,
            publicId: result.studySet.publicId,
            name: result.studySet.name,
          }
        : null,
      video: result.video
        ? {
            id: result.video.id,
            title: result.video.title,
            channelName: result.video.channelName,
          }
        : null,
      summary: result.summary
        ? {
            id: result.summary.id,
            content: result.summary.content,
          }
        : null,
      questions: result.questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        options: q.options.map((o) => ({
          id: o.id,
          optionText: o.optionText,
          isCorrect: o.isCorrect,
          explanation: o.explanation,
        })),
      })),
      flashcards: result.flashcards.map((f) => ({
        id: f.id,
        front: f.front,
        back: f.back,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsendError(message);
  }
}
