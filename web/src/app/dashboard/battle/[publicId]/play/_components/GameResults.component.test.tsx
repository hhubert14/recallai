import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameResults } from "./GameResults";
import type { FinalResult } from "@/hooks/useBattleGame";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const finalResults: FinalResult[] = [
  { slotIndex: 2, totalPoints: 1600, rank: 1 },
  { slotIndex: 0, totalPoints: 800, rank: 2 },
  { slotIndex: 1, totalPoints: 200, rank: 3 },
];

const slots = [
  { slotIndex: 0, slotType: "player" as const, userId: "user-1", botName: null },
  { slotIndex: 1, slotType: "player" as const, userId: "user-2", botName: null },
  { slotIndex: 2, slotType: "bot" as const, userId: null, botName: "Bot Alpha" },
];

describe("GameResults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays game over header", () => {
    render(
      <GameResults
        finalResults={finalResults}
        slots={slots}
        userId="user-1"

        roomName="Test Room"
      />
    );

    expect(screen.getByText("Game Over!")).toBeInTheDocument();
    expect(screen.getByText("Test Room")).toBeInTheDocument();
  });

  it("displays all ranked players", () => {
    render(
      <GameResults
        finalResults={finalResults}
        slots={slots}
        userId="user-1"

        roomName="Test Room"
      />
    );

    // Bot Alpha appears in both podium and rankings
    expect(screen.getAllByText("Bot Alpha").length).toBeGreaterThan(0);
    // Player 1 (you) appears in the rankings
    expect(screen.getAllByText(/Player 1/).length).toBeGreaterThan(0);
  });

  it("highlights current user with (you) label", () => {
    render(
      <GameResults
        finalResults={finalResults}
        slots={slots}
        userId="user-1"

        roomName="Test Room"
      />
    );

    // Current user's entries should have "(you)" appended
    const youLabels = screen.getAllByText(/\(you\)/);
    expect(youLabels.length).toBeGreaterThan(0);
  });

  it("navigates to lobby on return button click", async () => {
    const user = userEvent.setup();

    render(
      <GameResults
        finalResults={finalResults}
        slots={slots}
        userId="user-1"

        roomName="Test Room"
      />
    );

    await user.click(screen.getByRole("button", { name: /return to lobby/i }));
    expect(mockPush).toHaveBeenCalledWith("/dashboard/battle");
  });

  it("displays scores for all players", () => {
    render(
      <GameResults
        finalResults={finalResults}
        slots={slots}
        userId="user-1"

        roomName="Test Room"
      />
    );

    // Scores appear in both podium and rankings
    expect(screen.getAllByText("1600 pts")).toHaveLength(2);
    expect(screen.getAllByText("800 pts")).toHaveLength(2);
    expect(screen.getAllByText("200 pts")).toHaveLength(2);
  });
});
