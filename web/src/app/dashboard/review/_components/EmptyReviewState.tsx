"use client";

import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export interface EmptyReviewStateProps {
  onNavigateToDashboard: () => void;
}

export function EmptyReviewState({
  onNavigateToDashboard,
}: EmptyReviewStateProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center py-16 animate-fade-up">
        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          No Items Yet
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Complete some video quizzes or create flashcards to add items to your
          spaced repetition system.
        </p>
        <Button onClick={onNavigateToDashboard} variant="outline">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
