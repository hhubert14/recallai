import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuestionDisplay } from "./QuestionDisplay";
import type { QuestionData } from "@/hooks/useBattleGame";

const question: QuestionData = {
  index: 0,
  text: "What is the capital of France?",
  options: [
    { id: 1, optionText: "London" },
    { id: 2, optionText: "Paris" },
    { id: 3, optionText: "Berlin" },
    { id: 4, optionText: "Madrid" },
  ],
  startedAt: "2025-01-01T00:00:00Z",
};

const defaultSlots = [
  { slotIndex: 0, slotType: "player" as const, userId: "user-1", botName: null },
  { slotIndex: 1, slotType: "bot" as const, userId: null, botName: "Bot Alpha" },
];

describe("QuestionDisplay", () => {
  it("renders question text and all options", () => {
    render(
      <QuestionDisplay
        question={question}
        selectedOptionId={null}
        onSelectOption={vi.fn()}
        isSubmitting={false}
        gamePhase="question_active"
        playersAnswered={new Set()}
        slots={defaultSlots}
      />
    );

    expect(screen.getByText("What is the capital of France?")).toBeInTheDocument();
    expect(screen.getByText("London")).toBeInTheDocument();
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("Berlin")).toBeInTheDocument();
    expect(screen.getByText("Madrid")).toBeInTheDocument();
  });

  it("calls onSelectOption when option is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <QuestionDisplay
        question={question}
        selectedOptionId={null}
        onSelectOption={onSelect}
        isSubmitting={false}
        gamePhase="question_active"
        playersAnswered={new Set()}
        slots={defaultSlots}
      />
    );

    await user.click(screen.getByText("Paris"));
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it("disables options after selection", () => {
    render(
      <QuestionDisplay
        question={question}
        selectedOptionId={2}
        onSelectOption={vi.fn()}
        isSubmitting={false}
        gamePhase="answer_submitted"
        playersAnswered={new Set([0])}
        slots={defaultSlots}
      />
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("shows answered count", () => {
    render(
      <QuestionDisplay
        question={question}
        selectedOptionId={null}
        onSelectOption={vi.fn()}
        isSubmitting={false}
        gamePhase="question_active"
        playersAnswered={new Set([1])}
        slots={defaultSlots}
      />
    );

    expect(screen.getByText("1 of 2 answered")).toBeInTheDocument();
  });

  it("renders nothing when question is null", () => {
    const { container } = render(
      <QuestionDisplay
        question={null}
        selectedOptionId={null}
        onSelectOption={vi.fn()}
        isSubmitting={false}
        gamePhase="waiting"
        playersAnswered={new Set()}
        slots={defaultSlots}
      />
    );

    expect(container.innerHTML).toBe("");
  });
});
