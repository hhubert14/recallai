"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuizProgress, QuizQuestion, QuizResult, QuizSummary } from "@/components/quiz";
import { StudyModeSelector, StudyModeStats, ProgressStats } from "./StudyModeSelector";
import { StudyMode, ReviewItemApiResponse } from "@/clean-architecture/use-cases/review/types";
import { BookOpen, Video, RotateCcw } from "lucide-react";
import { TOUR_TARGETS } from "@/components/tour/tour-constants";
import { ReviewModeSelectorTour } from "./ReviewModeSelectorTour";
import { ReviewSessionTour } from "./ReviewSessionTour";

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
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // Review state
  const [items, setItems] = useState<ReviewItemApiResponse[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [selfAssessment, setSelfAssessment] = useState<boolean | null>(null);
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

  const currentItem = items[currentItemIndex];
  const isSessionComplete = sessionStarted && currentItemIndex >= items.length;
  const isLastItem = currentItemIndex === items.length - 1;
  const hasMoreItems = items.length >= SESSION_LIMIT;

  const fetchItems = async (mode: StudyMode): Promise<boolean> => {
    setIsLoadingItems(true);
    setFetchError(null);
    try {
      const response = await fetch(`/api/v1/reviews?mode=${mode}&limit=${SESSION_LIMIT}`);
      const data = await response.json();
      if (data.status === "success") {
        setItems(data.data.items);
        return true;
      } else {
        setFetchError(data.data?.error || "Failed to load items");
        return false;
      }
    } catch {
      setFetchError("Failed to load items. Please try again.");
      return false;
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleStartSession = async () => {
    const success = await fetchItems(selectedMode);
    if (!success) return;

    setSessionStarted(true);
    setCurrentItemIndex(0);
    setSelectedOptionId(null);
    setFlashcardFlipped(false);
    setSelfAssessment(null);
    setShowResult(false);
    setSessionResults({ correct: 0, incorrect: 0, movedUp: 0, needsReview: 0 });
  };

  const handleSubmit = async () => {
    if (!currentItem) return;

    // For questions, require option selection
    if (currentItem.itemType === "question" && !selectedOptionId) return;
    // For flashcards, require self-assessment
    if (currentItem.itemType === "flashcard" && selfAssessment === null) return;

    setIsSubmitting(true);
    setSubmitError(null);

    let isCorrect: boolean;

    if (currentItem.itemType === "question" && currentItem.question) {
      const selectedOption = currentItem.question.options.find(
        (option) => option.id === selectedOptionId
      );
      if (!selectedOption) {
        setIsSubmitting(false);
        return;
      }
      isCorrect = selectedOption.isCorrect;
    } else {
      // Flashcard - use self-assessment
      isCorrect = selfAssessment === true;
    }

    // Random mode: show feedback but don't update progress
    if (selectedMode === "random") {
      setSessionResults((prev) => ({
        ...prev,
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
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
          reviewableItemId: currentItem.reviewableItemId,
          isCorrect,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        const newBoxLevel = data.data?.progress?.boxLevel ?? previousBoxLevel;

        // Update session results
        setSessionResults((prev) => {
          const newResults = { ...prev };
          if (isCorrect) {
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
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      setSelectedOptionId(null);
      setFlashcardFlipped(false);
      setSelfAssessment(null);
      setShowResult(false);
    }
  };

  const handleFinish = () => {
    setCurrentItemIndex(items.length); // Trigger session complete
  };

  const handleContinue = async () => {
    const success = await fetchItems(selectedMode);
    if (!success) return;

    setCurrentItemIndex(0);
    setSelectedOptionId(null);
    setFlashcardFlipped(false);
    setSelfAssessment(null);
    setShowResult(false);
    // Keep cumulative results
  };

  const handleBackToModeSelection = () => {
    // Reset client state
    setSessionStarted(false);
    setItems([]);
    setCurrentItemIndex(0);
    setSelectedOptionId(null);
    setFlashcardFlipped(false);
    setSelfAssessment(null);
    setShowResult(false);
    setSessionResults({ correct: 0, incorrect: 0, movedUp: 0, needsReview: 0 });
    setFetchError(null);
    setSubmitError(null);
    // Refresh server data (stats)
    router.refresh();
  };

  // Mode selection screen
  if (!sessionStarted) {
    // No items at all - empty state
    if (studyModeStats.totalCount === 0) {
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
              Complete some video quizzes or create flashcards to add items to your spaced repetition system.
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
      <>
        <ReviewModeSelectorTour />
        <StudyModeSelector
          stats={studyModeStats}
          progressStats={progressStats}
          selectedMode={selectedMode}
          onModeSelect={setSelectedMode}
          onStartSession={handleStartSession}
          isLoading={isLoadingItems}
          error={fetchError}
        />
      </>
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
            ...(hasMoreItems
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
              <Button onClick={() => fetchItems(selectedMode)} variant="outline">
                Try Again
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">Loading items...</p>
          )}
        </div>
      </div>
    );
  }

  // Render based on item type
  const renderQuestionReview = () => {
    if (!currentItem.question) return null;

    const selectedOption = currentItem.question.options.find(
      (option) => option.id === selectedOptionId
    );

    return (
      <>
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
      </>
    );
  };

  const renderFlashcardReview = () => {
    if (!currentItem.flashcard) return null;

    return (
      <div className="space-y-4">
        {/* Flashcard */}
        <div
          className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
            flashcardFlipped
              ? "bg-primary/5 border-primary"
              : "bg-card border-border hover:border-primary/50"
          }`}
          onClick={() => !showResult && setFlashcardFlipped(!flashcardFlipped)}
        >
          <div className="text-center min-h-[200px] flex flex-col items-center justify-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              {flashcardFlipped ? "Back" : "Front"}
            </p>
            <p className="text-xl font-medium text-foreground">
              {flashcardFlipped ? currentItem.flashcard.back : currentItem.flashcard.front}
            </p>
            {!flashcardFlipped && !showResult && (
              <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Click to flip
              </p>
            )}
          </div>
        </div>

        {/* Self-assessment buttons (only after flipping, before result) */}
        {flashcardFlipped && !showResult && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Did you know the answer?
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant={selfAssessment === false ? "destructive" : "outline"}
                onClick={() => setSelfAssessment(false)}
                className="flex-1 max-w-32"
              >
                Not Yet
              </Button>
              <Button
                variant={selfAssessment === true ? "default" : "outline"}
                onClick={() => setSelfAssessment(true)}
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
  };

  // Review interface
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ReviewSessionTour />
      {/* Progress */}
      <div data-tour-id={TOUR_TARGETS.quizProgress}>
        <QuizProgress current={currentItemIndex + 1} total={items.length} />
      </div>

      {/* Video source badge */}
      <a
        href={`/dashboard/video/${currentItem.video.publicId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <Video className="w-4 h-4" />
        <span className="truncate hover:underline">{currentItem.video.title}</span>
      </a>

      {/* Item type badge */}
      <div className="flex items-center gap-2">
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            currentItem.itemType === "question"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
          }`}
        >
          {currentItem.itemType === "question" ? "Question" : "Flashcard"}
        </span>
      </div>

      {/* Content based on item type */}
      <div data-tour-id={TOUR_TARGETS.reviewContent}>
        {currentItem.itemType === "question" ? renderQuestionReview() : renderFlashcardReview()}
      </div>

      {/* Submit error message */}
      {submitError && (
        <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3" data-tour-id={TOUR_TARGETS.actionButtons}>
        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={
              (currentItem.itemType === "question" && !selectedOptionId) ||
              (currentItem.itemType === "flashcard" && selfAssessment === null) ||
              isSubmitting
            }
            size="lg"
          >
            {isSubmitting
              ? "Checking..."
              : currentItem.itemType === "question"
              ? "Check Answer"
              : "Submit"}
          </Button>
        ) : (
          <>
            {!isLastItem ? (
              <Button onClick={handleNext} size="lg">
                Next →
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
