"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Video } from "lucide-react";
import { AIContent } from "@/components/ui/ai-content";

interface QuizResultProps {
  isCorrect: boolean;
  explanation?: string | null;
  videoTitle?: string;
  onVideoClick?: () => void;
  className?: string;
}

export function QuizResult({
  isCorrect,
  explanation,
  videoTitle,
  onVideoClick,
  className,
}: QuizResultProps) {
  return (
    <div
      className={cn(
        "p-5 rounded-xl border animate-fade-up",
        isCorrect
          ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
          : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {isCorrect ? (
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        )}
        <span
          className={cn(
            "text-lg font-semibold",
            isCorrect
              ? "text-green-800 dark:text-green-100"
              : "text-red-800 dark:text-red-100"
          )}
        >
          {isCorrect ? "Correct!" : "Incorrect"}
        </span>
      </div>

      {/* Explanation */}
      {explanation && (
        <AIContent
          content={explanation}
          className="text-sm text-muted-foreground leading-relaxed mb-3"
        />
      )}

      {/* Video source link */}
      {videoTitle && onVideoClick && (
        <button
          onClick={onVideoClick}
          className={cn(
            "flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors",
            "bg-background/50 hover:bg-background",
            isCorrect
              ? "text-green-700 dark:text-green-300"
              : "text-red-700 dark:text-red-300"
          )}
        >
          <Video className="w-4 h-4" />
          <span className="truncate">From: {videoTitle}</span>
        </button>
      )}
    </div>
  );
}
