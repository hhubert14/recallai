import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, User, CreditCard, Chrome, Database, Trash2, RefreshCw } from "lucide-react";
import { UserButton } from "@/components/ui/user-button";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscriptionStatus } from "@/data-access/subscriptions/get-user-subscription-status";
import { getUserStatsByUserId } from "@/data-access/user-stats/get-user-stats-by-user-id";
import { getVideosThisMonthByUserId } from "@/data-access/user-stats/get-videos-this-month-by-user-id";
import { SubscriptionStatusBadge } from "@/components/subscription/SubscriptionStatusBadge";
import { UpgradeButton } from "@/components/subscription/UpgradeButton";

export const metadata: Metadata = {
    title: "Settings | LearnSync",
    description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }    const [subscriptionStatus, userStats, videosThisMonth] = await Promise.all([
        getUserSubscriptionStatus(user.id),
        getUserStatsByUserId(user.id),
        getVideosThisMonthByUserId(user.id)
    ]);    // Calculate usage percentage for free users
    const monthlyLimit = subscriptionStatus.isSubscribed ? null : 5;
    const usagePercentage = monthlyLimit ? Math.min(videosThisMonth / monthlyLimit * 100, 100) : 0;

    // Format join date
    const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

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
                            className="text-sm font-medium text-blue-600"
                        >
                            Settings
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <UserButton />
                    </div>
                </div>
            </header>

            <main className="flex-1 container py-12 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-blue-900 mb-2">
                        Settings
                    </h1>
                    <p className="text-gray-500">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Account Section */}
                    <div className="rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <User className="h-5 w-5 text-blue-600" />
                            <h2 className="text-xl font-semibold text-blue-900">Account</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                                    <p className="text-gray-900 mt-1">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Member Since</label>
                                    <p className="text-gray-900 mt-1">{joinDate}</p>
                                </div>
                            </div>
                            <div className="pt-2">
                                <label className="text-sm font-medium text-gray-700 block mb-2">Current Plan</label>
                                <SubscriptionStatusBadge 
                                    isSubscribed={subscriptionStatus.isSubscribed}
                                    status={subscriptionStatus.status}
                                    planType={subscriptionStatus.planType}
                                    currentPeriodEnd={subscriptionStatus.currentPeriodEnd}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Subscription Section */}
                    <div className="rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            <h2 className="text-xl font-semibold text-blue-900">Subscription & Usage</h2>
                        </div>
                        <div className="space-y-4">
                            {!subscriptionStatus.isSubscribed ? (
                                <div>
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">Monthly Videos</span>                                            <span className="text-sm text-gray-500">
                                                {videosThisMonth} / {monthlyLimit} used
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                                style={{ width: `${usagePercentage}%` }}
                                            ></div>
                                        </div>
                                        {usagePercentage >= 80 && (
                                            <p className="text-sm text-amber-600 mt-2">
                                                You're approaching your monthly limit. Consider upgrading for unlimited access.
                                            </p>
                                        )}
                                    </div>
                                    <UpgradeButton />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Videos This Month</label>
                                            <p className="text-2xl font-bold text-blue-900">{videosThisMonth}</p>
                                            <p className="text-sm text-gray-500">Unlimited</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Total Videos</label>
                                            <p className="text-2xl font-bold text-blue-900">{userStats.totalVideos}</p>
                                            <p className="text-sm text-gray-500">All time</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-fit">
                                        Manage Billing
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chrome Extension Section */}
                    <div className="rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Chrome className="h-5 w-5 text-blue-600" />
                            <h2 className="text-xl font-semibold text-blue-900">Chrome Extension</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Connection Status</p>
                                    <p className="text-sm text-gray-500">
                                        The extension connects to your account to process videos
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-green-600">Connected</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-fit flex items-center gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Regenerate Token
                            </Button>
                            <p className="text-sm text-gray-500">
                                If you're having connection issues, try regenerating your connection token.
                            </p>
                        </div>
                    </div>

                    {/* Data Management Section */}
                    <div className="rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="h-5 w-5 text-blue-600" />
                            <h2 className="text-xl font-semibold text-blue-900">Data Management</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-900">{userStats.totalVideos}</p>
                                    <p className="text-sm text-gray-600">Total Videos</p>
                                </div>
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-900">{userStats.totalQuestionsAnswered}</p>
                                    <p className="text-sm text-gray-600">Questions Answered</p>
                                </div>
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-900">
                                        {userStats.quizAccuracy > 0 ? `${userStats.quizAccuracy}%` : "—"}
                                    </p>
                                    <p className="text-sm text-gray-600">Quiz Accuracy</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Delete All Data</p>
                                        <p className="text-sm text-gray-500">
                                            Permanently delete all your videos, summaries, and progress data
                                        </p>
                                    </div>
                                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2">
                                        <Trash2 className="h-4 w-4" />
                                        Delete Data
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
