import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameTimer } from "./GameTimer";

describe("GameTimer", () => {
  it("displays time remaining in seconds", () => {
    render(<GameTimer timeRemaining={10} timeLimitSeconds={15} />);
    expect(screen.getByText("10s")).toBeInTheDocument();
  });

  it("displays 0s when time is up", () => {
    render(<GameTimer timeRemaining={0} timeLimitSeconds={15} />);
    expect(screen.getByText("0s")).toBeInTheDocument();
  });

  it("rounds up fractional seconds", () => {
    render(<GameTimer timeRemaining={3.2} timeLimitSeconds={15} />);
    expect(screen.getByText("4s")).toBeInTheDocument();
  });

  it("renders progress bar", () => {
    const { container } = render(
      <GameTimer timeRemaining={7.5} timeLimitSeconds={15} />
    );

    // Progress bar inner div should have ~50% width
    const progressBar = container.querySelector("[style]");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar?.getAttribute("style")).toContain("50%");
  });
});
