"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PartyPopper, TrendingUp, RotateCcw } from "lucide-react";

export interface QuizSummaryAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary";
}

interface QuizSummaryProps {
  correct: number;
  total: number;
  movedUp?: number;
  needsReview?: number;
  actions: QuizSummaryAction[];
  className?: string;
}

export function QuizSummary({
  correct,
  total,
  movedUp,
  needsReview,
  actions,
  className,
}: QuizSummaryProps) {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const isGreatScore = percentage >= 80;
  const isGoodScore = percentage >= 60 && percentage < 80;

  return (
    <div
      className={cn(
        "text-center py-10 px-6 rounded-2xl border animate-fade-up",
        isGreatScore
          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
          : isGoodScore
            ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
            : "bg-card border-border",
        className
      )}
    >
      {/* Celebration icon */}
      <div
        className={cn(
          "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6",
          isGreatScore
            ? "bg-green-100 dark:bg-green-900/30"
            : isGoodScore
              ? "bg-yellow-100 dark:bg-yellow-900/30"
              : "bg-primary/10"
        )}
      >
        <PartyPopper
          className={cn(
            "w-10 h-10",
            isGreatScore
              ? "text-green-600 dark:text-green-400"
              : isGoodScore
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-primary"
          )}
        />
      </div>

      {/* Title */}
      <h2
        className={cn(
          "text-2xl font-bold mb-2",
          isGreatScore
            ? "text-green-900 dark:text-green-100"
            : isGoodScore
              ? "text-yellow-900 dark:text-yellow-100"
              : "text-foreground"
        )}
      >
        Session Complete!
      </h2>

      {/* Score display */}
      <div className="max-w-xs mx-auto mb-6">
        <div className="text-4xl font-bold text-foreground mb-2">
          {correct}/{total}
          <span className="text-2xl text-muted-foreground ml-2">
            ({percentage}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isGreatScore
                ? "bg-green-500"
                : isGoodScore
                  ? "bg-yellow-500"
                  : "bg-primary"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      {(movedUp !== undefined || needsReview !== undefined) && (
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
          {movedUp !== undefined && movedUp > 0 && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>{movedUp} moved up</span>
            </div>
          )}
          {needsReview !== undefined && needsReview > 0 && (
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-orange-500" />
              <span>{needsReview} need review</span>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={action.onClick}
            variant={action.variant || "default"}
            className={cn(
              index === 0 && isGreatScore && "bg-green-600 hover:bg-green-700"
            )}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
