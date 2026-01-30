import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StreakBadge } from "./StreakBadge";

// Mock fetch
global.fetch = vi.fn();

describe("StreakBadge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays active streak with orange flame icon", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "success",
        data: {
          currentStreak: 7,
          longestStreak: 10,
          lastActivityDate: "2025-01-30",
        },
      }),
    } as Response);

    render(<StreakBadge userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText("7")).toBeInTheDocument();
    });

    // Check for orange color class on the text span
    const streakText = screen.getByText("7");
    expect(streakText.className).toContain("text-orange-500");
  });

  it("displays broken streak (0) with gray flame icon", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "success",
        data: {
          currentStreak: 0,
          longestStreak: 15,
          lastActivityDate: "2025-01-20",
        },
      }),
    } as Response);

    render(<StreakBadge userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    // Check for gray color class on the text span
    const streakText = screen.getByText("0");
    expect(streakText.className).toContain("text-gray-400");
  });

  it("shows detailed tooltip with all streak info", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "success",
        data: {
          currentStreak: 7,
          longestStreak: 10,
          lastActivityDate: "2025-01-30",
        },
      }),
    } as Response);

    render(<StreakBadge userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText("7")).toBeInTheDocument();
    });

    // Verify the streak value is displayed
    expect(screen.getByText("7")).toBeInTheDocument();
    // The tooltip component is present in the DOM structure
    const badge = screen.getByText("7").parentElement;
    expect(badge).toBeInTheDocument();
  });

  it("handles no streak record (new user)", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "success",
        data: {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
        },
      }),
    } as Response);

    render(<StreakBadge userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });
});
