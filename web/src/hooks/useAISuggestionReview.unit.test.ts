import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAISuggestionReview } from "./useAISuggestionReview";
import type {
  Suggestion,
  FlashcardSuggestion,
  QuestionSuggestion,
} from "@/clean-architecture/domain/services/suggestion-generator.interface";
import { STUDY_SET_ITEM_LIMIT } from "@/app/dashboard/study-set/[publicId]/_components/types";

// Test data factories
function createFlashcardSuggestion(
  overrides: Partial<FlashcardSuggestion> = {}
): FlashcardSuggestion {
  return {
    tempId: "fc-1",
    itemType: "flashcard",
    front: "What is React?",
    back: "A JavaScript library for building UIs",
    ...overrides,
  };
}

function createQuestionSuggestion(
  overrides: Partial<QuestionSuggestion> = {}
): QuestionSuggestion {
  return {
    tempId: "q-1",
    itemType: "question",
    questionText: "What is TypeScript?",
    options: [
      {
        optionText: "A programming language",
        isCorrect: true,
        explanation: "Correct!",
      },
      { optionText: "A database", isCorrect: false, explanation: "No" },
      { optionText: "A framework", isCorrect: false, explanation: "No" },
      { optionText: "An OS", isCorrect: false, explanation: "No" },
    ],
    ...overrides,
  };
}

function mockFetchJsonResponse(data: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  });
}

