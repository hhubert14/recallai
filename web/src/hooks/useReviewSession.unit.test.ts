"use client";

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useReviewSession } from "./useReviewSession";
import { StudyModeStats } from "@/app/dashboard/review/StudyModeSelector";
import { ReviewItemApiResponse } from "@/clean-architecture/use-cases/review/types";

// Test data factories
function createMockStudyModeStats(
  overrides: Partial<StudyModeStats> = {}
): StudyModeStats {
  return {
    dueCount: 5,
    newCount: 3,
    totalCount: 10,
    ...overrides,
  };
}

function createMockQuestionItem(
  overrides: Partial<ReviewItemApiResponse> = {}
): ReviewItemApiResponse {
  return {
    reviewableItemId: 1,
    itemType: "question",
    progress: {
      id: 1,
      boxLevel: 2,
      nextReviewDate: "2025-01-23",
      timesCorrect: 3,
      timesIncorrect: 1,
      lastReviewedAt: "2025-01-20T10:00:00Z",
    },
    question: {
      id: 10,
      questionText: "What is TypeScript?",
      options: [
        {
          id: 1,
          optionText: "A programming language",
          isCorrect: true,
          explanation: "Correct!",
        },
        {
          id: 2,
          optionText: "A database",
          isCorrect: false,
          explanation: null,
        },
        {
          id: 3,
          optionText: "A framework",
          isCorrect: false,
          explanation: null,
        },
        { id: 4, optionText: "An OS", isCorrect: false, explanation: null },
      ],
    },
    video: {
      id: 1,
      title: "TypeScript Tutorial",
    },
    studySet: {
      id: 1,
      publicId: "study-set-abc-123",
      name: "TypeScript Study Set",
    },
    ...overrides,
  };
}

function createMockFlashcardItem(
  overrides: Partial<ReviewItemApiResponse> = {}
): ReviewItemApiResponse {
  return {
    reviewableItemId: 2,
    itemType: "flashcard",
    progress: null,
    flashcard: {
      id: 20,
      front: "What is React?",
      back: "A JavaScript library for building UIs",
    },
    video: {
      id: 1,
      title: "React Basics",
    },
    studySet: {
      id: 2,
      publicId: "study-set-def-456",
      name: "React Study Set",
    },
    ...overrides,
  };
}

// Mock fetch helpers
function mockFetchSuccess(items: ReviewItemApiResponse[]) {
  return vi.fn().mockResolvedValue({
    json: () =>
      Promise.resolve({
        status: "success",
        data: { items },
      }),
  });
}

function mockFetchError(errorMessage: string) {
  return vi.fn().mockResolvedValue({
    json: () =>
      Promise.resolve({
        status: "fail",
        data: { error: errorMessage },
      }),
  });
}

function mockSubmitAnswerSuccess(boxLevel: number = 3) {
  return vi.fn().mockImplementation((url: string) => {
    if (url.includes("submit-review-answer")) {
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            status: "success",
            data: { progress: { boxLevel } },
          }),
      });
    }
    // Default for fetch items
    return Promise.resolve({
      json: () =>
        Promise.resolve({
          status: "success",
          data: { items: [createMockQuestionItem()] },
        }),
    });
  });
}

