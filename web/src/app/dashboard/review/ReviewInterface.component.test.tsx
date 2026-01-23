import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ReviewInterface } from "./ReviewInterface";
import { StudyModeStats, ProgressStats } from "./StudyModeSelector";
import { ReviewItemApiResponse } from "@/clean-architecture/use-cases/review/types";

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

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

function createMockProgressStats(
  overrides: Partial<ProgressStats> = {}
): ProgressStats {
  return {
    mastered: 2,
    inProgress: 5,
    dueToday: 3,
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
        { id: 1, optionText: "A programming language", isCorrect: true, explanation: "Correct!" },
        { id: 2, optionText: "A database", isCorrect: false, explanation: null },
        { id: 3, optionText: "A framework", isCorrect: false, explanation: null },
        { id: 4, optionText: "An OS", isCorrect: false, explanation: null },
      ],
    },
    video: {
      id: 1,
      title: "TypeScript Tutorial",
      publicId: "abc-123",
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
      publicId: "def-456",
    },
    ...overrides,
  };
}

// Mock fetch helper
function mockFetchSuccess(items: ReviewItemApiResponse[]) {
  return vi.fn().mockResolvedValue({
    json: () => Promise.resolve({
      status: "success",
      data: { items },
    }),
  });
}

function mockFetchError(errorMessage: string) {
  return vi.fn().mockResolvedValue({
    json: () => Promise.resolve({
      status: "fail",
      data: { error: errorMessage },
    }),
  });
}

function mockSubmitAnswerSuccess(boxLevel: number = 3) {
  return vi.fn().mockImplementation((url: string) => {
    if (url.includes("submit-answer")) {
      return Promise.resolve({
        json: () => Promise.resolve({
          status: "success",
          data: { progress: { boxLevel } },
        }),
      });
    }
    // Default for fetch items
    return Promise.resolve({
      json: () => Promise.resolve({
        status: "success",
        data: { items: [createMockQuestionItem()] },
      }),
    });
  });
}

