import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SessionComplete } from "./SessionComplete";
import { SessionResults } from "@/hooks/useReviewSession";

// Test data factory
function createMockSessionResults(
  overrides: Partial<SessionResults> = {}
): SessionResults {
  return {
    correct: 7,
    incorrect: 3,
    movedUp: 5,
    needsReview: 2,
    ...overrides,
  };
}

describe("SessionComplete", () => {
  describe("rendering", () => {
    it("renders QuizSummary with correct score", () => {
      render(
        <SessionComplete
          sessionResults={createMockSessionResults({ correct: 7, incorrect: 3 })}
          hasMoreItems={false}
          onBackToModeSelection={vi.fn()}
          onContinue={vi.fn()}
        />
      );

      // QuizSummary displays score as "7/10"
      expect(screen.getByText("7/10")).toBeInTheDocument();
    });

    it("renders 'Back to Review' button", () => {
      render(
        <SessionComplete
          sessionResults={createMockSessionResults()}
          hasMoreItems={false}
          onBackToModeSelection={vi.fn()}
          onContinue={vi.fn()}
        />
      );

      expect(screen.getByText("Back to Review")).toBeInTheDocument();
    });

    it("renders 'Session Complete!' title", () => {
      render(
        <SessionComplete
          sessionResults={createMockSessionResults()}
          hasMoreItems={false}
          onBackToModeSelection={vi.fn()}
          onContinue={vi.fn()}
        />
      );

      expect(screen.getByText("Session Complete!")).toBeInTheDocument();
    });
  });

  describe("Continue button", () => {
    it("renders 'Continue' button when hasMoreItems is true", () => {
      render(
        <SessionComplete
          sessionResults={createMockSessionResults()}
          hasMoreItems={true}
          onBackToModeSelection={vi.fn()}
          onContinue={vi.fn()}
        />
      );

      expect(screen.getByText("Continue")).toBeInTheDocument();
    });

    it("does not render 'Continue' button when hasMoreItems is false", () => {
      render(
        <SessionComplete
          sessionResults={createMockSessionResults()}
          hasMoreItems={false}
          onBackToModeSelection={vi.fn()}
          onContinue={vi.fn()}
        />
      );

      expect(screen.queryByText("Continue")).not.toBeInTheDocument();
    });

    it("calls onContinue when 'Continue' button is clicked", () => {
      const handleContinue = vi.fn();

      render(
        <SessionComplete
          sessionResults={createMockSessionResults()}
          hasMoreItems={true}
          onBackToModeSelection={vi.fn()}
          onContinue={handleContinue}
        />
      );

      fireEvent.click(screen.getByText("Continue"));

      expect(handleContinue).toHaveBeenCalled();
    });
  });

  describe("Back to Review button", () => {
    it("calls onBackToModeSelection when 'Back to Review' button is clicked", () => {
      const handleBack = vi.fn();

      render(
        <SessionComplete
          sessionResults={createMockSessionResults()}
          hasMoreItems={false}
          onBackToModeSelection={handleBack}
          onContinue={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText("Back to Review"));

      expect(handleBack).toHaveBeenCalled();
    });
  });

  describe("statistics display", () => {
    it("renders moved up count when greater than 0", () => {
      render(
        <SessionComplete
          sessionResults={createMockSessionResults({ movedUp: 5 })}
          hasMoreItems={false}
          onBackToModeSelection={vi.fn()}
          onContinue={vi.fn()}
        />
      );

      expect(screen.getByText("5 moved up")).toBeInTheDocument();
    });

    it("renders needs review count when greater than 0", () => {
      render(
        <SessionComplete
          sessionResults={createMockSessionResults({ needsReview: 2 })}
          hasMoreItems={false}
          onBackToModeSelection={vi.fn()}
          onContinue={vi.fn()}
        />
      );

      expect(screen.getByText("2 need review")).toBeInTheDocument();
    });
  });
});
