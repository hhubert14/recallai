"use client";

import { useState } from "react";
import {
  StudyMode,
  ReviewItemApiResponse,
} from "@/clean-architecture/use-cases/review/types";
import { StudyModeStats } from "@/app/dashboard/review/_components/StudyModeSelector";

export interface SessionResults {
  correct: number;
  incorrect: number;
  movedUp: number;
  needsReview: number;
}

export interface UseReviewSessionOptions {
  studyModeStats: StudyModeStats;
  onRefresh: () => void;
  studySetPublicId?: string;
}

export interface UseReviewSessionReturn {
  // Mode selection
  selectedMode: StudyMode;
  setSelectedMode: (mode: StudyMode) => void;
  sessionStarted: boolean;
  isLoadingItems: boolean;

  // Review state
  items: ReviewItemApiResponse[];
  currentItem: ReviewItemApiResponse | undefined;
  currentItemIndex: number;
  selectedOptionId: number | null;
  setSelectedOptionId: (id: number | null) => void;
  flashcardFlipped: boolean;
  setFlashcardFlipped: (flipped: boolean) => void;
  selfAssessment: boolean | null;
  setSelfAssessment: (val: boolean | null) => void;
  showResult: boolean;
  isSubmitting: boolean;

  // Errors
  fetchError: string | null;
  submitError: string | null;

  // Session results
  sessionResults: SessionResults;

  // Computed
  isSessionComplete: boolean;
  isLastItem: boolean;
  hasMoreItems: boolean;

  // Handlers
  handleStartSession: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleNext: () => void;
  handleFinish: () => void;
  handleContinue: () => Promise<void>;
  handleBackToModeSelection: () => void;
  fetchItems: (mode: StudyMode) => Promise<boolean>;
}

const SESSION_LIMIT = 10;

function getInitialMode(stats: StudyModeStats): StudyMode {
  if (stats.dueCount > 0) return "due";
  if (stats.newCount > 0) return "new";
  return "random";
}

export function useReviewSession({
  studyModeStats,
  onRefresh,
  studySetPublicId,
}: UseReviewSessionOptions): UseReviewSessionReturn {
  // Mode selection state
  const [selectedMode, setSelectedMode] = useState<StudyMode>(
    getInitialMode(studyModeStats)
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

  // Computed values
  const currentItem = items[currentItemIndex];
  const isSessionComplete = sessionStarted && currentItemIndex >= items.length;
  const isLastItem = currentItemIndex === items.length - 1;
  const hasMoreItems = items.length >= SESSION_LIMIT;

  const fetchItems = async (mode: StudyMode): Promise<boolean> => {
    setIsLoadingItems(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({
        mode,
        limit: String(SESSION_LIMIT),
      });
      if (studySetPublicId) {
        params.set("studySetPublicId", studySetPublicId);
      }
      const response = await fetch(`/api/v1/reviews?${params.toString()}`);
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
      const response = await fetch("/api/v1/reviews/submit-review-answer", {
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
      setSubmitError(
        "Failed to save your answer. Your progress may not be recorded."
      );
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
    onRefresh();
  };

  return {
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
  };
}
