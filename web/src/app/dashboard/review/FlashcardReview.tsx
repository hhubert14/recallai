"use client";

import { Button } from "@/components/ui/button";
import { QuizResult } from "@/components/quiz";
import { RotateCcw } from "lucide-react";

export interface FlashcardReviewProps {
  flashcard: {
    id: number;
    front: string;
    back: string;
  };
  isFlipped: boolean;
  onFlip: () => void;
  selfAssessment: boolean | null;
  onSelfAssess: (correct: boolean) => void;
  showResult: boolean;
}

export function FlashcardReview({
  flashcard,
  isFlipped,
  onFlip,
  selfAssessment,
  onSelfAssess,
  showResult,
}: FlashcardReviewProps) {
  const handleCardClick = () => {
    if (!showResult) {
      onFlip();
    }
  };

  return (
    <div className="space-y-4">
      {/* Flashcard */}
      <div
        className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
          isFlipped
            ? "bg-primary/5 border-primary"
            : "bg-card border-border hover:border-primary/50"
        }`}
        onClick={handleCardClick}
      >
        <div className="text-center min-h-[200px] flex flex-col items-center justify-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
            {isFlipped ? "Back" : "Front"}
          </p>
          <p className="text-xl font-medium text-foreground">
            {isFlipped ? flashcard.back : flashcard.front}
          </p>
          {!isFlipped && !showResult && (
            <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Click to flip
            </p>
          )}
        </div>
      </div>

      {/* Self-assessment buttons (only after flipping, before result) */}
      {isFlipped && !showResult && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            Did you know the answer?
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant={selfAssessment === false ? "destructive" : "outline"}
              onClick={() => onSelfAssess(false)}
              className="flex-1 max-w-32"
            >
              Not Yet
            </Button>
            <Button
              variant={selfAssessment === true ? "default" : "outline"}
              onClick={() => onSelfAssess(true)}
              className="flex-1 max-w-32"
            >
              Got It!
            </Button>
          </div>
        </div>
      )}

      {/* Result feedback */}
      {showResult && (
        <QuizResult
          isCorrect={selfAssessment === true}
          explanation={
            selfAssessment
              ? "Great job! Keep it up!"
              : "No worries - you'll see this card again soon."
          }
        />
      )}
    </div>
  );
}
