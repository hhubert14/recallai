import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, Play } from "lucide-react";
import { UserButton } from "@/components/ui/user-button";
import { ExtensionConnectorButton } from "@/app/dashboard/ExtensionConnectorButton";
import { createClient } from "@/lib/supabase/server";
import { getVideosByUserId } from "@/data-access/videos/get-videos-by-user-id";
import { getUserStatsByUserId } from "@/data-access/user-stats/get-user-stats-by-user-id";
import { getUserSubscriptionStatus } from "@/data-access/subscriptions/get-user-subscription-status";
import { UserSubscriptionStatus } from "@/data-access/subscriptions/types";
import { VideoDto } from "@/data-access/videos/types";
import { StatsCard } from "@/components/ui/stats-card";
import { SubscriptionStatusBadge } from "@/components/subscription/SubscriptionStatusBadge";
import { UpgradeButton } from "@/components/subscription/UpgradeButton";

export const metadata: Metadata = {
    title: "Dashboard | LearnSync",
    description: "Your LearnSync dashboard",
};

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let recentVideos: VideoDto[] = [];
    let userStats = {
        totalVideos: 0,
        totalQuestionsAnswered: 0,
        quizAccuracy: 0,
        videosThisWeek: 0,
        questionsThisWeek: 0
    };
    let subscriptionStatus: UserSubscriptionStatus = { isSubscribed: false };

    if (user) {
        const [videos, stats, subscription] = await Promise.all([
            getVideosByUserId(user.id, 5), // Get latest 5 videos
            getUserStatsByUserId(user.id),
            getUserSubscriptionStatus(user.id)
        ]);
        recentVideos = videos;
        userStats = stats;
        subscriptionStatus = subscription;
    }
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-blue-600" />
                        <span className="text-xl font-bold">LearnSync</span>
                    </div>
                    <nav className="hidden md:flex gap-6">
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium hover:text-blue-600"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/dashboard/library"
                            className="text-sm font-medium hover:text-blue-600"
                        >
                            My Library
                        </Link>
                        <Link
                            href="/dashboard/pricing"
                            className="text-sm font-medium hover:text-blue-600"
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/dashboard/settings"
                            className="text-sm font-medium hover:text-blue-600"
                        >
                            Settings
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <UserButton />
                    </div>
                </div>
            </header>

            <main className="flex-1 container py-12">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-blue-900 mb-2">
                            Welcome to your Dashboard
                        </h1>
                        <p className="text-gray-500">
                            This is a placeholder dashboard. You've successfully signed
                            in with Supabase authentication.
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

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">
                            Getting Started
                        </h2>
                        <p className="text-gray-500 mb-4">
                            Install the Chrome extension to start capturing
                            video summaries.
                        </p>
                        <div className="flex gap-3 flex-wrap">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                Download Extension
                            </Button>
                            <ExtensionConnectorButton />
                        </div>
                    </div>

                    <div className="rounded-lg border p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">
                            Recent Videos
                        </h2>
                        {recentVideos.length > 0 ? (
                            <div className="space-y-3">
                                {recentVideos.map((video) => (
                                    <Link 
                                        key={video.id} 
                                        href={`/dashboard/video/${video.id}`}
                                        className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                <Play className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium truncate text-gray-900">
                                                    {video.title}
                                                </h3>
                                                {video.channel_name && (
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {video.channel_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">
                                You don't have any videos yet. Watch educational
                                videos with the extension installed to create
                                summaries.
                            </p>
                        )}
                    </div>

                    <div className="rounded-lg border p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Your Stats</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <StatsCard
                                title="Total Videos"
                                value={userStats.totalVideos}
                                iconName="BookOpen"
                                subtitle="In your library"
                            />
                            <StatsCard
                                title="Questions Answered"
                                value={userStats.totalQuestionsAnswered}
                                iconName="HelpCircle"
                                subtitle="Across all videos"
                            />
                            <StatsCard
                                title="Quiz Accuracy"
                                value={userStats.quizAccuracy > 0 ? `${userStats.quizAccuracy}%` : "No data"}
                                iconName="Target"
                                subtitle="Overall performance"
                            />
                            <StatsCard
                                title="This Week"
                                value={`${userStats.videosThisWeek + userStats.questionsThisWeek}`}
                                iconName="Calendar"
                                subtitle={`${userStats.videosThisWeek} videos, ${userStats.questionsThisWeek} questions`}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
