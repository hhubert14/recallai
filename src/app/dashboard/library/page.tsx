import type { Metadata } from "next";
import { Brain, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@/components/ui/user-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { createClient } from "@/lib/supabase/server";
import { getVideosByUserId } from "@/data-access/videos/get-videos-by-user-id";
import { getUserSubscriptionStatus } from "@/data-access/subscriptions/get-user-subscription-status";
import { UserSubscriptionStatus } from "@/data-access/subscriptions/types";
import { LibraryVideoList } from "@/app/dashboard/library/LibraryVideoList";
import { SubscriptionStatusBadge } from "@/components/subscription/SubscriptionStatusBadge";
import { UpgradeButton } from "@/components/subscription/UpgradeButton";
import { SupportBanner } from "@/components/ui/support-banner";

export const metadata: Metadata = {
    title: "My Library | RecallAI",
    description: "Browse all your saved videos",
};

export default async function LibraryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Redirect to login if user is not authenticated
    if (!user) {
        redirect('/auth/login');
    }

    // Get all user videos and subscription status
    const [allVideos, subscriptionStatus] = await Promise.all([
        getVideosByUserId(user.id),
        getUserSubscriptionStatus(user.id)
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
                            className="text-sm font-medium text-blue-600 dark:text-blue-400"
                        >
                            My Library
                        </Link>
                        <Link
                            href="/dashboard/review"
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                        >
                            Review
                        </Link>
                        <Link
                            href="/dashboard/pricing"
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                        >
                            Premium
                        </Link>
                        {/* <Link
                            href="/dashboard/settings"
                            className="text-sm font-medium hover:text-blue-600"
                        >
                            Settings
                        </Link> */}
                    </nav>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <UserButton />
                    </div>
                </div>
            </header>

            {/* Show support banner only for non-subscribed users */}
            {!subscriptionStatus.isSubscribed && (
                <SupportBanner userId={user.id} />
            )}

            <main className="flex-1 container py-12 px-6 md:px-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-blue-900 dark:text-blue-100 mb-3">
                            My Library
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Browse all your saved videos and track your learning progress.
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <SubscriptionStatusBadge 
                            isSubscribed={subscriptionStatus.isSubscribed}
                            status={subscriptionStatus.status}
                            planType={subscriptionStatus.planType}
                            currentPeriodEnd={subscriptionStatus.currentPeriodEnd}
                        />
                        {!subscriptionStatus.isSubscribed && (
                            <UpgradeButton size="sm" />
                        )}
                    </div>
                </div>

                <LibraryVideoList videos={allVideos} userId={user.id} />
            </main>
        </div>
    );
}
