"use client";

import { useEffect } from "react";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { LibraryVideoCard } from "./LibraryVideoCard";
import { useQuizCompletion } from "@/components/providers/QuizCompletionProvider";

interface ClientLibraryVideoListProps {
    videos: (VideoEntity & { quizCompleted: boolean })[];
}

export function ClientLibraryVideoList({
    videos,
    // userId,
}: ClientLibraryVideoListProps) {
    const { markVideoAsCompleted } = useQuizCompletion(); // Initialize completed videos from server data
    useEffect(() => {
        videos.forEach(video => {
            if (video.quizCompleted) {
                markVideoAsCompleted(video.id);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount to initialize from server data

    if (videos.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                    <div className="mb-4">
                        <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No videos in your library yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Start watching educational videos with the RecallAI
                        extension to build your library.
                    </p>
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                        Install the Chrome extension to get started
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {videos.map(video => (
                <LibraryVideoCard key={video.id} video={video} />
            ))}
        </div>
    );
}
