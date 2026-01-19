"use client";

import Link from "next/link";
import { Play, Check, X } from "lucide-react";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { useQuizCompletion } from "@/components/providers/QuizCompletionProvider";

interface LibraryVideoCardProps {
    video: VideoEntity & { quizCompleted: boolean };
}

export function LibraryVideoCard({ video }: LibraryVideoCardProps) {
    const { isVideoCompleted } = useQuizCompletion();

    // Check both server-side data and client-side state
    const isCompleted = video.quizCompleted || isVideoCompleted(video.id);

    // Format date as "June 13, 2025"
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <Link
            href={`/dashboard/video/${video.id}`}
            className="group block p-4 rounded-lg border border-border bg-card transition-all duration-300 hover:bg-muted/50 hover:-translate-y-0.5 hover:shadow-sm dark:hover:shadow-none dark:hover:border-foreground/20"
        >
            <div className="flex items-center justify-between">
                {/* Left side - Video info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                        <Play className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate text-foreground">
                            {video.title}
                        </h3>
                        {video.channelName && (
                            <p className="text-sm text-muted-foreground truncate">
                                {video.channelName}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right side - Additional info */}
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                            {formatDate(video.createdAt)}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                            {isCompleted ? (
                                <>
                                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <span className="text-xs text-green-600 dark:text-green-400">
                                        Completed
                                    </span>
                                </>
                            ) : (
                                <>
                                    <X className="h-4 w-4 text-muted-foreground/70" />
                                    <span className="text-xs text-muted-foreground">
                                        Questions Unanswered
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
