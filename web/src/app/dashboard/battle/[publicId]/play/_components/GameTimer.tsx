"use client";

import { cn } from "@/lib/utils";

interface GameTimerProps {
  timeRemaining: number;
  timeLimitSeconds: number;
}

export function GameTimer({ timeRemaining, timeLimitSeconds }: GameTimerProps) {
  const fraction = timeLimitSeconds > 0 ? timeRemaining / timeLimitSeconds : 0;
  const displaySeconds = Math.ceil(Math.max(0, timeRemaining));

  const colorClass =
    fraction > 0.5
      ? "bg-green-500"
      : fraction > 0.25
        ? "bg-yellow-500"
        : "bg-red-500";

  const textColorClass =
    fraction > 0.5
      ? "text-green-600 dark:text-green-400"
      : fraction > 0.25
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400";

  return (
    <div className="flex items-center gap-3">
      {/* Progress bar */}
      <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-100", colorClass)}
          style={{ width: `${Math.max(0, fraction * 100)}%` }}
        />
      </div>

      {/* Time display */}
      <span className={cn("text-sm font-mono font-bold tabular-nums min-w-[2.5rem] text-right", textColorClass)}>
        {displaySeconds}s
      </span>
    </div>
  );
}
