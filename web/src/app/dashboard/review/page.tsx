import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GetStudyModeStatsUseCase } from "@/clean-architecture/use-cases/progress/get-study-mode-stats.use-case";
import { GetProgressStatsUseCase } from "@/clean-architecture/use-cases/progress/get-progress-stats.use-case";
import { DrizzleProgressRepository } from "@/clean-architecture/infrastructure/repositories/progress.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { ReviewInterface } from "@/app/dashboard/review/ReviewInterface";
import { DashboardHeader } from "@/app/dashboard/components/DashboardHeader";

export const metadata: Metadata = {
    title: "Review | RecallAI",
    description: "Review your questions with spaced repetition",
};

export default async function ReviewPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const progressRepo = new DrizzleProgressRepository();
    const questionRepo = new DrizzleQuestionRepository();

    const getStudyModeStatsUseCase = new GetStudyModeStatsUseCase(progressRepo, questionRepo);
    const getProgressStatsUseCase = new GetProgressStatsUseCase(progressRepo);

    const [studyModeStats, progressStatsRaw] = await Promise.all([
        getStudyModeStatsUseCase.execute(user.id),
        getProgressStatsUseCase.execute(user.id),
    ]);

    // Transform progress stats for the UI
    const progressStats = {
        mastered: progressStatsRaw.questionsInBox5,
        inProgress:
            progressStatsRaw.questionsInBox1 +
            progressStatsRaw.questionsInBox2 +
            progressStatsRaw.questionsInBox3 +
            progressStatsRaw.questionsInBox4,
        dueToday: progressStatsRaw.questionsDueToday,
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
