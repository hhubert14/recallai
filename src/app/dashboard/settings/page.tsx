import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, User, CreditCard, Chrome, Database, Clock } from "lucide-react";
import { UserButton } from "@/components/ui/user-button";
import { RegenerateTokenButton } from "./RegenerateTokenButton";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscriptionStatus } from "@/data-access/subscriptions/get-user-subscription-status";
import { getUserStatsByUserId } from "@/data-access/user-stats/get-user-stats-by-user-id";
import { getVideosThisMonthByUserId } from "@/data-access/user-stats/get-videos-this-month-by-user-id";
import { SubscriptionStatusBadge } from "@/components/subscription/SubscriptionStatusBadge";
import { UpgradeButton } from "@/components/subscription/UpgradeButton";
import { ManageBillingButton } from "@/components/subscription/ManageBillingButton";
import { getUserVideoExpiryStats } from "@/data-access/user-stats/get-user-video-expiry-stats";

export const metadata: Metadata = {
    title: "Settings | RecallAI",
    description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }    const [subscriptionStatus, userStats, videosThisMonth, videoExpiryStats] = await Promise.all([
        getUserSubscriptionStatus(user.id),
        getUserStatsByUserId(user.id),
        getVideosThisMonthByUserId(user.id),
        getUserVideoExpiryStats(user.id)
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
                        <span className="text-xl font-bold">RecallAI</span>
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
                            Premium
                        </Link>
                        {/* <Link
                            href="/dashboard/settings"
                            className="text-sm font-medium text-blue-600"
                        >
                            Settings
                        </Link> */}
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
                                            <span className="text-sm font-medium text-gray-700">Current Videos</span>                                            <span className="text-sm text-gray-500">
                                                {videosThisMonth} / {monthlyLimit} active
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
                                                You're approaching your storage limit. Consider upgrading for unlimited access.
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-2">
                                            Videos automatically expire after 7 days. You can have up to 5 videos stored at a time.
                                        </p>
                                    </div>
                                    <UpgradeButton />
                                </div>
                            ) : (
                                <div className="space-y-3">                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Current Videos</label>
                                            <p className="text-2xl font-bold text-blue-900">{videosThisMonth}</p>
                                            <p className="text-sm text-gray-500">Unlimited storage</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Total Videos</label>
                                            <p className="text-2xl font-bold text-blue-900">{userStats.totalVideos}</p>
                                            <p className="text-sm text-gray-500">All time</p>
                                        </div>                                    </div>
                                    <ManageBillingButton userId={user.id} className="w-fit" />
                                </div>
                            )}
                        </div>
                    </div>                    {/* Chrome Extension Section */}
                    <div className="rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Chrome className="h-5 w-5 text-blue-600" />
                            <h2 className="text-xl font-semibold text-blue-900">Chrome Extension</h2>
                        </div>                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">
                                Generate a new connection token for your Chrome extension. This will allow the extension to securely communicate with your account.
                            </p>
                            <RegenerateTokenButton />
                            <p className="text-sm text-gray-500">
                                If you're having connection issues with the extension, generate a new token to refresh the connection.
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
                                </div>                            </div>
                        </div>                    </div>

                    {/* Video Expiry Section */}
                    <div className="rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <h2 className="text-xl font-semibold text-blue-900">Video Storage</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <p className="text-2xl font-bold text-green-900">{videoExpiryStats.permanentVideos}</p>
                                    <p className="text-sm text-gray-600">Permanent Videos</p>
                                    <p className="text-xs text-green-600">Never expire</p>
                                </div>
                                <div className="text-center p-4 bg-orange-50 rounded-lg">
                                    <p className="text-2xl font-bold text-orange-900">{videoExpiryStats.expiringVideos}</p>
                                    <p className="text-sm text-gray-600">Expiring Videos</p>
                                    <p className="text-xs text-orange-600">Will be deleted</p>
                                </div>
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <p className="text-2xl font-bold text-red-900">{videoExpiryStats.expiringSoon}</p>
                                    <p className="text-sm text-gray-600">Expiring Soon</p>
                                    <p className="text-xs text-red-600">Within 3 days</p>
                                </div>
                            </div>
                            
                            {videoExpiryStats.nextExpiring && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <h3 className="font-medium text-yellow-900 mb-2">Next Video Expiring</h3>
                                    <p className="text-sm text-gray-700">
                                        <strong>{videoExpiryStats.nextExpiring.title}</strong> will expire on{' '}
                                        {new Date(videoExpiryStats.nextExpiring.expiry_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                            
                            {!subscriptionStatus.isSubscribed && videoExpiryStats.expiringVideos > 0 && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h3 className="font-medium text-blue-900 mb-2">Upgrade to Keep Your Videos</h3>
                                    <p className="text-sm text-gray-700 mb-3">
                                        Premium members keep their videos permanently. Upgrade now to prevent losing your content.
                                    </p>
                                    <UpgradeButton size="sm" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Help & Support Section */}
                    <div className="rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-xl font-semibold text-blue-900">Help & Support</h2>
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                Need help? Have a question or found a bug? Get in touch with our support team.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <a
                                    href="mailto:hubert@recallai.io"
                                    className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-blue-900">Email Support</p>
                                        <p className="text-sm text-gray-600">hubert@recallai.io</p>
                                    </div>
                                </a>
                                <a
                                    href="mailto:hubert@recallai.io?subject=Bug Report"
                                    className="flex items-center gap-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-red-900">Report Bug</p>
                                        <p className="text-sm text-gray-600">Found an issue?</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