describe("useReviewSession", () => {
  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial mode selection", () => {
    it("defaults to 'due' mode when dueCount > 0", () => {
      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats({
            dueCount: 5,
            newCount: 3,
          }),
          onRefresh: mockOnRefresh,
        })
      );

      expect(result.current.selectedMode).toBe("due");
    });

    it("defaults to 'new' mode when dueCount is 0 but newCount > 0", () => {
      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats({
            dueCount: 0,
            newCount: 3,
          }),
          onRefresh: mockOnRefresh,
        })
      );

      expect(result.current.selectedMode).toBe("new");
    });

    it("defaults to 'random' mode when both dueCount and newCount are 0", () => {
      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats({
            dueCount: 0,
            newCount: 0,
          }),
          onRefresh: mockOnRefresh,
        })
      );

      expect(result.current.selectedMode).toBe("random");
    });
  });

  describe("handleStartSession", () => {
    it("fetches items and starts session on success", async () => {
      const mockItems = [createMockQuestionItem()];
      global.fetch = mockFetchSuccess(mockItems);

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      expect(result.current.sessionStarted).toBe(true);
      expect(result.current.items).toEqual(mockItems);
      expect(result.current.currentItemIndex).toBe(0);
      expect(result.current.fetchError).toBeNull();
    });

    it("sets fetchError on failure and does not start session", async () => {
      global.fetch = mockFetchError("Failed to load items");

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      expect(result.current.sessionStarted).toBe(false);
      expect(result.current.fetchError).toBe("Failed to load items");
    });

    it("resets session state when starting new session", async () => {
      const mockItems = [createMockQuestionItem()];
      global.fetch = mockFetchSuccess(mockItems);

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      // Start session
      await act(async () => {
        await result.current.handleStartSession();
      });

      // Modify some state
      act(() => {
        result.current.setSelectedOptionId(1);
        result.current.setFlashcardFlipped(true);
        result.current.setSelfAssessment(true);
      });

      // Start new session
      await act(async () => {
        await result.current.handleStartSession();
      });

      expect(result.current.selectedOptionId).toBeNull();
      expect(result.current.flashcardFlipped).toBe(false);
      expect(result.current.selfAssessment).toBeNull();
      expect(result.current.showResult).toBe(false);
    });
  });

  describe("handleSubmit for questions", () => {
    it("submits answer and updates session results for correct answer", async () => {
      global.fetch = mockSubmitAnswerSuccess(3);

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      // Start session
      await act(async () => {
        await result.current.handleStartSession();
      });

      // Select correct option (id: 1 is correct)
      act(() => {
        result.current.setSelectedOptionId(1);
      });

      // Submit answer
      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.showResult).toBe(true);
      expect(result.current.sessionResults.correct).toBe(1);
      expect(result.current.sessionResults.movedUp).toBe(1); // Box 2 -> 3
    });

    it("updates session results for incorrect answer", async () => {
      global.fetch = mockSubmitAnswerSuccess(1);

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      // Select incorrect option (id: 2 is incorrect)
      act(() => {
        result.current.setSelectedOptionId(2);
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.showResult).toBe(true);
      expect(result.current.sessionResults.incorrect).toBe(1);
      expect(result.current.sessionResults.needsReview).toBe(1);
    });

    it("does not submit if no option is selected", async () => {
      global.fetch = mockFetchSuccess([createMockQuestionItem()]);

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.showResult).toBe(false);
    });
  });

  describe("handleSubmit for flashcards", () => {
    it("submits self-assessment as correct", async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("submit-review-answer")) {
          return Promise.resolve({
            json: () =>
              Promise.resolve({
                status: "success",
                data: { progress: { boxLevel: 1 } },
              }),
          });
        }
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              status: "success",
              data: { items: [createMockFlashcardItem()] },
            }),
        });
      });

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      act(() => {
        result.current.setSelfAssessment(true);
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.showResult).toBe(true);
      expect(result.current.sessionResults.correct).toBe(1);
    });

    it("does not submit if selfAssessment is null", async () => {
      global.fetch = mockFetchSuccess([createMockFlashcardItem()]);

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.showResult).toBe(false);
    });
  });

  describe("random mode", () => {
    it("skips API submission in random mode", async () => {
      const fetchMock = mockFetchSuccess([createMockQuestionItem()]);
      global.fetch = fetchMock;

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats({
            dueCount: 0,
            newCount: 0,
          }),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      act(() => {
        result.current.setSelectedOptionId(1);
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      // Should only have called fetch once (for fetching items)
      const submitCalls = fetchMock.mock.calls.filter((call) =>
        call[0]?.includes?.("submit-review-answer")
      );
      expect(submitCalls.length).toBe(0);

      // Should still update local session results
      expect(result.current.sessionResults.correct).toBe(1);
      expect(result.current.showResult).toBe(true);
    });
  });

  describe("handleNext", () => {
    it("advances to next item and resets state", async () => {
      const mockItems = [
        createMockQuestionItem({ reviewableItemId: 1 }),
        createMockQuestionItem({ reviewableItemId: 2 }),
      ];
      global.fetch = mockFetchSuccess(mockItems);

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      act(() => {
        result.current.setSelectedOptionId(1);
        result.current.setFlashcardFlipped(true);
        result.current.setSelfAssessment(true);
      });

      act(() => {
        result.current.handleNext();
      });

      expect(result.current.currentItemIndex).toBe(1);
      expect(result.current.selectedOptionId).toBeNull();
      expect(result.current.flashcardFlipped).toBe(false);
      expect(result.current.selfAssessment).toBeNull();
      expect(result.current.showResult).toBe(false);
    });

    it("does not advance past last item", async () => {
      const mockItems = [createMockQuestionItem()];
      global.fetch = mockFetchSuccess(mockItems);

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      act(() => {
        result.current.handleNext();
      });

      expect(result.current.currentItemIndex).toBe(0);
    });
  });

  describe("handleFinish", () => {
    it("sets currentItemIndex to items.length to trigger session complete", async () => {
      const mockItems = [createMockQuestionItem()];
      global.fetch = mockFetchSuccess(mockItems);

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      act(() => {
        result.current.handleFinish();
      });

      expect(result.current.currentItemIndex).toBe(mockItems.length);
      expect(result.current.isSessionComplete).toBe(true);
    });
  });

  describe("handleContinue", () => {
    it("fetches new items and resets index while keeping results", async () => {
      const mockItems = [createMockQuestionItem()];
      global.fetch = mockFetchSuccess(mockItems);

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      // Simulate completing items (manually set for test)
      act(() => {
        result.current.handleFinish();
      });

      // Continue with new items
      await act(async () => {
        await result.current.handleContinue();
      });

      expect(result.current.currentItemIndex).toBe(0);
      expect(result.current.selectedOptionId).toBeNull();
      expect(result.current.showResult).toBe(false);
    });
  });

  describe("handleBackToModeSelection", () => {
    it("resets all state and calls onRefresh", async () => {
      const mockItems = [createMockQuestionItem()];
      global.fetch = mockFetchSuccess(mockItems);

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      act(() => {
        result.current.handleBackToModeSelection();
      });

      expect(result.current.sessionStarted).toBe(false);
      expect(result.current.items).toEqual([]);
      expect(result.current.currentItemIndex).toBe(0);
      expect(result.current.selectedOptionId).toBeNull();
      expect(result.current.flashcardFlipped).toBe(false);
      expect(result.current.selfAssessment).toBeNull();
      expect(result.current.showResult).toBe(false);
      expect(result.current.sessionResults).toEqual({
        correct: 0,
        incorrect: 0,
        movedUp: 0,
        needsReview: 0,
      });
      expect(result.current.fetchError).toBeNull();
      expect(result.current.submitError).toBeNull();
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  describe("computed properties", () => {
    it("isSessionComplete is true when currentItemIndex >= items.length and session started", async () => {
      const mockItems = [createMockQuestionItem()];
      global.fetch = mockFetchSuccess(mockItems);

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      expect(result.current.isSessionComplete).toBe(false);

      await act(async () => {
        await result.current.handleStartSession();
      });

      expect(result.current.isSessionComplete).toBe(false);

      act(() => {
        result.current.handleFinish();
      });

      expect(result.current.isSessionComplete).toBe(true);
    });

    it("isLastItem is true when on the last item", async () => {
      const mockItems = [
        createMockQuestionItem({ reviewableItemId: 1 }),
        createMockQuestionItem({ reviewableItemId: 2 }),
      ];
      global.fetch = mockFetchSuccess(mockItems);

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      expect(result.current.isLastItem).toBe(false);

      act(() => {
        result.current.handleNext();
      });

      expect(result.current.isLastItem).toBe(true);
    });

    it("hasMoreItems is true when items.length >= SESSION_LIMIT", async () => {
      const mockItems = Array.from({ length: 10 }, (_, i) =>
        createMockQuestionItem({ reviewableItemId: i + 1 })
      );
      global.fetch = mockFetchSuccess(mockItems);

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      expect(result.current.hasMoreItems).toBe(true);
    });

    it("hasMoreItems is false when items.length < SESSION_LIMIT", async () => {
      const mockItems = [createMockQuestionItem()];
      global.fetch = mockFetchSuccess(mockItems);

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      expect(result.current.hasMoreItems).toBe(false);
    });

    it("currentItem returns the item at currentItemIndex", async () => {
      const mockItems = [
        createMockQuestionItem({ reviewableItemId: 1 }),
        createMockQuestionItem({ reviewableItemId: 2 }),
      ];
      global.fetch = mockFetchSuccess(mockItems);

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      expect(result.current.currentItem?.reviewableItemId).toBe(1);

      act(() => {
        result.current.handleNext();
      });

      expect(result.current.currentItem?.reviewableItemId).toBe(2);
    });
  });

  describe("error handling", () => {
    it("sets submitError on submission failure", async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("submit-review-answer")) {
          return Promise.resolve({
            json: () =>
              Promise.resolve({
                status: "fail",
                data: { error: "Failed to save answer" },
              }),
          });
        }
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              status: "success",
              data: { items: [createMockQuestionItem()] },
            }),
        });
      });

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      act(() => {
        result.current.setSelectedOptionId(1);
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.submitError).toBe("Failed to save answer");
      expect(result.current.showResult).toBe(true);
    });

    it("handles network error on submission", async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("submit-review-answer")) {
          return Promise.reject(new Error("Network error"));
        }
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              status: "success",
              data: { items: [createMockQuestionItem()] },
            }),
        });
      });

      const { result } = renderHook(() =>
        useReviewSession({
          studyModeStats: createMockStudyModeStats(),
          onRefresh: mockOnRefresh,
        })
      );

      await act(async () => {
        await result.current.handleStartSession();
      });

      act(() => {
        result.current.setSelectedOptionId(1);
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.submitError).toBe(
        "Failed to save your answer. Your progress may not be recorded."
      );
    });
  });
});
