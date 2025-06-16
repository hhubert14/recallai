"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface QuizCompletionContextType {
    completedVideos: Set<number>;
    markVideoAsCompleted: (videoId: number) => void;
    isVideoCompleted: (videoId: number) => boolean;
}

const QuizCompletionContext = createContext<QuizCompletionContextType | undefined>(undefined);

interface QuizCompletionProviderProps {
    children: ReactNode;
    initialCompletedVideos?: number[];
}

export function QuizCompletionProvider({ children, initialCompletedVideos = [] }: QuizCompletionProviderProps) {
    const [completedVideos, setCompletedVideos] = useState<Set<number>>(
        new Set(initialCompletedVideos)
    );    const markVideoAsCompleted = useCallback((videoId: number) => {
        setCompletedVideos(prev => {
            if (prev.has(videoId)) {
                return prev; // Don't create new Set if already completed
            }
            return new Set([...prev, videoId]);
        });
    }, []);

    const isVideoCompleted = useCallback((videoId: number) => {
        return completedVideos.has(videoId);
    }, [completedVideos]);

    return (
        <QuizCompletionContext.Provider value={{
            completedVideos,
            markVideoAsCompleted,
            isVideoCompleted
        }}>
            {children}
        </QuizCompletionContext.Provider>
    );
}

export function useQuizCompletion() {
    const context = useContext(QuizCompletionContext);
    if (!context) {
        throw new Error('useQuizCompletion must be used within a QuizCompletionProvider');
    }
    return context;
}
