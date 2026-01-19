"use client";

import { useEffect } from "react";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { LibraryVideoCard } from "./LibraryVideoCard";
import { useQuizCompletion } from "@/components/providers/QuizCompletionProvider";
import { useInView } from "@/hooks/useInView";

interface ClientLibraryVideoListProps {
    videos: (VideoEntity & { quizCompleted: boolean })[];
}

export function ClientLibraryVideoList({
    videos,
    // userId,
}: ClientLibraryVideoListProps) {
    const { markVideoAsCompleted } = useQuizCompletion();
    const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.1 });

    // Initialize completed videos from server data
    useEffect(() => {
        videos.forEach(video => {
            if (video.quizCompleted) {
                markVideoAsCompleted(video.id);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount to initialize from server data

    return (
        <div ref={ref} className="space-y-3">
            {videos.map((video, index) => (
                <div
                    key={video.id}
                    className={`opacity-0 ${isInView ? "animate-fade-up" : ""}`}
                    style={{
                        animationDelay: `${index * 80}ms`,
                        animationFillMode: "forwards",
                    }}
                >
                    <LibraryVideoCard video={video} />
                </div>
            ))}
        </div>
    );
}
