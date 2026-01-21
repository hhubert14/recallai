"use client";

import { cn } from "@/lib/utils";

interface QuizProgressProps {
  current: number;
  total: number;
  className?: string;
}

export function QuizProgress({ current, total, className }: QuizProgressProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {/* Dot indicators */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-200",
              i + 1 === current
                ? "bg-primary scale-125"
                : i + 1 < current
                  ? "bg-primary/60"
                  : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>

      {/* Text indicator */}
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {current} of {total}
      </span>
    </div>
  );
}
