import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeVideoId } from "@/lib/youtube";
import { VideoPlayer } from "./VideoPlayer";
import { ContentTabs } from "./ContentTabs";
import { VideoPlayerProvider } from "./VideoPlayerContext";
import { ChatButton } from "./ChatButton";
import { DashboardHeader } from "@/app/dashboard/components/DashboardHeader";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { DrizzleSummaryRepository } from "@/clean-architecture/infrastructure/repositories/summary.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { DrizzleFlashcardRepository } from "@/clean-architecture/infrastructure/repositories/flashcard.repository.drizzle";
import { FindVideoByPublicIdUseCase } from "@/clean-architecture/use-cases/video/find-video-by-public-id.use-case";
import { FindSummaryByVideoIdUseCase } from "@/clean-architecture/use-cases/summary/find-summary-by-video-id.use-case";
import { FindQuestionsByVideoIdUseCase } from "@/clean-architecture/use-cases/question/find-questions-by-video-id.use-case";
import { FindFlashcardsByVideoIdUseCase } from "@/clean-architecture/use-cases/flashcard/find-flashcards-by-video-id.use-case";

export const metadata: Metadata = {
    title: "Video Detail | RecallAI",
    description: "View video summary and Q&A",
};

interface VideoDetailPageProps {
    params: Promise<{
        publicId: string;
    }>;
}

export default async function VideoDetailPage({
    params,
}: VideoDetailPageProps) {
    const { publicId } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const video = await new FindVideoByPublicIdUseCase(
        new DrizzleVideoRepository()
    ).execute(publicId, user.id);

    if (!video) {
        notFound();
    }

    const [summaryEntity, questionEntities, flashcardEntities] = await Promise.all([
        new FindSummaryByVideoIdUseCase(new DrizzleSummaryRepository()).execute(video.id),
        new FindQuestionsByVideoIdUseCase(new DrizzleQuestionRepository()).execute(video.id),
        new FindFlashcardsByVideoIdUseCase(new DrizzleFlashcardRepository()).execute(video.id),
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
        sourceTimestamp: q.sourceTimestamp,
        options: q.options.map(opt => ({
            id: opt.id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            explanation: opt.explanation,
        })),
    }));

    const flashcards = flashcardEntities.map(f => ({
        id: f.id,
        videoId: f.videoId,
        front: f.front,
        back: f.back,
    }));

    const youtubeVideoId = extractYouTubeVideoId(video.url);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <DashboardHeader />

            <main className="flex-1 container py-4 px-6 md:px-8 max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground mb-3 mt-2">
                        {video.title}
                    </h1>
                    {video.channelName && (
                        <p className="text-lg text-muted-foreground">
                            by {video.channelName}
                        </p>
                    )}
                </div>{" "}
                <VideoPlayerProvider>
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
                                flashcards={flashcards}
                                videoId={video.id}
                            />
                        </div>
                    </div>
                </VideoPlayerProvider>

                {/* Floating Chat Button */}
                <ChatButton videoId={video.id} />
            </main>
        </div>
    );
}
