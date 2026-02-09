"use client";

import { Bot, User, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RevealData } from "@/hooks/useBattleGame";
import type { BattleSlot } from "../../../_components/types";

interface LiveScoreboardProps {
  slots: BattleSlot[];
  scores: Map<number, number>;
  userId: string;
  revealData: RevealData | null;
}

export function LiveScoreboard({
  slots,
  scores,
  userId,
  revealData,
}: LiveScoreboardProps) {
  const activeSlots = slots
    .filter((s) => s.slotType === "player" || s.slotType === "bot")
    .map((slot) => ({
      ...slot,
      totalScore: scores.get(slot.slotIndex) ?? 0,
      roundScore: revealData?.results.find(
        (r) => r.slotIndex === slot.slotIndex
      )?.pointsAwarded,
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-medium">Scoreboard</h3>
      </div>
      <div className="divide-y">
        {activeSlots.map((slot, idx) => {
          const isCurrentUser = slot.userId === userId;
          const name = slot.botName ?? `Player ${slot.slotIndex + 1}`;

          return (
            <div
              key={slot.slotIndex}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                isCurrentUser && "bg-primary/5"
              )}
            >
              {/* Rank */}
              <span className="text-sm font-bold text-muted-foreground w-5 text-center">
                {idx === 0 ? (
                  <Crown className="size-4 text-yellow-500 mx-auto" />
                ) : (
                  idx + 1
                )}
              </span>

              {/* Avatar */}
              <span className="flex size-7 items-center justify-center rounded-full bg-muted">
                {slot.slotType === "bot" ? (
                  <Bot className="size-4 text-muted-foreground" />
                ) : (
                  <User className="size-4 text-muted-foreground" />
                )}
              </span>

              {/* Name */}
              <span className={cn(
                "flex-1 text-sm truncate",
                isCurrentUser && "font-medium"
              )}>
                {name}
                {isCurrentUser && " (you)"}
              </span>

              {/* Score */}
              <div className="text-right">
                <span className="text-sm font-mono font-bold">
                  {slot.totalScore}
                </span>
                {slot.roundScore !== undefined && slot.roundScore > 0 && (
                  <span className="text-xs text-green-600 dark:text-green-400 ml-1">
                    +{slot.roundScore}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
