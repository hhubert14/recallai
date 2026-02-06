"use client";

import { useVideoPlayer } from "../VideoPlayerContext";

interface VideoPlayerProps {
    videoId: string | null;
    title: string;
}

export function VideoPlayer({ videoId, title }: VideoPlayerProps) {
    const { currentTime } = useVideoPlayer();

    if (!videoId) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <p className="text-white">Unable to load video</p>
            </div>
        );
    }

    const src = currentTime
        ? `https://www.youtube.com/embed/${videoId}?start=${currentTime}&autoplay=1`
        : `https://www.youtube.com/embed/${videoId}`;

    return (
        <div className="w-full h-full relative min-h-[300px] lg:min-h-[400px]">
            <iframe
                key={currentTime}
                src={src}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
}
