"use client";

interface VideoPlayerProps {
    videoId: string | null;
    title: string;
}

export function VideoPlayer({ videoId, title }: VideoPlayerProps) {
    if (!videoId) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <p className="text-white">Unable to load video</p>
            </div>
        );
    }
    return (
        <div className="w-full h-full relative min-h-[300px] lg:min-h-[400px]">
            <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
}
