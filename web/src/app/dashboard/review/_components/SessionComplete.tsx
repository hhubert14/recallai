"use client";

import { QuizSummary } from "@/components/quiz";
import { SessionResults } from "@/hooks/useReviewSession";

export interface SessionCompleteProps {
  sessionResults: SessionResults;
  hasMoreItems: boolean;
  onBackToModeSelection: () => void;
  onContinue: () => void;
}

export function SessionComplete({
  sessionResults,
  hasMoreItems,
  onBackToModeSelection,
  onContinue,
}: SessionCompleteProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <QuizSummary
        correct={sessionResults.correct}
        total={sessionResults.correct + sessionResults.incorrect}
        movedUp={sessionResults.movedUp}
        needsReview={sessionResults.needsReview}
        actions={[
          {
            label: "Back to Review",
            onClick: onBackToModeSelection,
            variant: "outline",
          },
          ...(hasMoreItems
            ? [
                {
                  label: "Continue",
                  onClick: onContinue,
                  variant: "default" as const,
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}
