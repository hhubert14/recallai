import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brain, User, Chrome, Database } from "lucide-react";
import { UserButton } from "@/components/ui/user-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { RegenerateTokenButton } from "./RegenerateTokenButton";
import { createClient } from "@/lib/supabase/server";
import { getUserStatsByUserId } from "@/data-access/user-stats/get-user-stats-by-user-id";

export const metadata: Metadata = {
    title: "Settings | RecallAI",
    description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Redirect to login if user is not authenticated
    if (!user) {
        redirect("/auth/login");
    }
    const [userStats] =
        await Promise.all([
            getUserStatsByUserId(user.id),
        ]);

    // Format join date
    const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
                <div className="container flex h-16 items-center justify-between px-6 md:px-8">
                    <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            RecallAI
                        </span>
                    </div>
                    <nav className="hidden md:flex gap-6">
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600"
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
                    </nav>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <UserButton />
                    </div>
                </div>
            </header>

            <main className="flex-1 container py-4 px-6 md:px-8 max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-4xl font-bold tracking-tight text-blue-900 dark:text-blue-100 mb-3">
                        Settings
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Account Section */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm bg-white dark:bg-gray-800">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="h-5 w-5 text-blue-600" />
                            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                                Account
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Email Address
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100 mt-1">
                                        {user.email}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Member Since
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100 mt-1">
                                        {joinDate}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Chrome Extension Section */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm bg-white dark:bg-gray-800">
                        <div className="flex items-center gap-3 mb-6">
                            <Chrome className="h-5 w-5 text-blue-600" />
                            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                                Chrome Extension
                            </h2>
                        </div>{" "}
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Generate a new connection token for your Chrome
                                extension. This will allow the extension to
                                securely communicate with your account.
                            </p>
                            <RegenerateTokenButton />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                If you`&apos;`re having connection issues with the
                                extension, generate a new token to refresh the
                                connection.
                            </p>
                        </div>
                    </div>
                    {/* Data Management Section */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm bg-white dark:bg-gray-800">
                        <div className="flex items-center gap-3 mb-6">
                            <Database className="h-5 w-5 text-blue-600" />
                            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                                Data Management
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                        {userStats.totalVideos}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Total Videos
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                        {userStats.totalQuestionsAnswered}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Questions Answered
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                        {userStats.quizAccuracy > 0
                                            ? `${userStats.quizAccuracy}%`
                                            : "—"}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Quiz Accuracy
                                    </p>
                                </div>{" "}
                            </div>
                        </div>{" "}
                    </div>
                    {/* Help & Support Section */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm bg-white dark:bg-gray-800">
                        <div className="flex items-center gap-3 mb-6">
                            <svg
                                className="h-5 w-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                                Help & Support
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-600 dark:text-gray-400">
                                Need help? Have a question, found a bug, or want
                                to request a feature? Get in touch with our
                                support team.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <a
                                    href="mailto:hubert@recallai.io"
                                    className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                    <svg
                                        className="h-5 w-5 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-blue-900 dark:text-blue-100">
                                            Email Support
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            hubert@recallai.io
                                        </p>
                                    </div>
                                </a>
                                <a
                                    href="mailto:hubert@recallai.io?subject=Feature Request"
                                    className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                >
                                    <svg
                                        className="h-5 w-5 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                        />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-green-900 dark:text-green-100">
                                            Feature Request
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Share your ideas
                                        </p>
                                    </div>
                                </a>
                                <a
                                    href="mailto:hubert@recallai.io?subject=Bug Report"
                                    className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                >
                                    <svg
                                        className="h-5 w-5 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                        />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-red-900 dark:text-red-100">
                                            Report Bug
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Found an issue?
                                        </p>
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
