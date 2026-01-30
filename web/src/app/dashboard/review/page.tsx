import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GetReviewStatsUseCase } from "@/clean-architecture/use-cases/review/get-review-stats.use-case";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { DrizzleReviewProgressRepository } from "@/clean-architecture/infrastructure/repositories/review-progress.repository.drizzle";
import { ReviewInterface } from "@/app/dashboard/review/ReviewInterface";
import { DashboardHeader } from "@/components/DashboardHeader";

export const metadata: Metadata = {
  title: "Review | Retenio",
  description: "Review your questions and flashcards with spaced repetition",
};

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const getReviewStatsUseCase = new GetReviewStatsUseCase(
    new DrizzleReviewableItemRepository(),
    new DrizzleReviewProgressRepository()
  );

  const stats = await getReviewStatsUseCase.execute(user.id);

  // Transform stats for the UI
  const studyModeStats = {
    dueCount: stats.dueCount,
    newCount: stats.newCount,
    totalCount: stats.totalCount,
  };

  const progressStats = {
    mastered: stats.boxDistribution[4], // box 5
    inProgress:
      stats.boxDistribution[0] +
      stats.boxDistribution[1] +
      stats.boxDistribution[2] +
      stats.boxDistribution[3], // boxes 1-4
    dueToday: stats.dueCount,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />

      <main className="flex-1 container py-8 px-6 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Review
          </h1>
          <p className="text-muted-foreground">
            Strengthen your memory with spaced repetition
          </p>
        </div>

        <ReviewInterface
          studyModeStats={studyModeStats}
          progressStats={progressStats}
        />
      </main>
    </div>
  );
}
