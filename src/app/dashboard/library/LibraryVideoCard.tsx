"use client";

import Link from "next/link";
import { Play, Check, X } from "lucide-react";
import { VideoDto } from "@/data-access/videos/types";
import { useQuizCompletion } from "@/components/providers/QuizCompletionProvider";

interface LibraryVideoCardProps {
    video: VideoDto & { quizCompleted: boolean };
}

export function LibraryVideoCard({ video }: LibraryVideoCardProps) {
    const { isVideoCompleted } = useQuizCompletion();
    
    // Check both server-side data and client-side state
    const isCompleted = video.quizCompleted || isVideoCompleted(video.id);
    // Format date as "June 13, 2025"
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Link 
            href={`/dashboard/video/${video.id}`}
            className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
            <div className="flex items-center justify-between">
                {/* Left side - Video info (same as dashboard) */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                        <Play className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate text-gray-900">
                            {video.title}
                        </h3>
                        {video.channel_name && (
                            <p className="text-sm text-gray-500 truncate">
                                {video.channel_name}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right side - Additional info */}
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-600">
                            {formatDate(video.created_at)}
                        </p>                        <div className="flex items-center justify-end gap-1 mt-1">
                            {isCompleted ? (
                                <>
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span className="text-xs text-green-600">Completed</span>
                                </>
                            ) : (
                                <>
                                    <X className="h-4 w-4 text-gray-400" />
                                    <span className="text-xs text-gray-500">Incomplete</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
