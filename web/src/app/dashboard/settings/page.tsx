import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { User, Chrome, Database, HelpCircle, Mail, Lightbulb, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { GetUserStatsUseCase } from "@/clean-architecture/use-cases/user-stats/get-user-stats.use-case";
import { DrizzleAnswerRepository } from "@/clean-architecture/infrastructure/repositories/answer.repository.drizzle";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { DashboardHeader } from "@/components/DashboardHeader";

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
    const [userStats] = await Promise.all([
        new GetUserStatsUseCase(new DrizzleVideoRepository(), new DrizzleAnswerRepository()).execute(user.id),
    ]);

    // Format join date
    const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <DashboardHeader />

            <main className="flex-1 container py-4 px-6 md:px-8 max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
                        Settings
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Account Section */}
                    <div
                        className="opacity-0 rounded-xl border border-border p-8 shadow-sm bg-card animate-fade-up transition-all duration-300 hover:shadow-md dark:hover:shadow-none dark:hover:border-foreground/20"
                        style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-xl font-semibold text-foreground">
                                Account
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Email Address
                                    </label>
                                    <p className="text-foreground mt-1">
                                        {user.email}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Member Since
                                    </label>
                                    <p className="text-foreground mt-1">
                                        {joinDate}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Chrome Extension Section */}
                    <div
                        className="opacity-0 rounded-xl border border-border p-8 shadow-sm bg-card animate-fade-up transition-all duration-300 hover:shadow-md dark:hover:shadow-none dark:hover:border-foreground/20"
                        style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Chrome className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-xl font-semibold text-foreground">
                                Chrome Extension
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <p className="text-muted-foreground">
                                Install the RecallAI Chrome extension to automatically process educational YouTube videos. Once installed, simply sign in to RecallAI in your browser, and the extension will automatically connect.
                            </p>
                            <a
                                href="https://chrome.google.com/webstore"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <Chrome className="h-4 w-4" />
                                Install Chrome Extension
                            </a>
                            <p className="text-sm text-muted-foreground">
                                After installing, sign in to RecallAI and the extension will automatically work with your account. No manual token configuration needed!
                            </p>
                        </div>
                    </div>
                    {/* Data Management Section */}
                    <div
                        className="opacity-0 rounded-xl border border-border p-8 shadow-sm bg-card animate-fade-up transition-all duration-300 hover:shadow-md dark:hover:shadow-none dark:hover:border-foreground/20"
                        style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Database className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-xl font-semibold text-foreground">
                                Data Management
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                        {userStats.totalVideos}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Total Videos
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                        {userStats.totalQuestionsAnswered}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Questions Answered
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                        {userStats.quizAccuracy > 0
                                            ? `${userStats.quizAccuracy}%`
                                            : "—"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Quiz Accuracy
                                    </p>
                                </div>{" "}
                            </div>
                        </div>{" "}
                    </div>
                    {/* Help & Support Section */}
                    <div
                        className="opacity-0 rounded-xl border border-border p-8 shadow-sm bg-card animate-fade-up transition-all duration-300 hover:shadow-md dark:hover:shadow-none dark:hover:border-foreground/20"
                        style={{ animationDelay: "400ms", animationFillMode: "forwards" }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <HelpCircle className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-xl font-semibold text-foreground">
                                Help & Support
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <p className="text-muted-foreground">
                                Need help? Have a question, found a bug, or want
                                to request a feature? Get in touch with our
                                support team.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <a
                                    href="mailto:hubert@recallai.io"
                                    className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
                                >
                                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <p className="font-medium text-blue-900 dark:text-blue-100">
                                            Email Support
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            hubert@recallai.io
                                        </p>
                                    </div>
                                </a>
                                <a
                                    href="mailto:hubert@recallai.io?subject=Feature Request"
                                    className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
                                >
                                    <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    <div>
                                        <p className="font-medium text-green-900 dark:text-green-100">
                                            Feature Request
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Share your ideas
                                        </p>
                                    </div>
                                </a>
                                <a
                                    href="mailto:hubert@recallai.io?subject=Bug Report"
                                    className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
                                >
                                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    <div>
                                        <p className="font-medium text-red-900 dark:text-red-100">
                                            Report Bug
                                        </p>
                                        <p className="text-sm text-muted-foreground">
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
