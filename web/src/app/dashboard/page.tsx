import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DrizzleAnswerRepository } from "@/clean-architecture/infrastructure/repositories/answer.repository.drizzle";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { DrizzleReviewProgressRepository } from "@/clean-architecture/infrastructure/repositories/review-progress.repository.drizzle";
import { FindVideosByUserIdUseCase } from "@/clean-architecture/use-cases/video/find-videos-by-user-id.use-case";
import { OnboardingSurveyWrapper } from "./OnboardingSurvey/OnboardingSurveyWrapper";
import { WelcomeModalWrapper } from "./WelcomeModal/WelcomeModalWrapper";
import { GetUserStatsUseCase } from "@/clean-architecture/use-cases/user-stats/get-user-stats.use-case";
import { GetReviewStatsUseCase } from "@/clean-architecture/use-cases/review/get-review-stats.use-case";
import { ReviewHeroCard } from "./ReviewHeroCard";
import { QuickStatsRow } from "./QuickStatsRow";
import { WhatsNewCard } from "./WhatsNewCard";
import { RecentVideosCard } from "./RecentVideosCard";
import { DashboardTour } from "./DashboardTour";

export const metadata: Metadata = {
  title: "Dashboard | RecallAI",
  description: "Your RecallAI dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [videos, userStats, reviewStats] = await Promise.all([
    new FindVideosByUserIdUseCase(new DrizzleVideoRepository()).execute(
      user.id,
      4
    ),
    new GetUserStatsUseCase(
      new DrizzleVideoRepository(),
      new DrizzleAnswerRepository()
    ).execute(user.id),
    new GetReviewStatsUseCase(
      new DrizzleReviewableItemRepository(),
      new DrizzleReviewProgressRepository()
    ).execute(user.id),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <WelcomeModalWrapper />
      <OnboardingSurveyWrapper />
      <DashboardTour />
      <DashboardHeader />

      <main className="flex-1 container py-8 md:py-12 px-6 md:px-8 max-w-6xl mx-auto">
        <div className="space-y-8">
          {/* Review Hero Card */}
          <ReviewHeroCard itemsDue={reviewStats.dueCount} />

          {/* Quick Stats Row */}
          <QuickStatsRow
            totalVideos={userStats.totalVideos}
            itemsMastered={reviewStats.boxDistribution[4] ?? 0}
            quizAccuracy={userStats.quizAccuracy}
          />

          {/* What's New + Recent Videos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* What's New Card */}
            <div className="lg:col-span-1">
              <WhatsNewCard />
            </div>

            {/* Recent Videos */}
            <RecentVideosCard
              videos={videos.map((v) => ({
                id: v.id,
                publicId: v.publicId,
                title: v.title,
                channelName: v.channelName,
              }))}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
