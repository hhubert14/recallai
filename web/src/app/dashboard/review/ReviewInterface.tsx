"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuizProgress } from "@/components/quiz";
import { StudyModeSelector, StudyModeStats, ProgressStats } from "./StudyModeSelector";
import { BookOpen, Video } from "lucide-react";
import { TOUR_TARGETS } from "@/components/tour/tour-constants";
import { ReviewModeSelectorTour } from "./ReviewModeSelectorTour";
import { ReviewSessionTour } from "./ReviewSessionTour";
import { useReviewSession } from "@/hooks/useReviewSession";
import { QuestionReview } from "./QuestionReview";
import { FlashcardReview } from "./FlashcardReview";
import { EmptyReviewState } from "./EmptyReviewState";
import { SessionComplete } from "./SessionComplete";

interface ReviewInterfaceProps {
  studyModeStats: StudyModeStats;
  progressStats: ProgressStats;
}

export function ReviewInterface({
  studyModeStats,
  progressStats,
}: ReviewInterfaceProps) {
  const router = useRouter();

  const {
    // Mode selection
    selectedMode,
    setSelectedMode,
    sessionStarted,
    isLoadingItems,

    // Review state
    items,
    currentItem,
    currentItemIndex,
    selectedOptionId,
    setSelectedOptionId,
    flashcardFlipped,
    setFlashcardFlipped,
    selfAssessment,
    setSelfAssessment,
    showResult,
    isSubmitting,

    // Errors
    fetchError,
    submitError,

    // Session results
    sessionResults,

    // Computed
    isSessionComplete,
    isLastItem,
    hasMoreItems,

    // Handlers
    handleStartSession,
    handleSubmit,
    handleNext,
    handleFinish,
    handleContinue,
    handleBackToModeSelection,
    fetchItems,
  } = useReviewSession({
    studyModeStats,
    onRefresh: () => router.refresh(),
  });

  // Mode selection screen
  if (!sessionStarted) {
    // No items at all - empty state
    if (studyModeStats.totalCount === 0) {
      return (
        <EmptyReviewState
          onNavigateToDashboard={() => router.push("/dashboard")}
        />
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
      <SessionComplete
        sessionResults={sessionResults}
        hasMoreItems={hasMoreItems}
        onBackToModeSelection={handleBackToModeSelection}
        onContinue={handleContinue}
      />
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

  // Review interface
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ReviewSessionTour />
      {/* Progress */}
      <div data-tour-id={TOUR_TARGETS.quizProgress}>
        <QuizProgress current={currentItemIndex + 1} total={items.length} />
      </div>

      {/* Study set source badge */}
      <a
        href={`/dashboard/study-set/${currentItem.studySet.publicId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        {currentItem.video ? (
          <Video className="w-4 h-4" />
        ) : (
          <BookOpen className="w-4 h-4" />
        )}
        <span className="truncate hover:underline">{currentItem.studySet.name}</span>
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
        {currentItem.itemType === "question" && currentItem.question ? (
          <QuestionReview
            question={currentItem.question}
            selectedOptionId={selectedOptionId}
            onSelectOption={setSelectedOptionId}
            showResult={showResult}
          />
        ) : currentItem.flashcard ? (
          <FlashcardReview
            flashcard={currentItem.flashcard}
            isFlipped={flashcardFlipped}
            onFlip={() => setFlashcardFlipped(!flashcardFlipped)}
            selfAssessment={selfAssessment}
            onSelfAssess={setSelfAssessment}
            showResult={showResult}
          />
        ) : null}
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
