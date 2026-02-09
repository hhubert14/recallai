"use client";

import { Trophy, Medal, Bot, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FinalResult } from "@/hooks/useBattleGame";
import type { BattleSlot } from "../../../_components/types";

interface GameResultsProps {
  finalResults: FinalResult[];
  slots: BattleSlot[];
  userId: string;
  roomName: string;
}

const RANK_STYLES = {
  1: { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/30" },
  2: { icon: Medal, color: "text-gray-400", bg: "bg-gray-400/10 border-gray-400/30" },
  3: { icon: Medal, color: "text-amber-600", bg: "bg-amber-600/10 border-amber-600/30" },
} as const;

export function GameResults({
  finalResults,
  slots,
  userId,
  roomName,
}: GameResultsProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Game Over!</h2>
        <p className="text-muted-foreground">{roomName}</p>
      </div>

      {/* Podium — top 3 */}
      <div className="flex items-end justify-center gap-4">
        {finalResults.slice(0, 3).map((result) => {
          const slot = slots.find((s) => s.slotIndex === result.slotIndex);
          const name = slot?.botName ?? `Player ${result.slotIndex + 1}`;
          const isCurrentUser = slot?.userId === userId;
          const rankStyle = RANK_STYLES[result.rank as 1 | 2 | 3];
          const RankIcon = rankStyle?.icon ?? Medal;

          const heightClass =
            result.rank === 1
              ? "h-32"
              : result.rank === 2
                ? "h-24"
                : "h-16";

          return (
            <div
              key={result.slotIndex}
              className={cn(
                "flex flex-col items-center gap-2",
                result.rank === 1 ? "order-2" : result.rank === 2 ? "order-1" : "order-3"
              )}
            >
              {/* Icon */}
              <RankIcon className={cn("size-6", rankStyle?.color ?? "text-muted-foreground")} />

              {/* Name */}
              <span className={cn("text-sm font-medium text-center", isCurrentUser && "text-primary")}>
                {name}
                {isCurrentUser && " (you)"}
              </span>

              {/* Podium bar */}
              <div
                className={cn(
                  "w-24 rounded-t-lg border flex items-center justify-center",
                  heightClass,
                  rankStyle?.bg ?? "bg-muted border-muted"
                )}
              >
                <span className="text-lg font-bold">{result.totalPoints} pts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full rankings */}
      <div className="rounded-lg border bg-card max-w-md mx-auto">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-medium">Final Rankings</h3>
        </div>
        <div className="divide-y">
          {finalResults.map((result) => {
            const slot = slots.find((s) => s.slotIndex === result.slotIndex);
            const name = slot?.botName ?? `Player ${result.slotIndex + 1}`;
            const isCurrentUser = slot?.userId === userId;

            return (
              <div
                key={result.slotIndex}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  isCurrentUser && "bg-primary/5"
                )}
              >
                {/* Rank */}
                <span className="text-sm font-bold text-muted-foreground w-5 text-center">
                  {result.rank}
                </span>

                {/* Avatar */}
                <span className="flex size-7 items-center justify-center rounded-full bg-muted">
                  {slot?.slotType === "bot" ? (
                    <Bot className="size-4 text-muted-foreground" />
                  ) : (
                    <User className="size-4 text-muted-foreground" />
                  )}
                </span>

                {/* Name */}
                <span className={cn("flex-1 text-sm truncate", isCurrentUser && "font-medium")}>
                  {name}
                  {isCurrentUser && " (you)"}
                </span>

                {/* Score */}
                <span className="text-sm font-mono font-bold">
                  {result.totalPoints} pts
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Return to lobby */}
      <div className="flex justify-center">
        <Button
          onClick={() => {
            window.location.href = "/dashboard/battle";
          }}
          variant="outline"
          size="lg"
        >
          <ArrowLeft className="size-4 mr-2" />
          Return to Lobby
        </Button>
      </div>
    </div>
  );
}
