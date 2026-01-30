"use client";

import { cn } from "@/lib/utils";
import { AIContent } from "@/components/ui/ai-content";

export interface QuizOption {
  id: number;
  optionText: string;
  isCorrect: boolean;
  explanation: string | null;
}

interface QuizQuestionProps {
  questionText?: string;
  options: QuizOption[];
  selectedOptionId: number | null;
  onSelect: (optionId: number) => void;
  disabled?: boolean;
  showResult?: boolean;
  hideQuestionCard?: boolean;
  className?: string;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function QuizQuestion({
  questionText,
  options,
  selectedOptionId,
  onSelect,
  disabled = false,
  showResult = false,
  hideQuestionCard = false,
  className,
}: QuizQuestionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Question card */}
      {!hideQuestionCard && questionText && (
        <div className="bg-card p-6 rounded-xl border border-border">
          <AIContent
            content={questionText}
            className="text-lg font-medium text-foreground leading-relaxed"
          />
        </div>
      )}

      {/* Option cards */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrectAnswer = option.isCorrect;
          const isWrongSelection = isSelected && !isCorrectAnswer && showResult;
          const isCorrectSelection = isCorrectAnswer && showResult;

          return (
            <button
              key={option.id}
              onClick={() => !disabled && onSelect(option.id)}
              disabled={disabled}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                "flex items-center gap-4",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
                !showResult && !disabled && "hover:border-primary/50 hover:bg-primary/5",
                !showResult && isSelected && "border-primary bg-primary/10",
                !showResult && !isSelected && "border-border bg-card",
                showResult && isCorrectSelection && "border-green-500 bg-green-50 dark:bg-green-950/30",
                showResult && isWrongSelection && "border-red-500 bg-red-50 dark:bg-red-950/30",
                showResult && !isCorrectSelection && !isWrongSelection && "border-border bg-card opacity-60",
                disabled && !showResult && "cursor-not-allowed opacity-60"
              )}
            >
              {/* Letter badge */}
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm shrink-0 transition-colors",
                  !showResult && isSelected && "bg-primary text-primary-foreground",
                  !showResult && !isSelected && "bg-muted text-muted-foreground",
                  showResult && isCorrectSelection && "bg-green-500 text-white",
                  showResult && isWrongSelection && "bg-red-500 text-white",
                  showResult && !isCorrectSelection && !isWrongSelection && "bg-muted text-muted-foreground"
                )}
              >
                {OPTION_LETTERS[index] || index + 1}
              </div>

              {/* Option text */}
              <span
                className={cn(
                  "flex-1 text-foreground",
                  showResult && isCorrectSelection && "font-medium text-green-900 dark:text-green-100",
                  showResult && isWrongSelection && "text-red-900 dark:text-red-100"
                )}
              >
                {option.optionText}
              </span>

              {/* Result indicator */}
              {showResult && isCorrectSelection && (
                <div className="text-green-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              {showResult && isWrongSelection && (
                <div className="text-red-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
