import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DrizzleAnswerRepository } from "@/clean-architecture/infrastructure/repositories/answer.repository.drizzle";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { DrizzleReviewProgressRepository } from "@/clean-architecture/infrastructure/repositories/review-progress.repository.drizzle";
import { FindStudySetsByUserIdUseCase } from "@/clean-architecture/use-cases/study-set/find-study-sets-by-user-id.use-case";
import { OnboardingSurveyWrapper } from "./_components/OnboardingSurvey/OnboardingSurveyWrapper";
import { WelcomeModalWrapper } from "./_components/WelcomeModal/WelcomeModalWrapper";
import { GetUserStatsUseCase } from "@/clean-architecture/use-cases/user-stats/get-user-stats.use-case";
import { GetReviewStatsUseCase } from "@/clean-architecture/use-cases/review/get-review-stats.use-case";
import { ReviewHeroCard } from "./_components/ReviewHeroCard";
import { QuickStatsRow } from "./_components/QuickStatsRow";
import { WhatsNewCard } from "./_components/WhatsNewCard";
import { RecentStudySetsCard } from "./_components/RecentStudySetsCard";
import { DashboardTour } from "./_components/DashboardTour";

export const metadata: Metadata = {
  title: "Dashboard | Retenio",
  description: "Your Retenio dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [allStudySets, userStats, reviewStats] = await Promise.all([
    new FindStudySetsByUserIdUseCase(new DrizzleStudySetRepository()).execute(
      user.id
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

          {/* Quick Stats Row - commented out until stats are meaningful */}
          {/* <QuickStatsRow
            totalVideos={userStats.totalVideos}
            itemsMastered={reviewStats.boxDistribution[4] ?? 0}
            quizAccuracy={userStats.quizAccuracy}
          /> */}

          {/* What's New + Recent Study Sets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* What's New Card */}
            <div className="lg:col-span-1">
              <WhatsNewCard />
            </div>

            {/* Recent Study Sets */}
            <RecentStudySetsCard
              studySets={allStudySets.slice(0, 4).map((s) => ({
                id: s.id,
                publicId: s.publicId,
                name: s.name,
                description: s.description,
                sourceType: s.sourceType,
              }))}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
