"use client";

import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StreakBadgeProps {
  userId: string;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

export function StreakBadge({ userId }: StreakBadgeProps) {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStreak() {
      try {
        const response = await fetch(`/api/v1/streaks/${userId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.status === "success") {
            setStreak(result.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch streak:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStreak();
  }, [userId]);

  const isActive = streak.currentStreak > 0;
  const flameColor = isActive ? "text-orange-500" : "text-gray-400";
  const bgColor = isActive
    ? "bg-orange-500/10 border-orange-500/20"
    : "bg-gray-500/10 border-gray-500/20";

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    // Parse as local date to avoid timezone shift
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-gray-500/10 border-gray-500/20 animate-pulse">
        <div className="h-4 w-4 bg-gray-400 rounded-full" />
        <div className="h-4 w-4 bg-gray-400 rounded" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${bgColor} transition-colors cursor-default`}
          >
            <Flame className={`h-4 w-4 ${flameColor}`} />
            <span className={`text-sm font-semibold ${flameColor}`}>
              {streak.currentStreak}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-sm">
          <div className="space-y-1">
            <p className="font-semibold">
              {isActive
                ? `${streak.currentStreak} day streak! Keep it up! 🔥`
                : "Start your streak today! 💪"}
            </p>
            <p className="text-muted-foreground text-xs">
              Longest: {streak.longestStreak} days
            </p>
            <p className="text-muted-foreground text-xs">
              Last activity: {formatDate(streak.lastActivityDate)}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
