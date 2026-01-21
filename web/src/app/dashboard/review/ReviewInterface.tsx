"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuizProgress, QuizQuestion, QuizResult, QuizSummary } from "@/components/quiz";
import { StudyModeSelector, StudyModeStats, ProgressStats } from "./StudyModeSelector";
import { StudyMode, QuestionWithProgressApiResponse } from "@/clean-architecture/use-cases/progress/types";
import { BookOpen, Video } from "lucide-react";

interface SessionResults {
  correct: number;
  incorrect: number;
  movedUp: number;
  needsReview: number;
}

interface ReviewInterfaceProps {
  studyModeStats: StudyModeStats;
  progressStats: ProgressStats;
}

const SESSION_LIMIT = 10;

export function ReviewInterface({
  studyModeStats,
  progressStats,
}: ReviewInterfaceProps) {
  const router = useRouter();

  // Mode selection state
  const [selectedMode, setSelectedMode] = useState<StudyMode>(
    studyModeStats.dueCount > 0 ? "due" : studyModeStats.newCount > 0 ? "new" : "random"
  );
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Quiz state
  const [questions, setQuestions] = useState<QuestionWithProgressApiResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error states
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Session tracking
  const [sessionResults, setSessionResults] = useState<SessionResults>({
    correct: 0,
    incorrect: 0,
    movedUp: 0,
    needsReview: 0,
  });

  const currentItem = questions[currentQuestionIndex];
  const isSessionComplete = sessionStarted && currentQuestionIndex >= questions.length;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasMoreQuestions = questions.length >= SESSION_LIMIT;

  const fetchQuestions = async (mode: StudyMode): Promise<boolean> => {
    setIsLoadingQuestions(true);
    setFetchError(null);
    try {
      const response = await fetch(`/api/v1/reviews?mode=${mode}&limit=${SESSION_LIMIT}`);
      const data = await response.json();
      if (data.status === "success") {
        setQuestions(data.data.questions);
        return true;
      } else {
        setFetchError(data.data?.error || "Failed to load questions");
        return false;
      }
    } catch {
      setFetchError("Failed to load questions. Please try again.");
      return false;
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleStartSession = async () => {
    const success = await fetchQuestions(selectedMode);
    if (!success) return;

    setSessionStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setShowResult(false);
    setSessionResults({ correct: 0, incorrect: 0, movedUp: 0, needsReview: 0 });
  };

  const handleSubmit = async () => {
    if (!selectedOptionId || !currentItem) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const selectedOption = currentItem.question.options.find(
      (option) => option.id === selectedOptionId
    );

    if (!selectedOption) {
      setIsSubmitting(false);
      return;
    }

    // Random mode: show feedback but don't update progress
    if (selectedMode === "random") {
      setSessionResults((prev) => ({
        ...prev,
        correct: prev.correct + (selectedOption.isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (selectedOption.isCorrect ? 0 : 1),
      }));
      setShowResult(true);
      setIsSubmitting(false);
      return;
    }

    // Due/New modes: update spaced repetition progress
    const previousBoxLevel = currentItem.progress?.boxLevel ?? 0;

    try {
      const response = await fetch("/api/v1/reviews/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentItem.question.id,
          isCorrect: selectedOption.isCorrect,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        const newBoxLevel = data.data?.progress?.boxLevel ?? previousBoxLevel;

        // Update session results
        setSessionResults((prev) => {
          const newResults = { ...prev };
          if (selectedOption.isCorrect) {
            newResults.correct++;
            if (newBoxLevel > previousBoxLevel) {
              newResults.movedUp++;
            }
          } else {
            newResults.incorrect++;
            newResults.needsReview++;
          }
          return newResults;
        });
      } else {
        setSubmitError(data.data?.error || "Failed to save your answer");
      }
    } catch {
      setSubmitError("Failed to save your answer. Your progress may not be recorded.");
    }

    setShowResult(true);
    setIsSubmitting(false);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptionId(null);
      setShowResult(false);
    }
  };

  const handleFinish = () => {
    setCurrentQuestionIndex(questions.length); // Trigger session complete
  };

  const handleContinue = async () => {
    const success = await fetchQuestions(selectedMode);
    if (!success) return;

    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setShowResult(false);
    // Keep cumulative results
  };

  const handleBackToModeSelection = () => {
    // Reset client state
    setSessionStarted(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setShowResult(false);
    setSessionResults({ correct: 0, incorrect: 0, movedUp: 0, needsReview: 0 });
    setFetchError(null);
    setSubmitError(null);
    // Refresh server data (stats)
    router.refresh();
  };

  const selectedOption = currentItem?.question.options.find(
    (option) => option.id === selectedOptionId
  );

  // Mode selection screen
  if (!sessionStarted) {
    // No questions at all - empty state
    if (studyModeStats.totalCount === 0) {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-16 animate-fade-up">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              No Questions Yet
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Complete some video quizzes to add questions to your spaced repetition system.
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return (
      <StudyModeSelector
        stats={studyModeStats}
        progressStats={progressStats}
        selectedMode={selectedMode}
        onModeSelect={setSelectedMode}
        onStartSession={handleStartSession}
        isLoading={isLoadingQuestions}
        error={fetchError}
      />
    );
  }

  // Session complete screen
  if (isSessionComplete) {
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
              onClick: handleBackToModeSelection,
              variant: "outline",
            },
            ...(hasMoreQuestions
              ? [
                  {
                    label: "Continue",
                    onClick: handleContinue,
                    variant: "default" as const,
                  },
                ]
              : []),
          ]}
        />
      </div>
    );
  }

  // Loading state or fetch error
  if (!currentItem) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          {fetchError ? (
            <>
              <p className="text-red-600 dark:text-red-400 mb-4">{fetchError}</p>
              <Button onClick={() => fetchQuestions(selectedMode)} variant="outline">
                Try Again
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">Loading questions...</p>
          )}
        </div>
      </div>
    );
  }

  // Quiz interface
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <QuizProgress
        current={currentQuestionIndex + 1}
        total={questions.length}
      />

      {/* Video source badge */}
      <a
        href={`/dashboard/video/${currentItem.question.videoPublicId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <Video className="w-4 h-4" />
        <span className="truncate hover:underline">{currentItem.question.videoTitle}</span>
      </a>

      {/* Question */}
      <QuizQuestion
        questionText={currentItem.question.questionText}
        options={currentItem.question.options}
        selectedOptionId={selectedOptionId}
        onSelect={setSelectedOptionId}
        disabled={showResult}
        showResult={showResult}
      />

      {/* Result feedback */}
      {showResult && selectedOption && (
        <QuizResult
          isCorrect={selectedOption.isCorrect}
          explanation={
            currentItem.question.options.find((opt) => opt.isCorrect)?.explanation
          }
        />
      )}

      {/* Submit error message */}
      {submitError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {submitError}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={!selectedOptionId || isSubmitting}
            size="lg"
          >
            {isSubmitting ? "Checking..." : "Check Answer"}
          </Button>
        ) : (
          <>
            {!isLastQuestion ? (
              <Button onClick={handleNext} size="lg">
                Next Question →
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                Finish Session
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