describe("useAISuggestionReview", () => {
  const defaultOptions = {
    studySetPublicId: "test-study-set-123",
    onFlashcardAdded: vi.fn(),
    onQuestionAdded: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("starts with empty suggestions and no error", () => {
      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      expect(result.current.suggestions).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.editState.tempId).toBeNull();
      expect(result.current.editState.content).toEqual({});
      expect(result.current.reviewedCount).toBe(0);
      expect(result.current.initialCount).toBe(0);
    });
  });

  describe("startReview", () => {
    it("loads suggestions and sets initial count", () => {
      const suggestions: Suggestion[] = [
        createFlashcardSuggestion({ tempId: "fc-1" }),
        createQuestionSuggestion({ tempId: "q-1" }),
      ];

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview(suggestions);
      });

      expect(result.current.suggestions).toEqual(suggestions);
      expect(result.current.initialCount).toBe(2);
      expect(result.current.reviewedCount).toBe(0);
    });
  });

  describe("accept", () => {
    it("calls flashcards API and removes suggestion on success", async () => {
      const flashcard = createFlashcardSuggestion({ tempId: "fc-1" });
      const mockResponse = {
        status: "success",
        data: {
          flashcard: {
            id: 1,
            videoId: null,
            userId: "user-1",
            front: "What is React?",
            back: "A JavaScript library for building UIs",
            createdAt: "2025-01-01",
          },
        },
      };

      global.fetch = vi
        .fn()
        .mockReturnValue(mockFetchJsonResponse(mockResponse));

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview([flashcard]);
      });

      await act(async () => {
        await result.current.accept(flashcard);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/v1/study-sets/${defaultOptions.studySetPublicId}/flashcards`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            front: flashcard.front,
            back: flashcard.back,
          }),
        })
      );
      expect(defaultOptions.onFlashcardAdded).toHaveBeenCalledWith(
        mockResponse.data.flashcard
      );
      expect(result.current.suggestions).toEqual([]);
    });

    it("calls questions API and removes suggestion on success", async () => {
      const question = createQuestionSuggestion({ tempId: "q-1" });
      const mockResponse = {
        status: "success",
        data: {
          question: {
            id: 1,
            videoId: null,
            questionText: "What is TypeScript?",
            options: [],
          },
        },
      };

      global.fetch = vi
        .fn()
        .mockReturnValue(mockFetchJsonResponse(mockResponse));

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview([question]);
      });

      await act(async () => {
        await result.current.accept(question);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/v1/study-sets/${defaultOptions.studySetPublicId}/questions`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            questionText: question.questionText,
            options: question.options,
          }),
        })
      );
      expect(defaultOptions.onQuestionAdded).toHaveBeenCalledWith(
        mockResponse.data.question
      );
      expect(result.current.suggestions).toEqual([]);
    });

    it("sets error and keeps suggestion on API failure", async () => {
      const flashcard = createFlashcardSuggestion({ tempId: "fc-1" });
      const mockResponse = {
        status: "fail",
        data: { error: "Failed to add flashcard. Please try again." },
      };

      global.fetch = vi
        .fn()
        .mockReturnValue(mockFetchJsonResponse(mockResponse, false));

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview([flashcard]);
      });

      await act(async () => {
        await result.current.accept(flashcard);
      });

      expect(result.current.error).toBe(
        "Failed to add flashcard. Please try again."
      );
      expect(result.current.suggestions).toHaveLength(1);
      expect(defaultOptions.onFlashcardAdded).not.toHaveBeenCalled();
    });

    it("sets error on network failure", async () => {
      const flashcard = createFlashcardSuggestion({ tempId: "fc-1" });

      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview([flashcard]);
      });

      await act(async () => {
        await result.current.accept(flashcard);
      });

      expect(result.current.error).toBe("An error occurred. Please try again.");
      expect(result.current.suggestions).toHaveLength(1);
    });
  });

  describe("isAccepting", () => {
    it("returns true during API call and false after", async () => {
      const flashcard = createFlashcardSuggestion({ tempId: "fc-1" });
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      global.fetch = vi.fn().mockReturnValue(pendingPromise);

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview([flashcard]);
      });

      // Start accept but don't await - check isAccepting during call
      let acceptPromise: Promise<void>;
      act(() => {
        acceptPromise = result.current.accept(flashcard);
      });

      expect(result.current.isAccepting("fc-1")).toBe(true);

      // Resolve the fetch
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "success",
              data: { flashcard: { id: 1 } },
            }),
        });
        await acceptPromise;
      });

      expect(result.current.isAccepting("fc-1")).toBe(false);
    });
  });

  describe("reject", () => {
    it("removes suggestion from list", () => {
      const fc1 = createFlashcardSuggestion({ tempId: "fc-1" });
      const fc2 = createFlashcardSuggestion({
        tempId: "fc-2",
        front: "Another card",
      });

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview([fc1, fc2]);
      });

      act(() => {
        result.current.reject("fc-1");
      });

      expect(result.current.suggestions).toEqual([fc2]);
    });
  });

  describe("startEdit", () => {
    it("sets edit state for flashcard", () => {
      const flashcard = createFlashcardSuggestion({
        tempId: "fc-1",
        front: "Front text",
        back: "Back text",
      });

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview([flashcard]);
      });

      act(() => {
        result.current.startEdit(flashcard);
      });

      expect(result.current.editState.tempId).toBe("fc-1");
      expect(result.current.editState.content).toEqual({
        front: "Front text",
        back: "Back text",
      });
    });

    it("sets edit state for question", () => {
      const question = createQuestionSuggestion({ tempId: "q-1" });

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview([question]);
      });

      act(() => {
        result.current.startEdit(question);
      });

      expect(result.current.editState.tempId).toBe("q-1");
      expect(result.current.editState.content).toEqual({
        questionText: question.questionText,
        options: question.options,
      });
    });
  });

  describe("saveEdit", () => {
    it("updates flashcard suggestion in list and clears edit state", () => {
      const flashcard = createFlashcardSuggestion({
        tempId: "fc-1",
        front: "Original front",
        back: "Original back",
      });

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview([flashcard]);
      });

      act(() => {
        result.current.startEdit(flashcard);
      });

      act(() => {
        result.current.editState.setContent({
          front: "Edited front",
          back: "Edited back",
        });
      });

      act(() => {
        result.current.saveEdit();
      });

      expect(result.current.suggestions[0]).toEqual(
        expect.objectContaining({ front: "Edited front", back: "Edited back" })
      );
      expect(result.current.editState.tempId).toBeNull();
      expect(result.current.editState.content).toEqual({});
    });

    it("updates question suggestion in list and clears edit state", () => {
      const question = createQuestionSuggestion({ tempId: "q-1" });

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview([question]);
      });

      act(() => {
        result.current.startEdit(question);
      });

      const newOptions = question.options.map((opt, i) => ({
        ...opt,
        optionText: `Edited option ${i}`,
      }));

      act(() => {
        result.current.editState.setContent({
          questionText: "Edited question",
          options: newOptions,
        });
      });

      act(() => {
        result.current.saveEdit();
      });

      const saved = result.current.suggestions[0] as QuestionSuggestion;
      expect(saved.questionText).toBe("Edited question");
      expect(saved.options).toEqual(newOptions);
      expect(result.current.editState.tempId).toBeNull();
    });
  });

  describe("cancelEdit", () => {
    it("clears edit state without modifying suggestions", () => {
      const flashcard = createFlashcardSuggestion({
        tempId: "fc-1",
        front: "Original front",
      });

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview([flashcard]);
      });

      act(() => {
        result.current.startEdit(flashcard);
      });

      act(() => {
        result.current.editState.setContent({ front: "Changed" });
      });

      act(() => {
        result.current.cancelEdit();
      });

      expect(result.current.editState.tempId).toBeNull();
      expect(result.current.editState.content).toEqual({});
      // Original suggestion unchanged
      expect((result.current.suggestions[0] as FlashcardSuggestion).front).toBe(
        "Original front"
      );
    });
  });

  describe("acceptAll", () => {
    it("checks capacity and accepts all suggestions in parallel", async () => {
      const fc1 = createFlashcardSuggestion({ tempId: "fc-1" });
      const q1 = createQuestionSuggestion({ tempId: "q-1" });

      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("/count")) {
          return mockFetchJsonResponse({
            status: "success",
            data: { count: 0 },
          });
        }
        if (url.includes("/flashcards")) {
          return mockFetchJsonResponse({
            status: "success",
            data: { flashcard: { id: 1 } },
          });
        }
        if (url.includes("/questions")) {
          return mockFetchJsonResponse({
            status: "success",
            data: { question: { id: 2 } },
          });
        }
        return mockFetchJsonResponse({ status: "fail" }, false);
      });

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview([fc1, q1]);
      });

      await act(async () => {
        await result.current.acceptAll();
      });

      expect(result.current.suggestions).toEqual([]);
      expect(defaultOptions.onFlashcardAdded).toHaveBeenCalled();
      expect(defaultOptions.onQuestionAdded).toHaveBeenCalled();
    });

    it("shows error when at study set item limit", async () => {
      const fc1 = createFlashcardSuggestion({ tempId: "fc-1" });

      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("/count")) {
          return mockFetchJsonResponse({
            status: "success",
            data: { count: STUDY_SET_ITEM_LIMIT },
          });
        }
        return mockFetchJsonResponse({ status: "fail" }, false);
      });

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview([fc1]);
      });

      await act(async () => {
        await result.current.acceptAll();
      });

      expect(result.current.error).toBe(
        `Study set has reached the maximum limit of ${STUDY_SET_ITEM_LIMIT} items. Remove some items to add more.`
      );
      // Suggestion should still be in list
      expect(result.current.suggestions).toHaveLength(1);
    });

    it("accepts up to remaining capacity and shows partial error", async () => {
      const fc1 = createFlashcardSuggestion({ tempId: "fc-1" });
      const fc2 = createFlashcardSuggestion({ tempId: "fc-2" });
      const fc3 = createFlashcardSuggestion({ tempId: "fc-3" });

      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("/count")) {
          return mockFetchJsonResponse({
            status: "success",
            data: { count: STUDY_SET_ITEM_LIMIT - 2 },
          });
        }
        if (url.includes("/flashcards")) {
          return mockFetchJsonResponse({
            status: "success",
            data: { flashcard: { id: 1 } },
          });
        }
        return mockFetchJsonResponse({ status: "fail" }, false);
      });

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview([fc1, fc2, fc3]);
      });

      await act(async () => {
        await result.current.acceptAll();
      });

      // 2 accepted, 1 remaining
      expect(result.current.error).toBe(
        `Added 2 items. 1 could not be added (limit of ${STUDY_SET_ITEM_LIMIT} reached).`
      );
    });

    it("shows error when capacity check fails", async () => {
      const fc1 = createFlashcardSuggestion({ tempId: "fc-1" });

      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("/count")) {
          return mockFetchJsonResponse(
            { status: "fail", data: { error: "Server error" } },
            false
          );
        }
        return mockFetchJsonResponse({ status: "fail" }, false);
      });

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview([fc1]);
      });

      await act(async () => {
        await result.current.acceptAll();
      });

      expect(result.current.error).toBe(
        "Failed to check study set capacity. Please try again."
      );
    });
  });

  describe("rejectAll", () => {
    it("clears all suggestions", () => {
      const fc1 = createFlashcardSuggestion({ tempId: "fc-1" });
      const q1 = createQuestionSuggestion({ tempId: "q-1" });

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview([fc1, q1]);
      });

      act(() => {
        result.current.rejectAll();
      });

      expect(result.current.suggestions).toEqual([]);
    });
  });

  describe("reset", () => {
    it("resets all state back to initial", async () => {
      const flashcard = createFlashcardSuggestion({ tempId: "fc-1" });

      global.fetch = vi.fn().mockReturnValue(
        mockFetchJsonResponse({
          status: "success",
          data: { flashcard: { id: 1 } },
        })
      );

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      // Set up some state
      act(() => {
        result.current.startReview([flashcard]);
      });

      act(() => {
        result.current.startEdit(flashcard);
      });

      // Reset everything
      act(() => {
        result.current.reset();
      });

      expect(result.current.suggestions).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.editState.tempId).toBeNull();
      expect(result.current.editState.content).toEqual({});
      expect(result.current.reviewedCount).toBe(0);
      expect(result.current.initialCount).toBe(0);
    });
  });

  describe("reviewedCount", () => {
    it("equals initialCount minus current suggestions length", async () => {
      const fc1 = createFlashcardSuggestion({ tempId: "fc-1" });
      const fc2 = createFlashcardSuggestion({ tempId: "fc-2" });
      const fc3 = createFlashcardSuggestion({ tempId: "fc-3" });

      global.fetch = vi.fn().mockReturnValue(
        mockFetchJsonResponse({
          status: "success",
          data: { flashcard: { id: 1 } },
        })
      );

      const { result } = renderHook(() =>
        useAISuggestionReview(defaultOptions)
      );

      act(() => {
        result.current.startReview([fc1, fc2, fc3]);
      });

      expect(result.current.reviewedCount).toBe(0);

      // Reject one
      act(() => {
        result.current.reject("fc-1");
      });

      expect(result.current.reviewedCount).toBe(1);

      // Accept one
      await act(async () => {
        await result.current.accept(fc2);
      });

      expect(result.current.reviewedCount).toBe(2);
    });
  });
});
