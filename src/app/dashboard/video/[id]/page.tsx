import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Brain } from "lucide-react";
import { UserButton } from "@/components/ui/user-button";
import { createClient } from "@/lib/supabase/server";
import { getVideosByUserId } from "@/data-access/videos/get-videos-by-user-id";
import { getSummaryByVideoId } from "@/data-access/summaries/get-summary-by-video-id";
import { getQuestionsByVideoId } from "@/data-access/questions/get-questions-by-video-id";
import { VideoPlayer } from "./VideoPlayer";
import { ContentTabs } from "./ContentTabs";
import { BackButton } from "./BackButton";

export const metadata: Metadata = {
    title: "Video Detail | RecallAI",
    description: "View video summary and Q&A",
};

interface VideoDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function VideoDetailPage({ params }: VideoDetailPageProps) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        notFound();
    }    // Get all user videos to find the specific one
    const userVideos = await getVideosByUserId(user.id);
    const video = userVideos.find(v => v.id === parseInt(id));

    if (!video) {
        notFound();
    }

    // Get summary and questions
    const [summary, questions] = await Promise.all([
        getSummaryByVideoId(video.id),
        getQuestionsByVideoId(video.id)
    ]);

    // Extract YouTube video ID from URL
    const getYouTubeVideoId = (url: string): string | null => {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const youtubeVideoId = getYouTubeVideoId(video.url);

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">                <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-blue-600" />
                        <span className="text-xl font-bold">RecallAI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <UserButton />
                    </div>
                </div>
            </header>

            <main className="flex-1 container py-6">
                <div className="mb-6">
                    <BackButton />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {video.title}
                    </h1>
                    {video.channel_name && (
                        <p className="text-gray-600">
                            by {video.channel_name}
                        </p>
                    )}
                </div>                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-200px)]">
                    {/* Video Player - Left Side on Desktop, Top on Mobile */}
                    <div className="bg-black rounded-lg overflow-hidden aspect-video lg:aspect-auto">
                        <VideoPlayer 
                            videoId={youtubeVideoId}
                            title={video.title}
                        />
                    </div>

                    {/* Content Tabs - Right Side on Desktop, Bottom on Mobile */}
                    <div className="flex flex-col min-h-[500px] lg:min-h-0">                        <ContentTabs
                            summary={summary}
                            questions={questions}
                            userId={user.id}
                            videoId={video.id}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
