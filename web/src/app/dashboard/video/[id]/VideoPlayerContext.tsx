"use client";

import { createContext, useContext, useState } from "react";

type VideoPlayerContextType = {
    currentTime: number | null;
    seekTo: (seconds: number) => void;
};

const VideoPlayerContext = createContext<VideoPlayerContextType | null>(null);

export function VideoPlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentTime, setCurrentTime] = useState<number | null>(null);

    return (
        <VideoPlayerContext.Provider value={{ currentTime, seekTo: setCurrentTime }}>
            {children}
        </VideoPlayerContext.Provider>
    );
}

export function useVideoPlayer() {
    const context = useContext(VideoPlayerContext);
    if (!context) {
        throw new Error("useVideoPlayer must be used within a VideoPlayerProvider");
    }
    return context;
}
