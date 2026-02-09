import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RevealPhase } from "./RevealPhase";
import type { QuestionData, RevealData } from "@/hooks/useBattleGame";

const question: QuestionData = {
  index: 0,
  text: "What is 2+2?",
  options: [
    { id: 1, optionText: "3" },
    { id: 2, optionText: "4" },
    { id: 3, optionText: "5" },
    { id: 4, optionText: "6" },
  ],
  startedAt: "2025-01-01T00:00:00Z",
};

const revealData: RevealData = {
  correctOptionId: 2,
  results: [
    { slotIndex: 0, selectedOptionId: 2, isCorrect: true, pointsAwarded: 800 },
    { slotIndex: 1, selectedOptionId: 1, isCorrect: false, pointsAwarded: 0 },
  ],
};

const slots = [
  { slotIndex: 0, slotType: "player" as const, userId: "user-1", botName: null },
  { slotIndex: 1, slotType: "bot" as const, userId: null, botName: "Bot Alpha" },
];

describe("RevealPhase", () => {
  it("displays question text", () => {
    render(
      <RevealPhase
        question={question}
        revealData={revealData}
        slots={slots}
        selectedOptionId={2}
      />
    );

    expect(screen.getByText("What is 2+2?")).toBeInTheDocument();
  });

  it("displays all options", () => {
    render(
      <RevealPhase
        question={question}
        revealData={revealData}
        slots={slots}
        selectedOptionId={2}
      />
    );

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("shows player results with scores", () => {
    render(
      <RevealPhase
        question={question}
        revealData={revealData}
        slots={slots}
        selectedOptionId={2}
      />
    );

    expect(screen.getByText("+800")).toBeInTheDocument();
    expect(screen.getByText("+0")).toBeInTheDocument();
    expect(screen.getByText("Bot Alpha")).toBeInTheDocument();
  });

  it("renders nothing when question is null", () => {
    const { container } = render(
      <RevealPhase
        question={null}
        revealData={revealData}
        slots={slots}
        selectedOptionId={null}
      />
    );

    expect(container.innerHTML).toBe("");
  });
});
