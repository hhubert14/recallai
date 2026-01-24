"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Clock, Sparkles, Shuffle, ChevronRight } from "lucide-react";
import { StudyMode } from "@/clean-architecture/use-cases/review/types";
import { TOUR_TARGETS } from "@/components/tour/tour-constants";

export interface StudyModeStats {
  dueCount: number;
  newCount: number;
  totalCount: number;
}

export interface ProgressStats {
  mastered: number;
  inProgress: number;
  dueToday: number;
}

interface StudyModeSelectorProps {
  stats: StudyModeStats;
  progressStats: ProgressStats;
  selectedMode: StudyMode;
  onModeSelect: (mode: StudyMode) => void;
  onStartSession: () => void;
  isLoading?: boolean;
  error: string | null;
}

const MODE_CONFIG: Record<StudyMode, {
  icon: React.ReactNode;
  title: string;
  description: string;
  countKey: keyof StudyModeStats;
  color: string;
}> = {
  due: {
    icon: <Clock className="w-5 h-5" />,
    title: "Due for Review",
    description: "Stay on track with your learning",
    countKey: "dueCount",
    color: "text-blue-600 dark:text-blue-400",
  },
  new: {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Learn New Items",
    description: "Expand your knowledge with new questions and flashcards",
    countKey: "newCount",
    color: "text-green-600 dark:text-green-400",
  },
  random: {
    icon: <Shuffle className="w-5 h-5" />,
    title: "Random Practice",
    description: "Mix it up with random questions and flashcards",
    countKey: "totalCount",
    color: "text-purple-600 dark:text-purple-400",
  },
};

export function StudyModeSelector({
  stats,
  progressStats,
  selectedMode,
  onModeSelect,
  onStartSession,
  isLoading = false,
  error,
}: StudyModeSelectorProps) {
  const hasAnyQuestions = stats.totalCount > 0;
  const selectedModeCount = stats[MODE_CONFIG[selectedMode].countKey];
  const canStart = selectedModeCount > 0;

  // Determine hero message
  const getHeroMessage = () => {
    if (!hasAnyQuestions) {
      return "No items yet";
    }
    if (stats.dueCount > 0) {
      return `You have ${stats.dueCount} item${stats.dueCount !== 1 ? "s" : ""} waiting!`;
    }
    if (stats.newCount > 0) {
      return `${stats.newCount} new item${stats.newCount !== 1 ? "s" : ""} to learn!`;
    }
    return "You're all caught up! 🎉";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Hero message */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {getHeroMessage()}
        </h2>
        {stats.dueCount === 0 && stats.newCount === 0 && hasAnyQuestions && (
          <p className="text-muted-foreground">
            Great job staying on top of your reviews. Try random practice to keep sharp!
          </p>
        )}
      </div>

      {/* Mode cards */}
      <div className="space-y-3" data-tour-id={TOUR_TARGETS.studyModeCards}>
        {(Object.keys(MODE_CONFIG) as StudyMode[]).map((mode) => {
          const config = MODE_CONFIG[mode];
          const count = stats[config.countKey];
          const isSelected = selectedMode === mode;
          const isDisabled = count === 0;

          return (
            <button
              key={mode}
              onClick={() => !isDisabled && onModeSelect(mode)}
              disabled={isDisabled}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                "flex items-center gap-4",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
                isSelected && !isDisabled
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card",
                !isSelected && !isDisabled && "hover:border-primary/50 hover:bg-primary/5",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Radio indicator */}
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                  isSelected ? "border-primary" : "border-muted-foreground/50"
                )}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>

              {/* Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  isSelected ? "bg-primary/10" : "bg-muted",
                  config.color
                )}
              >
                {config.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">
                    {config.title}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {count}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {config.description}
                </p>
              </div>

              {/* Arrow */}
              <ChevronRight
                className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  isSelected ? "text-primary" : "text-muted-foreground/50"
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Start button */}
      <div className="flex flex-col items-center gap-3" data-tour-id={TOUR_TARGETS.startSessionBtn}>
        <Button
          onClick={onStartSession}
          disabled={!canStart || isLoading}
          size="lg"
          className="px-8"
        >
          {isLoading ? "Loading..." : "Start Session"}
        </Button>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      {/* Progress footer */}
      <div
        className="text-center text-sm text-muted-foreground border-t border-border pt-6"
        data-tour-id={TOUR_TARGETS.progressFooter}
      >
        <span className="inline-flex items-center gap-4">
          <span>{progressStats.mastered} mastered</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>{progressStats.inProgress} in progress</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>{progressStats.dueToday} due today</span>
        </span>
      </div>
    </div>
  );
}
