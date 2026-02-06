import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HelpButton } from "./help-button";
import * as tourConstants from "@/components/tour/tour-constants";
import * as tourSteps from "@/components/tour/tour-steps";
import { TOUR_IDS, TOUR_STORAGE_KEYS } from "@/components/tour/tour-constants";

// Mock driver.js
const mockDrive = vi.fn();
const mockDestroy = vi.fn();

// Mock createTourDriver to be implemented
vi.mock("@/components/tour/tour-constants", async (importOriginal) => {
  const actual = await importOriginal<typeof tourConstants>();
  return {
    ...actual,
    createTourDriver: vi.fn(() => ({
      drive: mockDrive,
      destroy: mockDestroy,
    })),
  };
});

vi.mock("@/components/tour/tour-steps", async (importOriginal) => {
  const actual = await importOriginal<typeof tourSteps>();
  return {
    ...actual,
    getTourSteps: vi.fn(() => [
      {
        element: "#test",
        popover: { title: "Test", description: "Test step" },
      },
    ]),
  };
});

describe("HelpButton", () => {
  let localStorageMock: Record<string, string>;
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock = {};

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key: string) => localStorageMock[key] ?? null
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      (key: string, value: string) => {
        localStorageMock[key] = value;
      }
    );
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(
      (key: string) => {
        delete localStorageMock[key];
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("rendering", () => {
    it("renders help button with dropdown trigger", () => {
      render(<HelpButton tourId={TOUR_IDS.dashboard} />);

      const button = screen.getByRole("button", { name: /help/i });
      expect(button).toBeInTheDocument();
    });

    it("renders with accessible label", () => {
      render(<HelpButton tourId={TOUR_IDS.dashboard} />);

      expect(screen.getByText("Help")).toBeInTheDocument();
    });
  });

  describe("dropdown menu", () => {
    it("opens dropdown when clicked", async () => {
      render(<HelpButton tourId={TOUR_IDS.dashboard} />);

      const button = screen.getByRole("button", { name: /help/i });
      await user.click(button);

      expect(screen.getByText("Replay page tour")).toBeInTheDocument();
    });

    it("shows replay tour menu item with icon", async () => {
      render(<HelpButton tourId={TOUR_IDS.dashboard} />);

      const button = screen.getByRole("button", { name: /help/i });
      await user.click(button);

      const menuItem = screen.getByRole("menuitem", {
        name: /replay page tour/i,
      });
      expect(menuItem).toBeInTheDocument();
    });
  });

  describe("replay tour functionality", () => {
    it("starts tour when clicking replay menu item", async () => {
      render(<HelpButton tourId={TOUR_IDS.dashboard} />);

      const button = screen.getByRole("button", { name: /help/i });
      await user.click(button);

      const menuItem = screen.getByRole("menuitem", {
        name: /replay page tour/i,
      });
      await user.click(menuItem);

      expect(tourConstants.createTourDriver).toHaveBeenCalled();
      expect(mockDrive).toHaveBeenCalled();
    });

    it("resets localStorage when replaying tour", async () => {
      localStorageMock[TOUR_STORAGE_KEYS[TOUR_IDS.dashboard]] = "true";
      render(<HelpButton tourId={TOUR_IDS.dashboard} />);

      const button = screen.getByRole("button", { name: /help/i });
      await user.click(button);

      const menuItem = screen.getByRole("menuitem", {
        name: /replay page tour/i,
      });
      await user.click(menuItem);

      expect(
        localStorageMock[TOUR_STORAGE_KEYS[TOUR_IDS.dashboard]]
      ).toBeUndefined();
    });

    it("destroys existing driver before creating new one", async () => {
      render(<HelpButton tourId={TOUR_IDS.dashboard} />);

      const button = screen.getByRole("button", { name: /help/i });

      // Click replay twice to test cleanup
      await user.click(button);
      await user.click(
        screen.getByRole("menuitem", { name: /replay page tour/i })
      );

      // Open menu again and replay
      await user.click(button);
      await user.click(
        screen.getByRole("menuitem", { name: /replay page tour/i })
      );

      expect(mockDestroy).toHaveBeenCalled();
    });

    it("does not start tour when no steps available", async () => {
      vi.mocked(tourSteps.getTourSteps).mockReturnValue([]);
      render(<HelpButton tourId={TOUR_IDS.dashboard} />);

      const button = screen.getByRole("button", { name: /help/i });
      await user.click(button);

      const menuItem = screen.getByRole("menuitem", {
        name: /replay page tour/i,
      });
      await user.click(menuItem);

      expect(tourConstants.createTourDriver).not.toHaveBeenCalled();
    });
  });

  describe("getEffectiveTourId for review page", () => {
    it("returns reviewSession tourId when session element exists", async () => {
      // Add session element to DOM
      const sessionElement = document.createElement("div");
      sessionElement.setAttribute("data-tour-id", "quiz-progress");
      document.body.appendChild(sessionElement);

      render(<HelpButton tourId={TOUR_IDS.reviewModeSelector} />);

      const button = screen.getByRole("button", { name: /help/i });
      await user.click(button);

      const menuItem = screen.getByRole("menuitem", {
        name: /replay page tour/i,
      });
      await user.click(menuItem);

      expect(tourSteps.getTourSteps).toHaveBeenCalledWith(
        TOUR_IDS.reviewSession
      );

      // Cleanup
      document.body.removeChild(sessionElement);
    });

    it("returns original tourId when session element does not exist", async () => {
      render(<HelpButton tourId={TOUR_IDS.reviewModeSelector} />);

      const button = screen.getByRole("button", { name: /help/i });
      await user.click(button);

      const menuItem = screen.getByRole("menuitem", {
        name: /replay page tour/i,
      });
      await user.click(menuItem);

      expect(tourSteps.getTourSteps).toHaveBeenCalledWith(
        TOUR_IDS.reviewModeSelector
      );
    });

    it("returns original tourId for non-review pages", async () => {
      render(<HelpButton tourId={TOUR_IDS.dashboard} />);

      const button = screen.getByRole("button", { name: /help/i });
      await user.click(button);

      const menuItem = screen.getByRole("menuitem", {
        name: /replay page tour/i,
      });
      await user.click(menuItem);

      expect(tourSteps.getTourSteps).toHaveBeenCalledWith(TOUR_IDS.dashboard);
    });
  });

  describe("localStorage error handling", () => {
    it("handles localStorage removeItem errors gracefully", async () => {
      vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new Error("Storage unavailable");
      });

      render(<HelpButton tourId={TOUR_IDS.dashboard} />);

      const button = screen.getByRole("button", { name: /help/i });
      await user.click(button);

      const menuItem = screen.getByRole("menuitem", {
        name: /replay page tour/i,
      });
      // Should not throw
      await expect(user.click(menuItem)).resolves.not.toThrow();
      expect(mockDrive).toHaveBeenCalled();
    });
  });

  describe("cleanup on unmount", () => {
    it("destroys driver on unmount when tour was started", async () => {
      const { unmount } = render(<HelpButton tourId={TOUR_IDS.dashboard} />);

      // Start a tour first
      const button = screen.getByRole("button", { name: /help/i });
      await user.click(button);
      const menuItem = screen.getByRole("menuitem", {
        name: /replay page tour/i,
      });
      await user.click(menuItem);

      // Clear the mock to only track unmount calls
      mockDestroy.mockClear();

      unmount();

      expect(mockDestroy).toHaveBeenCalled();
    });

    it("handles unmount when no tour has been started", () => {
      const { unmount } = render(<HelpButton tourId={TOUR_IDS.dashboard} />);

      // Unmount without ever clicking replay
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("createTourDriver callback", () => {
    it("passes onDestroyed callback that sets localStorage", async () => {
      render(<HelpButton tourId={TOUR_IDS.dashboard} />);

      const button = screen.getByRole("button", { name: /help/i });
      await user.click(button);

      const menuItem = screen.getByRole("menuitem", {
        name: /replay page tour/i,
      });
      await user.click(menuItem);

      // Get the onDestroyed callback that was passed
      const createDriverCall = vi.mocked(tourConstants.createTourDriver).mock
        .calls[0];
      const options = createDriverCall[0] as { onDestroyed?: () => void };

      // Invoke the callback
      options.onDestroyed?.();

      expect(localStorageMock[TOUR_STORAGE_KEYS[TOUR_IDS.dashboard]]).toBe(
        "true"
      );
    });
  });
});
