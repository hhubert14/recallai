import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, Play, Chrome } from "lucide-react";
import { UserButton } from "@/components/ui/user-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
    title: "Dashboard | RecallAI",
    description: "Your RecallAI dashboard",
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
        <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
                <div className="container flex h-16 items-center justify-between px-6 md:px-8">
                    <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">RecallAI</span>
                    </div>                    <nav className="hidden md:flex gap-6">
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-blue-600"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/dashboard/library"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600"
                        >
                            My Library
                        </Link>
                        <Link
                            href="/dashboard/review"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600"
                        >
                            Review
                        </Link>
                        <Link
                            href="/dashboard/pricing"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600"
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

            <main className="flex-1 container py-12 px-6 md:px-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-blue-900 dark:text-blue-100 mb-3">
                            Welcome to your Dashboard
                        </h1>
                        {/* <p className="text-lg text-gray-600">
                            This is a placeholder dashboard. You've successfully signed
                            in with Supabase authentication.
                        </p> */}
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

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-blue-200 dark:border-blue-800 p-6 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Getting Started
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Get started in 3 simple steps
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-100 dark:border-blue-800 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Install Extension</h3>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    Add our Chrome extension to capture videos
                                </p>
                                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                                    <Chrome className="h-4 w-4 mr-2" />
                                    Download Extension
                                </Button>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-100 dark:border-blue-800 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Connect Account</h3>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    Link extension to dashboard for sync
                                </p>
                                <ExtensionConnectorButton />
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-100 dark:border-blue-800 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Start Learning</h3>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    Watch videos and get summaries & quizzes
                                </p>
                                <Button size="sm" variant="outline" className="w-full border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                                    <Play className="h-4 w-4 mr-2" />
                                    View Tutorial
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-blue-200 dark:border-blue-800 p-6 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                                <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Recent Videos
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Your latest learning content
                                </p>
                            </div>
                        </div>
                        
                        {recentVideos.length > 0 ? (
                            <div className="space-y-2">
                                {recentVideos.map((video) => (
                                    <Link 
                                        key={video.id} 
                                        href={`/dashboard/video/${video.id}`}
                                        className="block bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-100 dark:border-gray-600 shadow-sm hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate text-gray-900 dark:text-white text-sm mb-1">
                                                    {video.title}
                                                </h3>
                                                {video.channel_name && (
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                        {video.channel_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-100 dark:border-gray-600 shadow-sm text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    No videos yet. Install the extension and start watching to build your library.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-blue-200 dark:border-blue-800 p-6 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Stats</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Track your learning progress
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
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
