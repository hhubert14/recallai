"use client";

import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { LibraryVideoCard } from "./LibraryVideoCard";
import { useInView } from "@/hooks/useInView";

interface ClientLibraryVideoListProps {
    videos: (VideoEntity & { questionCount: number; flashcardCount: number })[];
}

export function ClientLibraryVideoList({
    videos,
}: ClientLibraryVideoListProps) {
    const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.1 });

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
