import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeVideoId } from "@/lib/youtube";
import { VideoPlayerProvider } from "./_components/VideoPlayerContext";
import { ChatButton } from "./_components/ChatButton";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StudySetContent } from "./_components/StudySetContent";
import type { TermWithMastery } from "./_components/types";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { DrizzleSummaryRepository } from "@/clean-architecture/infrastructure/repositories/summary.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { DrizzleFlashcardRepository } from "@/clean-architecture/infrastructure/repositories/flashcard.repository.drizzle";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { DrizzleReviewProgressRepository } from "@/clean-architecture/infrastructure/repositories/review-progress.repository.drizzle";
import { FindStudySetByPublicIdUseCase } from "@/clean-architecture/use-cases/study-set/find-study-set-by-public-id.use-case";
import { FindSummaryByVideoIdUseCase } from "@/clean-architecture/use-cases/summary/find-summary-by-video-id.use-case";
import { GetStudySetItemsUseCase } from "@/clean-architecture/use-cases/study-set/get-study-set-items.use-case";
import { GetStudySetProgressUseCase } from "@/clean-architecture/use-cases/study-set/get-study-set-progress.use-case";
import { GetReviewStatsUseCase } from "@/clean-architecture/use-cases/review/get-review-stats.use-case";

export const metadata: Metadata = {
  title: "Study Set | Retenio",
  description: "View study set summary and Q&A",
};

interface StudySetDetailPageProps {
  params: Promise<{
    publicId: string;
  }>;
}

export default async function StudySetDetailPage({
  params,
}: StudySetDetailPageProps) {
  const { publicId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const studySet = await new FindStudySetByPublicIdUseCase(
    new DrizzleStudySetRepository()
  ).execute(publicId, user.id);

  if (!studySet) {
    notFound();
  }

  // For video-sourced study sets, fetch video details and related content
  let videoUrl: string | null = null;
  let videoTitle = studySet.name;
  let channelName: string | null = null;
  let youtubeVideoId: string | null = null;

  if (studySet.isVideoSourced() && studySet.videoId) {
    const videoRepository = new DrizzleVideoRepository();
    const video = await videoRepository.findVideoById(studySet.videoId);
    if (video) {
      videoUrl = video.url;
      videoTitle = video.title;
      channelName = video.channelName;
      youtubeVideoId = extractYouTubeVideoId(video.url);
    }
  }

  // Fetch study set items (works for both video-sourced and manual study sets)
  const [summaryEntity, studySetItems] = await Promise.all([
    // Summary only exists for video-sourced study sets
    studySet.videoId
      ? new FindSummaryByVideoIdUseCase(new DrizzleSummaryRepository()).execute(
          studySet.videoId
        )
      : Promise.resolve(null),
    // Items are fetched by study set ID (works for all study sets)
    new GetStudySetItemsUseCase(
      new DrizzleReviewableItemRepository(),
      new DrizzleFlashcardRepository(),
      new DrizzleQuestionRepository()
    ).execute(studySet.id),
  ]);

  // Convert summary entity to plain object for client components
  const summary = summaryEntity
    ? {
        id: summaryEntity.id,
        videoId: summaryEntity.videoId,
        content: summaryEntity.content,
      }
    : null;

  // Fetch progress data for mastery indicators and review stats
  const [progressResult, reviewStats] = await Promise.all([
    new GetStudySetProgressUseCase(
      new DrizzleReviewableItemRepository(),
      new DrizzleReviewProgressRepository()
    ).execute(user.id, studySet.id),
    new GetReviewStatsUseCase(
      new DrizzleReviewableItemRepository(),
      new DrizzleReviewProgressRepository()
    ).execute(user.id, studySet.id),
  ]);

  // Create a map for quick lookup of mastery status
  const masteryMap = new Map(
    progressResult.terms.map((t) => [
      `${t.itemType}-${t.itemId}`,
      t.masteryStatus,
    ])
  );

  // Transform items into unified terms with mastery status (preserves insertion order)
  const terms: TermWithMastery[] = studySetItems.items.map((item) => {
    if (item.itemType === "flashcard") {
      const f = item.flashcard;
      return {
        id: f.id,
        itemType: "flashcard" as const,
        flashcard: { id: f.id, front: f.front, back: f.back },
        masteryStatus:
          masteryMap.get(`flashcard-${f.id}`) ?? ("not_started" as const),
      };
    } else {
      const q = item.question;
      return {
        id: q.id,
        itemType: "question" as const,
        question: {
          id: q.id,
          questionText: q.questionText,
          options: q.options.map((opt) => ({
            id: opt.id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            explanation: opt.explanation,
          })),
        },
        masteryStatus:
          masteryMap.get(`question-${q.id}`) ?? ("not_started" as const),
      };
    }
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* TODO: Re-enable tour after updating targets for new layout */}
      <DashboardHeader />

      <main className="flex-1 container py-6 px-10 md:px-20 lg:px-24 max-w-5xl mx-auto">
        <VideoPlayerProvider>
          <StudySetContent
            title={videoTitle}
            channelName={channelName}
            youtubeVideoId={youtubeVideoId}
            isVideoSourced={studySet.isVideoSourced()}
            summary={summary}
            terms={terms}
            videoId={studySet.videoId}
            studySetId={studySet.id}
            studySetPublicId={studySet.publicId}
            dueCount={reviewStats.dueCount}
          />
        </VideoPlayerProvider>

        {/* Floating Chat Button - only for video-sourced study sets */}
        {studySet.isVideoSourced() && studySet.videoId && (
          <ChatButton videoId={studySet.videoId} />
        )}
      </main>
    </div>
  );
}
