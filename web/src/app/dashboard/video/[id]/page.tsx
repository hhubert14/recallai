import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Brain } from "lucide-react";
import { UserButton } from "@/components/ui/user-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeVideoId } from "@/lib/youtube";
import { VideoPlayer } from "./VideoPlayer";
import { ContentTabs } from "./ContentTabs";
import { BackButton } from "./BackButton";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { DrizzleSummaryRepository } from "@/clean-architecture/infrastructure/repositories/summary.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { FindVideoByIdUseCase } from "@/clean-architecture/use-cases/video/find-video-by-id.use-case";
import { FindSummaryByVideoIdUseCase } from "@/clean-architecture/use-cases/summary/find-summary-by-video-id.use-case";
import { FindQuestionsByVideoIdUseCase } from "@/clean-architecture/use-cases/question/find-questions-by-video-id.use-case";

export const metadata: Metadata = {
    title: "Video Detail | RecallAI",
    description: "View video summary and Q&A",
};

interface VideoDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function VideoDetailPage({
    params,
}: VideoDetailPageProps) {
    const { id } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const video = await new FindVideoByIdUseCase(new DrizzleVideoRepository()).execute(parseInt(id), user.id);

    if (!video) {
        notFound();
    }

    const [summaryEntity, questionEntities] = await Promise.all([
        new FindSummaryByVideoIdUseCase(new DrizzleSummaryRepository()).execute(video.id),
        new FindQuestionsByVideoIdUseCase(new DrizzleQuestionRepository()).execute(video.id),
    ]);

    // Convert entities to plain objects for client components
    const summary = summaryEntity ? {
        id: summaryEntity.id,
        videoId: summaryEntity.videoId,
        content: summaryEntity.content,
    } : null;

    const questions = questionEntities.map(q => ({
        id: q.id,
        videoId: q.videoId,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options.map(opt => ({
            id: opt.id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            orderIndex: opt.orderIndex,
            explanation: opt.explanation,
        })),
    }));

    const youtubeVideoId = extractYouTubeVideoId(video.url);

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
                <div className="container flex h-16 items-center justify-between px-6 md:px-8">
                    <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            RecallAI
                        </span>
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
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
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
                    <BackButton />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 mt-2">
                        {video.title}
                    </h1>
                    {video.channelName && (
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            by {video.channelName}
                        </p>
                    )}
                </div>{" "}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[calc(100vh-200px)]">
                    {/* Video Player - Left Side on Desktop, Top on Mobile */}
                    <div className="bg-black rounded-xl overflow-hidden aspect-video lg:aspect-auto shadow-lg">
                        <VideoPlayer
                            videoId={youtubeVideoId}
                            title={video.title}
                        />
                    </div>

                    {/* Content Tabs - Right Side on Desktop, Bottom on Mobile */}
                    <div className="flex flex-col min-h-[500px] lg:min-h-0">
                        <ContentTabs
                            summary={summary}
                            questions={questions}
                            // userId={user.id}
                            videoId={video.id}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
