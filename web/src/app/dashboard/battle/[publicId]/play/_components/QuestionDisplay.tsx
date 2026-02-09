"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIContent } from "@/components/ui/ai-content";
import type { QuestionData, GamePhase } from "@/hooks/useBattleGame";
import type { BattleSlot } from "../../../_components/types";

interface QuestionDisplayProps {
  question: QuestionData | null;
  selectedOptionId: number | null;
  onSelectOption: (optionId: number) => void;
  isSubmitting: boolean;
  gamePhase: GamePhase;
  playersAnswered: Set<number>;
  slots: BattleSlot[];
}

export function QuestionDisplay({
  question,
  selectedOptionId,
  onSelectOption,
  isSubmitting,
  gamePhase,
  playersAnswered,
  slots,
}: QuestionDisplayProps) {
  if (!question) return null;

  const hasAnswered = selectedOptionId !== null;
  const isDisabled = hasAnswered || isSubmitting || gamePhase === "answer_submitted";

  const activeSlots = slots.filter(
    (s) => s.slotType === "player" || s.slotType === "bot"
  );
  const answeredCount = activeSlots.filter((s) =>
    playersAnswered.has(s.slotIndex)
  ).length;

  return (
    <div className="space-y-6">
      {/* Question text */}
      <div className="rounded-lg border bg-card p-6">
        <AIContent
          content={question.text}
          className="text-lg font-medium"
        />
      </div>

      {/* Answer options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedOptionId === option.id;
          const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D

          return (
            <button
              key={option.id}
              onClick={() => onSelectOption(option.id)}
              disabled={isDisabled}
              className={cn(
                "relative flex items-start gap-3 rounded-lg border p-4 text-left transition-all",
                "hover:border-primary/50 hover:bg-accent/50",
                "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-transparent disabled:hover:border-border",
                isSelected && "border-primary bg-primary/10 ring-2 ring-primary/20"
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-medium",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                )}
              >
                {optionLetter}
              </span>
              <span className="text-sm leading-relaxed pt-0.5">
                {option.optionText}
              </span>
            </button>
          );
        })}
      </div>

      {/* Answered indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Check className="size-4" />
          <span>
            {answeredCount} of {activeSlots.length} answered
          </span>
        </div>
      </div>
    </div>
  );
}
