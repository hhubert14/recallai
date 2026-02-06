import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WelcomeModalWrapper } from "./WelcomeModalWrapper";
import { STORAGE_KEY } from "./welcome-steps";

// Mock the useExtensionDetection hook
vi.mock("@/hooks/useExtensionDetection", () => ({
  useExtensionDetection: vi.fn(() => ({
    isInstalled: false,
    isChecking: false,
    recheckInstallation: vi.fn(),
  })),
}));

describe("WelcomeModalWrapper", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not render if localStorage has "welcome_modal_completed" set to "true"', () => {
    localStorage.setItem(STORAGE_KEY, "true");

    render(<WelcomeModalWrapper />);

    expect(screen.queryByText("Welcome to Retenio!")).not.toBeInTheDocument();
  });

  it("renders modal if localStorage key is not set", async () => {
    render(<WelcomeModalWrapper />);

    await waitFor(() => {
      expect(screen.getByText("Welcome to Retenio!")).toBeInTheDocument();
    });
  });

  it("sets localStorage on complete", async () => {
    const user = userEvent.setup();
    render(<WelcomeModalWrapper />);

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText("Welcome to Retenio!")).toBeInTheDocument();
    });

    // Navigate through all 5 steps and click "Skip for now" on step 5
    await user.click(screen.getByRole("button", { name: /next/i })); // Step 2
    await user.click(screen.getByRole("button", { name: /next/i })); // Step 3
    await user.click(screen.getByRole("button", { name: /next/i })); // Step 4
    await user.click(screen.getByRole("button", { name: /next/i })); // Step 5
    await user.click(screen.getByRole("button", { name: /skip for now/i }));

    // Check localStorage was set
    expect(localStorage.getItem(STORAGE_KEY)).toBe("true");

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByText("Welcome to Retenio!")).not.toBeInTheDocument();
    });
  });

  it("sets localStorage when modal is closed via X button", async () => {
    const user = userEvent.setup();
    render(<WelcomeModalWrapper />);

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText("Welcome to Retenio!")).toBeInTheDocument();
    });

    // Close via X button
    await user.click(screen.getByRole("button", { name: /close/i }));

    // Check localStorage was set
    expect(localStorage.getItem(STORAGE_KEY)).toBe("true");
  });
});
