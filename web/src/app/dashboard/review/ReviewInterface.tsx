"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuestionWithProgress } from "@/clean-architecture/use-cases/progress/get-questions-for-review.use-case";
import { ReviewStatsDto } from "@/clean-architecture/use-cases/progress/get-progress-stats.use-case";
import { ReviewStats } from "./ReviewStats";
import { CheckCircle2, XCircle, PartyPopper, BookOpen } from "lucide-react";

interface ReviewInterfaceProps {
  reviewStats: ReviewStatsDto;
  questionsForReview: QuestionWithProgress[];
}

export function ReviewInterface({
  reviewStats,
  questionsForReview,
}: ReviewInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sessionComplete =
    questionsForReview.length === 0 || currentQuestionIndex >= questionsForReview.length;
  const currentItem = sessionComplete ? null : questionsForReview[currentQuestionIndex];
  const isLastQuestion = !sessionComplete && currentQuestionIndex === questionsForReview.length - 1;

  const selectedOption = currentItem?.question.options.find(
    (option) => option.id === selectedOptionId
  );

  const handleSubmit = async () => {
    if (!selectedOptionId || !currentItem) return;

    setIsSubmitting(true);

    const selectedOption = currentItem.question.options.find(
      (option) => option.id === selectedOptionId
    );

    if (!selectedOption) {
      setIsSubmitting(false);
      return;
    }

    await fetch("/api/v1/reviews/submit-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: currentItem.question.id,
        isCorrect: selectedOption.isCorrect,
      }),
    });

    setShowResult(true);
    setIsSubmitting(false);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questionsForReview.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptionId(null);
      setShowResult(false);
    }
  };

  const handleFinish = () => {
    setCurrentQuestionIndex(questionsForReview.length);
  };

  if (sessionComplete && questionsForReview.length > 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <ReviewStats stats={reviewStats} />

        <div className="mt-8 text-center py-12 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 animate-fade-up">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <PartyPopper className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">
              Session Complete!
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Great job! You&apos;ve completed all available questions. Reviewed
              questions will appear again based on their spaced repetition schedule.
            </p>
            <Button
              onClick={() => window.location.reload()}
            >
              Start New Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (questionsForReview.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <ReviewStats stats={reviewStats} />

        <div className="mt-8 text-center py-12 animate-fade-up">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              No Questions Available
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You don&apos;t have any questions due for review today. Complete some
              video quizzes to add questions to your spaced repetition system.
            </p>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              variant="outline"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ReviewStats stats={reviewStats} />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {currentQuestionIndex + 1} of {questionsForReview.length}
        </span>
        <div className="w-32 bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / questionsForReview.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-medium text-foreground mb-4">
          {currentItem.question.questionText}
        </h3>

        <div className="space-y-3">
          {currentItem.question.options.map((option) => (
            <label
              key={option.id}
              className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedOptionId === option.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground/50"
              } ${
                showResult
                  ? option.isCorrect
                    ? "border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-950/20"
                    : selectedOptionId === option.id && !option.isCorrect
                      ? "border-red-600 dark:border-red-500 bg-red-50 dark:bg-red-950/20"
                      : "border-border bg-card"
                  : ""
              }`}
            >
              <input
                type="radio"
                name="option"
                value={option.id}
                checked={selectedOptionId === option.id}
                onChange={() => !showResult && setSelectedOptionId(option.id)}
                disabled={showResult}
                className="sr-only"
              />
              <div className="flex items-center">
                <div
                  className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedOptionId === option.id
                      ? "border-primary"
                      : "border-muted-foreground/50"
                  }`}
                >
                  {selectedOptionId === option.id && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-foreground">{option.optionText}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {showResult && (
        <div
          className={`p-4 rounded-lg animate-fade-up ${
            selectedOption?.isCorrect
              ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {selectedOption?.isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <span
              className={`font-medium ${
                selectedOption?.isCorrect
                  ? "text-green-800 dark:text-green-100"
                  : "text-red-800 dark:text-red-100"
              }`}
            >
              {selectedOption?.isCorrect ? "Correct!" : "Incorrect"}
            </span>
          </div>
          {currentItem.question.options.find((opt) => opt.isCorrect)?.explanation && (
            <p className="text-sm text-muted-foreground">
              {currentItem.question.options.find((opt) => opt.isCorrect)?.explanation}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={!selectedOptionId || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Answer"}
          </Button>
        ) : (
          <>
            {!isLastQuestion ? (
              <Button onClick={handleNext}>
                Next Question
              </Button>
            ) : (
              <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
                Finish Session
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
