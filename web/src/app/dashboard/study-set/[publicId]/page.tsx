import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeVideoId } from "@/lib/youtube";
import { VideoPlayerProvider } from "./VideoPlayerContext";
import { ChatButton } from "./ChatButton";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StudySetContent } from "./StudySetContent";
import type { TermWithMastery } from "./types";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { DrizzleSummaryRepository } from "@/clean-architecture/infrastructure/repositories/summary.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { DrizzleFlashcardRepository } from "@/clean-architecture/infrastructure/repositories/flashcard.repository.drizzle";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { DrizzleReviewProgressRepository } from "@/clean-architecture/infrastructure/repositories/review-progress.repository.drizzle";
import { FindStudySetByPublicIdUseCase } from "@/clean-architecture/use-cases/study-set/find-study-set-by-public-id.use-case";
import { FindSummaryByVideoIdUseCase } from "@/clean-architecture/use-cases/summary/find-summary-by-video-id.use-case";
import { FindQuestionsByVideoIdUseCase } from "@/clean-architecture/use-cases/question/find-questions-by-video-id.use-case";
import { FindFlashcardsByVideoIdUseCase } from "@/clean-architecture/use-cases/flashcard/find-flashcards-by-video-id.use-case";
import { GetStudySetProgressUseCase } from "@/clean-architecture/use-cases/study-set/get-study-set-progress.use-case";

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

    // Fetch progress data for mastery indicators
    const progressResult = await new GetStudySetProgressUseCase(
        new DrizzleReviewableItemRepository(),
        new DrizzleReviewProgressRepository()
    ).execute(user.id, studySet.id);

    // Create a map for quick lookup of mastery status
    const masteryMap = new Map(
        progressResult.terms.map((t) => [`${t.itemType}-${t.itemId}`, t.masteryStatus])
    );

    // Transform questions and flashcards into unified terms with mastery status
    const terms: TermWithMastery[] = [
        ...flashcards.map((f) => ({
            id: f.id,
            itemType: "flashcard" as const,
            flashcard: { id: f.id, front: f.front, back: f.back },
            masteryStatus: masteryMap.get(`flashcard-${f.id}`) ?? "not_started" as const,
        })),
        ...questions.map((q) => ({
            id: q.id,
            itemType: "question" as const,
            question: {
                id: q.id,
                questionText: q.questionText,
                options: q.options,
                sourceTimestamp: q.sourceTimestamp,
            },
            masteryStatus: masteryMap.get(`question-${q.id}`) ?? "not_started" as const,
        })),
    ];

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* TODO: Re-enable tour after updating targets for new layout */}
            <DashboardHeader />

            <main className="flex-1 container py-6 px-6 md:px-12 lg:px-16 max-w-5xl mx-auto">
                <VideoPlayerProvider>
                    <StudySetContent
                        title={videoTitle}
                        channelName={channelName}
                        youtubeVideoId={youtubeVideoId}
                        isVideoSourced={studySet.isVideoSourced()}
                        summary={summary}
                        terms={terms}
                        videoId={studySet.videoId}
                        studySetId={studySet.id}
                        studySetPublicId={studySet.publicId}
                    />
                </VideoPlayerProvider>

                {/* Floating Chat Button - only for video-sourced study sets */}
                {studySet.isVideoSourced() && studySet.videoId && (
                    <ChatButton videoId={studySet.videoId} />
                )}
            </main>
        </div>
    );
}
