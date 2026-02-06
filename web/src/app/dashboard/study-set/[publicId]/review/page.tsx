import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GetReviewStatsUseCase } from "@/clean-architecture/use-cases/review/get-review-stats.use-case";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { DrizzleReviewProgressRepository } from "@/clean-architecture/infrastructure/repositories/review-progress.repository.drizzle";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { FindStudySetByPublicIdUseCase } from "@/clean-architecture/use-cases/study-set/find-study-set-by-public-id.use-case";
import { ReviewInterface } from "@/app/dashboard/review/_components/ReviewInterface";
import { DashboardHeader } from "@/components/DashboardHeader";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Review Study Set | Retenio",
  description: "Review questions and flashcards from this study set",
};

interface StudySetReviewPageProps {
  params: Promise<{
    publicId: string;
  }>;
}

export default async function StudySetReviewPage({
  params,
}: StudySetReviewPageProps) {
  const { publicId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Find the study set
  const studySetRepository = new DrizzleStudySetRepository();
  const findStudySetUseCase = new FindStudySetByPublicIdUseCase(
    studySetRepository
  );
  const studySet = await findStudySetUseCase.execute(publicId, user.id);

  if (!studySet) {
    notFound();
  }

  // Get stats scoped to this study set
  const getReviewStatsUseCase = new GetReviewStatsUseCase(
    new DrizzleReviewableItemRepository(),
    new DrizzleReviewProgressRepository()
  );

  const stats = await getReviewStatsUseCase.execute(user.id, studySet.id);

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
        {/* Back link */}
        <Link
          href={`/dashboard/study-set/${publicId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to {studySet.name}
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Review: {studySet.name}
          </h1>
          <p className="text-muted-foreground">
            Strengthen your memory with spaced repetition
          </p>
        </div>

        <ReviewInterface
          studyModeStats={studyModeStats}
          progressStats={progressStats}
          studySetPublicId={publicId}
        />
      </main>
    </div>
  );
}
