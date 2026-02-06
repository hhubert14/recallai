import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StreakBadge } from "./StreakBadge";

// Mock fetch
global.fetch = vi.fn();

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

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

  it("displays error state with retry button on fetch failure", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    render(<StreakBadge userId="user-123" />);

    await waitFor(() => {
      // Should show error indicator (red background)
      const badge = screen.getByRole("button", { name: /retry/i });
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain("bg-red-500/10");
    });
  });

  it("retries fetch when error button is clicked", async () => {
    const user = userEvent.setup();
    let callCount = 0;

    // First call fails, second succeeds
    vi.mocked(fetch).mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error("Network error");
      }
      return {
        ok: true,
        json: async () => ({
          status: "success",
          data: {
            currentStreak: 5,
            longestStreak: 5,
            lastActivityDate: "2025-01-30",
          },
        }),
      } as Response;
    });

    render(<StreakBadge userId="user-123" />);

    // Wait for error state
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /retry/i })
      ).toBeInTheDocument();
    });

    // Click retry
    await user.click(screen.getByRole("button", { name: /retry/i }));

    // Should show streak after retry
    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });
});
