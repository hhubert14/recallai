import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FlashcardReview } from "./FlashcardReview";

// Test data factory
function createMockFlashcard() {
  return {
    id: 20,
    front: "What is React?",
    back: "A JavaScript library for building UIs",
  };
}

describe("FlashcardReview", () => {
  describe("initial rendering", () => {
    it("renders front side initially", () => {
      render(
        <FlashcardReview
          flashcard={createMockFlashcard()}
          isFlipped={false}
          onFlip={vi.fn()}
          selfAssessment={null}
          onSelfAssess={vi.fn()}
          showResult={false}
        />
      );

      expect(screen.getByText("What is React?")).toBeInTheDocument();
      expect(screen.getByText("Front")).toBeInTheDocument();
    });

    it("shows 'Click to flip' instruction when not flipped", () => {
      render(
        <FlashcardReview
          flashcard={createMockFlashcard()}
          isFlipped={false}
          onFlip={vi.fn()}
          selfAssessment={null}
          onSelfAssess={vi.fn()}
          showResult={false}
        />
      );

      expect(screen.getByText("Click to flip")).toBeInTheDocument();
    });
  });

  describe("flipping", () => {
    it("calls onFlip when card is clicked", () => {
      const handleFlip = vi.fn();

      render(
        <FlashcardReview
          flashcard={createMockFlashcard()}
          isFlipped={false}
          onFlip={handleFlip}
          selfAssessment={null}
          onSelfAssess={vi.fn()}
          showResult={false}
        />
      );

      fireEvent.click(screen.getByText("What is React?"));

      expect(handleFlip).toHaveBeenCalled();
    });

    it("shows back side when isFlipped is true", () => {
      render(
        <FlashcardReview
          flashcard={createMockFlashcard()}
          isFlipped={true}
          onFlip={vi.fn()}
          selfAssessment={null}
          onSelfAssess={vi.fn()}
          showResult={false}
        />
      );

      expect(
        screen.getByText("A JavaScript library for building UIs")
      ).toBeInTheDocument();
      expect(screen.getByText("Back")).toBeInTheDocument();
    });

    it("does not call onFlip when showResult is true", () => {
      const handleFlip = vi.fn();

      render(
        <FlashcardReview
          flashcard={createMockFlashcard()}
          isFlipped={true}
          onFlip={handleFlip}
          selfAssessment={true}
          onSelfAssess={vi.fn()}
          showResult={true}
        />
      );

      fireEvent.click(
        screen.getByText("A JavaScript library for building UIs")
      );

      expect(handleFlip).not.toHaveBeenCalled();
    });
  });

  describe("self-assessment", () => {
    it("shows self-assessment buttons after flipping", () => {
      render(
        <FlashcardReview
          flashcard={createMockFlashcard()}
          isFlipped={true}
          onFlip={vi.fn()}
          selfAssessment={null}
          onSelfAssess={vi.fn()}
          showResult={false}
        />
      );

      expect(screen.getByText("Did you know the answer?")).toBeInTheDocument();
      expect(screen.getByText("Not Yet")).toBeInTheDocument();
      expect(screen.getByText("Got It!")).toBeInTheDocument();
    });

    it("does not show self-assessment buttons before flipping", () => {
      render(
        <FlashcardReview
          flashcard={createMockFlashcard()}
          isFlipped={false}
          onFlip={vi.fn()}
          selfAssessment={null}
          onSelfAssess={vi.fn()}
          showResult={false}
        />
      );

      expect(
        screen.queryByText("Did you know the answer?")
      ).not.toBeInTheDocument();
    });

    it("calls onSelfAssess(true) when 'Got It!' is clicked", () => {
      const handleSelfAssess = vi.fn();

      render(
        <FlashcardReview
          flashcard={createMockFlashcard()}
          isFlipped={true}
          onFlip={vi.fn()}
          selfAssessment={null}
          onSelfAssess={handleSelfAssess}
          showResult={false}
        />
      );

      fireEvent.click(screen.getByText("Got It!"));

      expect(handleSelfAssess).toHaveBeenCalledWith(true);
    });

    it("calls onSelfAssess(false) when 'Not Yet' is clicked", () => {
      const handleSelfAssess = vi.fn();

      render(
        <FlashcardReview
          flashcard={createMockFlashcard()}
          isFlipped={true}
          onFlip={vi.fn()}
          selfAssessment={null}
          onSelfAssess={handleSelfAssess}
          showResult={false}
        />
      );

      fireEvent.click(screen.getByText("Not Yet"));

      expect(handleSelfAssess).toHaveBeenCalledWith(false);
    });
  });

  describe("result display", () => {
    it("shows correct result when selfAssessment is true and showResult is true", () => {
      render(
        <FlashcardReview
          flashcard={createMockFlashcard()}
          isFlipped={true}
          onFlip={vi.fn()}
          selfAssessment={true}
          onSelfAssess={vi.fn()}
          showResult={true}
        />
      );

      expect(screen.getAllByText("Correct!").length).toBeGreaterThan(0);
      expect(screen.getByText("Great job! Keep it up!")).toBeInTheDocument();
    });

    it("shows incorrect result when selfAssessment is false and showResult is true", () => {
      render(
        <FlashcardReview
          flashcard={createMockFlashcard()}
          isFlipped={true}
          onFlip={vi.fn()}
          selfAssessment={false}
          onSelfAssess={vi.fn()}
          showResult={true}
        />
      );

      expect(screen.getByText("Incorrect")).toBeInTheDocument();
      expect(
        screen.getByText("No worries - you'll see this card again soon.")
      ).toBeInTheDocument();
    });

    it("does not show result when showResult is false", () => {
      render(
        <FlashcardReview
          flashcard={createMockFlashcard()}
          isFlipped={true}
          onFlip={vi.fn()}
          selfAssessment={true}
          onSelfAssess={vi.fn()}
          showResult={false}
        />
      );

      expect(screen.queryByText("Correct!")).not.toBeInTheDocument();
      expect(screen.queryByText("Incorrect")).not.toBeInTheDocument();
    });

    it("does not show self-assessment buttons when showResult is true", () => {
      render(
        <FlashcardReview
          flashcard={createMockFlashcard()}
          isFlipped={true}
          onFlip={vi.fn()}
          selfAssessment={true}
          onSelfAssess={vi.fn()}
          showResult={true}
        />
      );

      expect(
        screen.queryByText("Did you know the answer?")
      ).not.toBeInTheDocument();
    });
  });
});
