import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestionReview } from "./QuestionReview";

// Test data factory
function createMockQuestion() {
  return {
    id: 10,
    questionText: "What is TypeScript?",
    options: [
      {
        id: 1,
        optionText: "A programming language",
        isCorrect: true,
        explanation: "TypeScript is a typed superset of JavaScript.",
      },
      { id: 2, optionText: "A database", isCorrect: false, explanation: null },
      { id: 3, optionText: "A framework", isCorrect: false, explanation: null },
      { id: 4, optionText: "An OS", isCorrect: false, explanation: null },
    ],
  };
}

describe("QuestionReview", () => {
  describe("rendering", () => {
    it("renders question text", () => {
      render(
        <QuestionReview
          question={createMockQuestion()}
          selectedOptionId={null}
          onSelectOption={vi.fn()}
          showResult={false}
        />
      );

      expect(screen.getByText("What is TypeScript?")).toBeInTheDocument();
    });

    it("renders all options", () => {
      render(
        <QuestionReview
          question={createMockQuestion()}
          selectedOptionId={null}
          onSelectOption={vi.fn()}
          showResult={false}
        />
      );

      expect(screen.getByText("A programming language")).toBeInTheDocument();
      expect(screen.getByText("A database")).toBeInTheDocument();
      expect(screen.getByText("A framework")).toBeInTheDocument();
      expect(screen.getByText("An OS")).toBeInTheDocument();
    });
  });

  describe("option selection", () => {
    it("calls onSelectOption when option is clicked", () => {
      const handleSelect = vi.fn();

      render(
        <QuestionReview
          question={createMockQuestion()}
          selectedOptionId={null}
          onSelectOption={handleSelect}
          showResult={false}
        />
      );

      fireEvent.click(screen.getByText("A database"));

      expect(handleSelect).toHaveBeenCalledWith(2);
    });

    it("does not call onSelectOption when showResult is true", () => {
      const handleSelect = vi.fn();

      render(
        <QuestionReview
          question={createMockQuestion()}
          selectedOptionId={1}
          onSelectOption={handleSelect}
          showResult={true}
        />
      );

      fireEvent.click(screen.getByText("A database"));

      expect(handleSelect).not.toHaveBeenCalled();
    });
  });

  describe("result display", () => {
    it("shows correct result when correct option is selected and showResult is true", () => {
      render(
        <QuestionReview
          question={createMockQuestion()}
          selectedOptionId={1}
          onSelectOption={vi.fn()}
          showResult={true}
        />
      );

      // QuizResult shows "Correct!" for correct answers
      expect(screen.getAllByText("Correct!").length).toBeGreaterThan(0);
    });

    it("shows incorrect result when wrong option is selected and showResult is true", () => {
      render(
        <QuestionReview
          question={createMockQuestion()}
          selectedOptionId={2}
          onSelectOption={vi.fn()}
          showResult={true}
        />
      );

      // QuizResult shows "Incorrect" for incorrect answers
      expect(screen.getByText("Incorrect")).toBeInTheDocument();
    });

    it("shows explanation when showResult is true", () => {
      render(
        <QuestionReview
          question={createMockQuestion()}
          selectedOptionId={1}
          onSelectOption={vi.fn()}
          showResult={true}
        />
      );

      expect(
        screen.getByText("TypeScript is a typed superset of JavaScript.")
      ).toBeInTheDocument();
    });

    it("does not show result when showResult is false", () => {
      render(
        <QuestionReview
          question={createMockQuestion()}
          selectedOptionId={1}
          onSelectOption={vi.fn()}
          showResult={false}
        />
      );

      expect(screen.queryByText("Correct!")).not.toBeInTheDocument();
      expect(screen.queryByText("Not quite...")).not.toBeInTheDocument();
    });
  });
});
