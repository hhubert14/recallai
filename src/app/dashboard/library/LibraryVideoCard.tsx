"use client";

import Link from "next/link";
import { Play, Check, X, Clock, AlertTriangle } from "lucide-react";
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

    // Calculate expiry status
    const getExpiryStatus = () => {
        if (!video.should_expire) {
            return { status: 'permanent', message: 'Permanent', color: 'text-green-600' };
        }
        
        const expiryDate = new Date(video.expiry_date);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
            return { status: 'expired', message: 'Expired', color: 'text-red-600' };
        } else if (daysUntilExpiry <= 1) {
            return { status: 'expires-soon', message: 'Expires today', color: 'text-orange-600' };
        } else if (daysUntilExpiry <= 3) {
            return { status: 'expires-soon', message: `Expires in ${daysUntilExpiry} days`, color: 'text-orange-600' };
        } else {
            return { status: 'active', message: `Expires ${formatDate(video.expiry_date)}`, color: 'text-gray-500' };
        }
    };

    const expiryStatus = getExpiryStatus();

    return (
        <Link 
            href={`/dashboard/video/${video.id}`}
            className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors bg-white dark:bg-gray-900"
        >
            <div className="flex items-center justify-between">
                {/* Left side - Video info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                        <Play className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate text-gray-900 dark:text-white">
                            {video.title}
                        </h3>
                        {video.channel_name && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {video.channel_name}
                            </p>
                        )}
                        {/* Expiry status */}
                        <div className="flex items-center gap-1 mt-1">
                            {video.should_expire ? (
                                expiryStatus.status === 'expires-soon' ? (
                                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                                ) : (
                                    <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                )
                            ) : (
                                <Check className="h-3 w-3 text-green-500" />
                            )}
                            <span className={`text-xs ${expiryStatus.color === 'text-gray-500' ? 'text-gray-500 dark:text-gray-400' : expiryStatus.color}`}>
                                {expiryStatus.message}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right side - Additional info */}
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(video.created_at)}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                            {isCompleted ? (
                                <>
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span className="text-xs text-green-600">Completed</span>
                                </>
                            ) : (
                                <>
                                    <X className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Questions Unanswered</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
