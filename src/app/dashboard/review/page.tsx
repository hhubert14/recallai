import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscriptionStatus } from "@/data-access/subscriptions/get-user-subscription-status";
import { getQuestionsDueForReview } from "@/data-access/user-question-progress/get-questions-due-for-review";
import { getQuestionsForInitialReview } from "@/data-access/user-question-progress/get-questions-for-initial-review";
import { getReviewStats } from "@/data-access/user-question-progress/get-review-stats";
import { ReviewInterface } from "@/app/dashboard/review/ReviewInterface";
import { UpgradePrompt } from "@/app/dashboard/review/UpgradePrompt";
import { Brain } from "lucide-react";
import Link from "next/link";
import { UserButton } from "@/components/ui/user-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
    title: "Review | RecallAI",
    description: "Review your questions with spaced repetition",
};

export default async function ReviewPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const subscriptionStatus = await getUserSubscriptionStatus(user.id);

    // Only allow premium users to access review
    if (!subscriptionStatus.isSubscribed) {
        return <UpgradePrompt />;
    }    const [reviewStats, dueQuestions, initialQuestions] = await Promise.all([
        getReviewStats(user.id),
        getQuestionsDueForReview(user.id),
        getQuestionsForInitialReview(user.id, 5)
    ]);

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
                <div className="container flex h-16 items-center justify-between px-6 md:px-8">
                    <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">RecallAI</span>
                    </div>
                    <nav className="hidden md:flex gap-6">
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/dashboard/library"
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                        >
                            My Library
                        </Link>
                        <Link
                            href="/dashboard/review"
                            className="text-sm font-medium text-blue-600 dark:text-blue-400"
                        >
                            Review
                        </Link>
                        <Link
                            href="/dashboard/pricing"
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                        >
                            Premium
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <UserButton />
                    </div>
                </div>
            </header>

            <main className="flex-1 container py-4 px-6 md:px-8 max-w-7xl mx-auto">
                <div className="mb-6">
                    <BackButton />
                    <div className="mt-2">
                        <h1 className="text-4xl font-bold tracking-tight text-blue-900 dark:text-blue-100 mb-3">
                            Review Questions
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                            Use spaced repetition to reinforce your learning and improve retention.
                        </p>
                    </div>
                </div>                <ReviewInterface 
                    userId={user.id}
                    reviewStats={reviewStats}
                    dueQuestions={dueQuestions}
                    initialQuestions={initialQuestions}
                />
            </main>
        </div>
    );
}