describe("ReviewInterface", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("empty state", () => {
    it("shows empty state when totalCount is 0", () => {
      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats({ dueCount: 0, newCount: 0, totalCount: 0 })}
          progressStats={createMockProgressStats()}
        />
      );

      expect(screen.getByText("No Items Yet")).toBeInTheDocument();
      expect(screen.getByText(/Complete some video quizzes/)).toBeInTheDocument();
      expect(screen.getByText("Go to Dashboard")).toBeInTheDocument();
    });

    it("navigates to dashboard when clicking Go to Dashboard", () => {
      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats({ dueCount: 0, newCount: 0, totalCount: 0 })}
          progressStats={createMockProgressStats()}
        />
      );

      fireEvent.click(screen.getByText("Go to Dashboard"));
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("mode selection", () => {
    it("shows mode selector with stats", () => {
      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats({ dueCount: 5, newCount: 3, totalCount: 10 })}
          progressStats={createMockProgressStats()}
        />
      );

      expect(screen.getByText("Due for Review")).toBeInTheDocument();
      expect(screen.getByText("Learn New Items")).toBeInTheDocument();
      expect(screen.getByText("Random Practice")).toBeInTheDocument();
      expect(screen.getByText("Start Session")).toBeInTheDocument();
    });

    it("defaults to 'due' mode when dueCount > 0", () => {
      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats({ dueCount: 5, newCount: 3, totalCount: 10 })}
          progressStats={createMockProgressStats()}
        />
      );

      // The due mode card should have the selected state (check for the message)
      expect(screen.getByText(/You have 5 items waiting/)).toBeInTheDocument();
    });

    it("defaults to 'new' mode when dueCount is 0 but newCount > 0", () => {
      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats({ dueCount: 0, newCount: 3, totalCount: 10 })}
          progressStats={createMockProgressStats()}
        />
      );

      expect(screen.getByText(/3 new items to learn/)).toBeInTheDocument();
    });
  });

  describe("question review flow", () => {
    it("starts session and shows question", async () => {
      const mockItems = [createMockQuestionItem()];
      global.fetch = mockFetchSuccess(mockItems);

      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats()}
          progressStats={createMockProgressStats()}
        />
      );

      fireEvent.click(screen.getByText("Start Session"));

      await waitFor(() => {
        expect(screen.getByText("What is TypeScript?")).toBeInTheDocument();
      });

      expect(screen.getByText("A programming language")).toBeInTheDocument();
      expect(screen.getByText("A database")).toBeInTheDocument();
    });

    it("disables submit button until option is selected", async () => {
      global.fetch = mockFetchSuccess([createMockQuestionItem()]);

      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats()}
          progressStats={createMockProgressStats()}
        />
      );

      fireEvent.click(screen.getByText("Start Session"));

      await waitFor(() => {
        expect(screen.getByText("What is TypeScript?")).toBeInTheDocument();
      });

      const submitButton = screen.getByText("Check Answer");
      expect(submitButton).toBeDisabled();
    });

    it("enables submit button after selecting an option", async () => {
      global.fetch = mockFetchSuccess([createMockQuestionItem()]);

      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats()}
          progressStats={createMockProgressStats()}
        />
      );

      fireEvent.click(screen.getByText("Start Session"));

      await waitFor(() => {
        expect(screen.getByText("What is TypeScript?")).toBeInTheDocument();
      });

      // Click on an option
      fireEvent.click(screen.getByText("A programming language"));

      const submitButton = screen.getByText("Check Answer");
      expect(submitButton).not.toBeDisabled();
    });

    it("submits answer and shows result for correct answer", async () => {
      global.fetch = mockSubmitAnswerSuccess(3);

      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats()}
          progressStats={createMockProgressStats()}
        />
      );

      fireEvent.click(screen.getByText("Start Session"));

      await waitFor(() => {
        expect(screen.getByText("What is TypeScript?")).toBeInTheDocument();
      });

      // Select correct answer
      fireEvent.click(screen.getByText("A programming language"));
      fireEvent.click(screen.getByText("Check Answer"));

      await waitFor(() => {
        // "Correct!" appears in both header and explanation, verify at least one exists
        expect(screen.getAllByText("Correct!").length).toBeGreaterThan(0);
      });
    });

    it("shows Finish Session button on last item", async () => {
      global.fetch = mockSubmitAnswerSuccess(3);

      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats()}
          progressStats={createMockProgressStats()}
        />
      );

      fireEvent.click(screen.getByText("Start Session"));

      await waitFor(() => {
        expect(screen.getByText("What is TypeScript?")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("A programming language"));
      fireEvent.click(screen.getByText("Check Answer"));

      await waitFor(() => {
        expect(screen.getByText("Finish Session")).toBeInTheDocument();
      });
    });
  });

  describe("flashcard review flow", () => {
    it("shows flashcard front and flip instruction", async () => {
      global.fetch = mockFetchSuccess([createMockFlashcardItem()]);

      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats()}
          progressStats={createMockProgressStats()}
        />
      );

      fireEvent.click(screen.getByText("Start Session"));

      await waitFor(() => {
        expect(screen.getByText("What is React?")).toBeInTheDocument();
      });

      expect(screen.getByText("Click to flip")).toBeInTheDocument();
      expect(screen.getByText("Front")).toBeInTheDocument();
    });

    it("flips card to show back when clicked", async () => {
      global.fetch = mockFetchSuccess([createMockFlashcardItem()]);

      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats()}
          progressStats={createMockProgressStats()}
        />
      );

      fireEvent.click(screen.getByText("Start Session"));

      await waitFor(() => {
        expect(screen.getByText("What is React?")).toBeInTheDocument();
      });

      // Click the card to flip
      fireEvent.click(screen.getByText("What is React?"));

      await waitFor(() => {
        expect(screen.getByText("A JavaScript library for building UIs")).toBeInTheDocument();
        expect(screen.getByText("Back")).toBeInTheDocument();
      });
    });

    it("shows self-assessment buttons after flipping", async () => {
      global.fetch = mockFetchSuccess([createMockFlashcardItem()]);

      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats()}
          progressStats={createMockProgressStats()}
        />
      );

      fireEvent.click(screen.getByText("Start Session"));

      await waitFor(() => {
        expect(screen.getByText("What is React?")).toBeInTheDocument();
      });

      // Flip the card
      fireEvent.click(screen.getByText("What is React?"));

      await waitFor(() => {
        expect(screen.getByText("Did you know the answer?")).toBeInTheDocument();
        expect(screen.getByText("Not Yet")).toBeInTheDocument();
        expect(screen.getByText("Got It!")).toBeInTheDocument();
      });
    });

    it("disables submit until self-assessment is made", async () => {
      global.fetch = mockFetchSuccess([createMockFlashcardItem()]);

      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats()}
          progressStats={createMockProgressStats()}
        />
      );

      fireEvent.click(screen.getByText("Start Session"));

      await waitFor(() => {
        expect(screen.getByText("What is React?")).toBeInTheDocument();
      });

      // Flip the card
      fireEvent.click(screen.getByText("What is React?"));

      await waitFor(() => {
        expect(screen.getByText("Submit")).toBeDisabled();
      });
    });

    it("enables submit after selecting Got It!", async () => {
      global.fetch = mockFetchSuccess([createMockFlashcardItem()]);

      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats()}
          progressStats={createMockProgressStats()}
        />
      );

      fireEvent.click(screen.getByText("Start Session"));

      await waitFor(() => {
        expect(screen.getByText("What is React?")).toBeInTheDocument();
      });

      // Flip and assess
      fireEvent.click(screen.getByText("What is React?"));

      await waitFor(() => {
        expect(screen.getByText("Got It!")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Got It!"));

      expect(screen.getByText("Submit")).not.toBeDisabled();
    });
  });

  describe("random mode behavior", () => {
    it("does not call submit-answer API in random mode", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          status: "success",
          data: { items: [createMockQuestionItem()] },
        }),
      });
      global.fetch = fetchMock;

      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats({ dueCount: 0, newCount: 0, totalCount: 5 })}
          progressStats={createMockProgressStats()}
        />
      );

      // Select random mode (it should be pre-selected since due and new are 0)
      fireEvent.click(screen.getByText("Start Session"));

      await waitFor(() => {
        expect(screen.getByText("What is TypeScript?")).toBeInTheDocument();
      });

      // Answer and submit
      fireEvent.click(screen.getByText("A programming language"));
      fireEvent.click(screen.getByText("Check Answer"));

      await waitFor(() => {
        // "Correct!" appears in both header and explanation, verify at least one exists
        expect(screen.getAllByText("Correct!").length).toBeGreaterThan(0);
      });

      // Verify submit-answer was NOT called
      const submitCalls = fetchMock.mock.calls.filter(
        (call) => call[0]?.includes?.("submit-answer")
      );
      expect(submitCalls.length).toBe(0);
    });
  });

  describe("session completion", () => {
    it("shows summary after finishing session", async () => {
      global.fetch = mockSubmitAnswerSuccess(3);

      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats()}
          progressStats={createMockProgressStats()}
        />
      );

      fireEvent.click(screen.getByText("Start Session"));

      await waitFor(() => {
        expect(screen.getByText("What is TypeScript?")).toBeInTheDocument();
      });

      // Answer and finish
      fireEvent.click(screen.getByText("A programming language"));
      fireEvent.click(screen.getByText("Check Answer"));

      await waitFor(() => {
        expect(screen.getByText("Finish Session")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Finish Session"));

      await waitFor(() => {
        // Summary should show results
        expect(screen.getByText("Back to Review")).toBeInTheDocument();
      });
    });

    it("resets state when clicking Back to Review", async () => {
      global.fetch = mockSubmitAnswerSuccess(3);

      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats()}
          progressStats={createMockProgressStats()}
        />
      );

      // Complete a session
      fireEvent.click(screen.getByText("Start Session"));

      await waitFor(() => {
        expect(screen.getByText("What is TypeScript?")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("A programming language"));
      fireEvent.click(screen.getByText("Check Answer"));

      await waitFor(() => {
        expect(screen.getByText("Finish Session")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Finish Session"));

      await waitFor(() => {
        expect(screen.getByText("Back to Review")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Back to Review"));

      // Should be back to mode selection
      await waitFor(() => {
        expect(screen.getByText("Start Session")).toBeInTheDocument();
        expect(screen.getByText("Due for Review")).toBeInTheDocument();
      });

      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("shows error when fetch fails", async () => {
      global.fetch = mockFetchError("Failed to load items");

      render(
        <ReviewInterface
          studyModeStats={createMockStudyModeStats()}
          progressStats={createMockProgressStats()}
        />
      );

      fireEvent.click(screen.getByText("Start Session"));

      await waitFor(() => {
        expect(screen.getByText("Failed to load items")).toBeInTheDocument();
      });
    });
  });
});
