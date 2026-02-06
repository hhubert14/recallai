import { useState } from "react";
import type {
  Suggestion,
  QuestionOptionSuggestion,
} from "@/clean-architecture/domain/services/suggestion-generator.interface";
import { STUDY_SET_ITEM_LIMIT } from "@/lib/constants/study-set";

export type EditedSuggestionContent = {
  front?: string;
  back?: string;
  questionText?: string;
  options?: QuestionOptionSuggestion[];
};

interface FlashcardResponse {
  id: number;
  videoId: number | null;
  userId: string;
  front: string;
  back: string;
  createdAt: string;
}

interface QuestionResponse {
  id: number;
  videoId: number | null;
  questionText: string;
  options: {
    id: number;
    optionText: string;
    isCorrect: boolean;
    explanation: string | null;
  }[];
}

interface UseAISuggestionReviewOptions {
  studySetPublicId: string;
  onFlashcardAdded: (flashcard: FlashcardResponse) => void;
  onQuestionAdded: (question: QuestionResponse) => void;
}

export function useAISuggestionReview({
  studySetPublicId,
  onFlashcardAdded,
  onQuestionAdded,
}: UseAISuggestionReviewOptions) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [initialCount, setInitialCount] = useState(0);
  const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(
    null
  );
  const [editedContent, setEditedContent] = useState<EditedSuggestionContent>(
    {}
  );
  const [acceptingIds, setAcceptingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const accept = async (suggestion: Suggestion) => {
    setAcceptingIds((prev) => new Set([...prev, suggestion.tempId]));
    setError(null);

    try {
      if (suggestion.itemType === "flashcard") {
        const response = await fetch(
          `/api/v1/study-sets/${studySetPublicId}/flashcards`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              front: suggestion.front,
              back: suggestion.back,
            }),
          }
        );

        const data = await response.json();
        if (response.ok && data.status === "success") {
          onFlashcardAdded(data.data.flashcard);
          setSuggestions((prev) =>
            prev.filter((s) => s.tempId !== suggestion.tempId)
          );
        } else {
          setError(
            data.data?.error || "Failed to add flashcard. Please try again."
          );
        }
      } else {
        const response = await fetch(
          `/api/v1/study-sets/${studySetPublicId}/questions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              questionText: suggestion.questionText,
              options: suggestion.options,
            }),
          }
        );

        const data = await response.json();
        if (response.ok && data.status === "success") {
          onQuestionAdded(data.data.question);
          setSuggestions((prev) =>
            prev.filter((s) => s.tempId !== suggestion.tempId)
          );
        } else {
          setError(
            data.data?.error || "Failed to add question. Please try again."
          );
        }
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setAcceptingIds((prev) => {
        const next = new Set(prev);
        next.delete(suggestion.tempId);
        return next;
      });
    }
  };

  const reject = (tempId: string) => {
    setSuggestions((prev) => prev.filter((s) => s.tempId !== tempId));
  };

  const startEdit = (suggestion: Suggestion) => {
    setEditingSuggestionId(suggestion.tempId);
    if (suggestion.itemType === "flashcard") {
      setEditedContent({
        front: suggestion.front,
        back: suggestion.back,
      });
    } else {
      setEditedContent({
        questionText: suggestion.questionText,
        options: suggestion.options,
      });
    }
  };

  const saveEdit = () => {
    if (!editingSuggestionId) return;

    setSuggestions((prev) =>
      prev.map((s) => {
        if (s.tempId !== editingSuggestionId) return s;

        if (s.itemType === "flashcard") {
          return {
            ...s,
            front: editedContent.front || s.front,
            back: editedContent.back || s.back,
          };
        } else {
          return {
            ...s,
            questionText: editedContent.questionText || s.questionText,
            options: editedContent.options || s.options,
          };
        }
      })
    );

    setEditingSuggestionId(null);
    setEditedContent({});
  };

  const cancelEdit = () => {
    setEditingSuggestionId(null);
    setEditedContent({});
  };

  const acceptAll = async () => {
    // Filter out suggestions that are already being accepted to avoid duplicates
    const suggestionsToAccept = suggestions.filter(
      (s) => !acceptingIds.has(s.tempId)
    );

    if (suggestionsToAccept.length === 0) return;

    setError(null);

    try {
      const countResponse = await fetch(
        `/api/v1/study-sets/${studySetPublicId}/count`
      );
      const countData = await countResponse.json();

      if (!countResponse.ok || countData.status !== "success") {
        setError("Failed to check study set capacity. Please try again.");
        return;
      }

      const currentCount = countData.data.count;
      const remaining = STUDY_SET_ITEM_LIMIT - currentCount;

      if (remaining <= 0) {
        setError(
          `Study set has reached the maximum limit of ${STUDY_SET_ITEM_LIMIT} items. Remove some items to add more.`
        );
        return;
      }

      const toAccept = suggestionsToAccept.slice(0, remaining);
      const cannotAccept = suggestionsToAccept.length - toAccept.length;

      await Promise.all(toAccept.map((suggestion) => accept(suggestion)));

      if (cannotAccept > 0) {
        setError(
          `Added ${toAccept.length} items. ${cannotAccept} could not be added (limit of ${STUDY_SET_ITEM_LIMIT} reached).`
        );
      }
    } catch {
      setError("An error occurred while checking capacity. Please try again.");
    }
  };

  const rejectAll = () => {
    setSuggestions([]);
  };

  const startReview = (newSuggestions: Suggestion[]) => {
    setSuggestions(newSuggestions);
    setInitialCount(newSuggestions.length);
  };

  const reset = () => {
    setSuggestions([]);
    setInitialCount(0);
    setEditingSuggestionId(null);
    setEditedContent({});
    setAcceptingIds(new Set());
    setError(null);
  };

  const isAccepting = (tempId: string) => acceptingIds.has(tempId);

  const reviewedCount = initialCount - suggestions.length;

  return {
    suggestions,
    error,
    editState: {
      tempId: editingSuggestionId,
      content: editedContent,
      setContent: setEditedContent,
    },
    isAccepting,
    reviewedCount,
    initialCount,
    accept,
    reject,
    startEdit,
    saveEdit,
    cancelEdit,
    acceptAll,
    rejectAll,
    startReview,
    reset,
  };
}
