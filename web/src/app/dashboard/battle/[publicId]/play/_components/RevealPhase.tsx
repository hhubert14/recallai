"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIContent } from "@/components/ui/ai-content";
import type { QuestionData, RevealData } from "@/hooks/useBattleGame";
import type { BattleSlot } from "../../../_components/types";

interface RevealPhaseProps {
  question: QuestionData | null;
  revealData: RevealData;
  slots: BattleSlot[];
  selectedOptionId: number | null;
}

export function RevealPhase({
  question,
  revealData,
  slots,
  selectedOptionId,
}: RevealPhaseProps) {
  if (!question) return null;

  return (
    <div className="space-y-6">
      {/* Question text */}
      <div className="rounded-lg border bg-card p-6">
        <AIContent
          content={question.text}
          className="text-lg font-medium"
        />
      </div>

      {/* Options with correct/incorrect indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((option, idx) => {
          const isCorrect = option.id === revealData.correctOptionId;
          const wasSelected = option.id === selectedOptionId;
          const optionLetter = String.fromCharCode(65 + idx);

          return (
            <div
              key={option.id}
              className={cn(
                "relative flex items-start gap-3 rounded-lg border p-4",
                isCorrect && "border-green-500 bg-green-500/10",
                wasSelected && !isCorrect && "border-red-500 bg-red-500/10",
                !isCorrect && !wasSelected && "opacity-50"
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-medium",
                  isCorrect
                    ? "border-green-500 bg-green-500 text-white"
                    : wasSelected
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-muted-foreground/30"
                )}
              >
                {isCorrect ? (
                  <Check className="size-4" />
                ) : wasSelected ? (
                  <X className="size-4" />
                ) : (
                  optionLetter
                )}
              </span>
              <span className="text-sm leading-relaxed pt-0.5">
                {option.optionText}
              </span>
            </div>
          );
        })}
      </div>

      {/* Per-player results */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium mb-3">Results</h3>
        <div className="space-y-2">
          {revealData.results.map((result) => {
            const slot = slots.find((s) => s.slotIndex === result.slotIndex);
            const name = slot?.botName ?? (slot?.userId ? `Player ${result.slotIndex + 1}` : "Unknown");

            return (
              <div
                key={result.slotIndex}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  {result.isCorrect ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <X className="size-4 text-red-500" />
                  )}
                  <span>{name}</span>
                </div>
                <span className={cn(
                  "font-mono text-xs",
                  result.pointsAwarded > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                )}>
                  +{result.pointsAwarded}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
