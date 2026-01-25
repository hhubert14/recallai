import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeVideoId } from "@/lib/youtube";
import { VideoPlayer } from "./VideoPlayer";
import { ContentTabs } from "./ContentTabs";
import { VideoPlayerProvider } from "./VideoPlayerContext";
import { ChatButton } from "./ChatButton";
import { StudySetDetailTour } from "./StudySetDetailTour";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { DrizzleSummaryRepository } from "@/clean-architecture/infrastructure/repositories/summary.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { DrizzleFlashcardRepository } from "@/clean-architecture/infrastructure/repositories/flashcard.repository.drizzle";
import { FindStudySetByPublicIdUseCase } from "@/clean-architecture/use-cases/study-set/find-study-set-by-public-id.use-case";
import { FindSummaryByVideoIdUseCase } from "@/clean-architecture/use-cases/summary/find-summary-by-video-id.use-case";
import { FindQuestionsByVideoIdUseCase } from "@/clean-architecture/use-cases/question/find-questions-by-video-id.use-case";
import { FindFlashcardsByVideoIdUseCase } from "@/clean-architecture/use-cases/flashcard/find-flashcards-by-video-id.use-case";

export const metadata: Metadata = {
    title: "Study Set | RecallAI",
    description: "View study set summary and Q&A",
};

interface StudySetDetailPageProps {
    params: Promise<{
        publicId: string;
    }>;
}

export default async function StudySetDetailPage({
    params,
}: StudySetDetailPageProps) {
    const { publicId } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const studySet = await new FindStudySetByPublicIdUseCase(
        new DrizzleStudySetRepository()
    ).execute(publicId, user.id);

    if (!studySet) {
        notFound();
    }

    // For video-sourced study sets, fetch video details and related content
    let videoUrl: string | null = null;
    let videoTitle = studySet.name;
    let channelName: string | null = null;
    let youtubeVideoId: string | null = null;

    if (studySet.isVideoSourced() && studySet.videoId) {
        const videoRepository = new DrizzleVideoRepository();
        const video = await videoRepository.findVideoById(studySet.videoId);
        if (video) {
            videoUrl = video.url;
            videoTitle = video.title;
            channelName = video.channelName;
            youtubeVideoId = extractYouTubeVideoId(video.url);
        }
    }

    // Fetch content by videoId (for video-sourced study sets)
    const [summaryEntity, questionEntities, flashcardEntities] = await Promise.all([
        studySet.videoId
            ? new FindSummaryByVideoIdUseCase(new DrizzleSummaryRepository()).execute(studySet.videoId)
            : Promise.resolve(null),
        studySet.videoId
            ? new FindQuestionsByVideoIdUseCase(new DrizzleQuestionRepository()).execute(studySet.videoId)
            : Promise.resolve([]),
        studySet.videoId
            ? new FindFlashcardsByVideoIdUseCase(new DrizzleFlashcardRepository()).execute(studySet.videoId)
            : Promise.resolve([]),
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

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <StudySetDetailTour />
            <DashboardHeader />

            <main className="flex-1 container py-4 px-6 md:px-8 max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground mb-3 mt-2">
                        {videoTitle}
                    </h1>
                    {channelName && (
                        <p className="text-lg text-muted-foreground">
                            by {channelName}
                        </p>
                    )}
                </div>{" "}
                <VideoPlayerProvider>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[calc(100vh-200px)]">
                        {/* Video Player - Left Side on Desktop, Top on Mobile */}
                        {studySet.isVideoSourced() && youtubeVideoId && (
                            <div className="bg-black rounded-xl overflow-hidden aspect-video lg:aspect-auto shadow-lg">
                                <VideoPlayer
                                    videoId={youtubeVideoId}
                                    title={videoTitle}
                                />
                            </div>
                        )}

                        {/* Content Tabs - Right Side on Desktop, Bottom on Mobile */}
                        <div className={`flex flex-col min-h-[500px] lg:min-h-0 ${!studySet.isVideoSourced() || !youtubeVideoId ? 'lg:col-span-2' : ''}`}>
                            <ContentTabs
                                summary={summary}
                                questions={questions}
                                flashcards={flashcards}
                                videoId={studySet.videoId}
                                studySetId={studySet.id}
                            />
                        </div>
                    </div>
                </VideoPlayerProvider>

                {/* Floating Chat Button - only for video-sourced study sets */}
                {studySet.isVideoSourced() && studySet.videoId && (
                    <ChatButton videoId={studySet.videoId} />
                )}
            </main>
        </div>
    );
}
