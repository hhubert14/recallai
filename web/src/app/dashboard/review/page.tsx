import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GetQuestionsForReviewUseCase } from "@/clean-architecture/use-cases/progress/get-questions-for-review.use-case";
import { GetProgressStatsUseCase } from "@/clean-architecture/use-cases/progress/get-progress-stats.use-case";
import { DrizzleProgressRepository } from "@/clean-architecture/infrastructure/repositories/progress.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { ReviewInterface } from "@/app/dashboard/review/ReviewInterface";
import { BackButton } from "./BackButton";

export const metadata: Metadata = {
    title: "Review | RecallAI",
    description: "Review your questions with spaced repetition",
};

export default async function ReviewPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Redirect to login if user is not authenticated
    if (!user) {
        redirect("/auth/login");
    }

    const progressRepo = new DrizzleProgressRepository();
    const questionRepo = new DrizzleQuestionRepository();

    const getStatsUseCase = new GetProgressStatsUseCase(progressRepo);
    const getQuestionsUseCase = new GetQuestionsForReviewUseCase(progressRepo, questionRepo);

    const [reviewStats, questionsForReview] = await Promise.all([
        getStatsUseCase.execute(user.id),
        getQuestionsUseCase.execute(user.id),
    ]);

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
            <main className="flex-1 container py-4 px-6 md:px-8 max-w-7xl mx-auto">
                <div className="mb-6">
                    <BackButton />
                    <div className="mt-2">
                        <h1 className="text-4xl font-bold tracking-tight text-blue-900 dark:text-blue-100 mb-3">
                            Review Questions
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                            Use spaced repetition to reinforce your learning and
                            improve retention.
                        </p>
                    </div>
                </div>{" "}
                <ReviewInterface
                    reviewStats={reviewStats}
                    questionsForReview={questionsForReview}
                />
            </main>
        </div>
    );
}
