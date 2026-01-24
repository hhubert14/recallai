import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import { DashboardTour } from "./DashboardTour";
import * as useTourModule from "@/hooks/useTour";
import { TOUR_IDS } from "@/components/tour/tour-constants";
import { STORAGE_KEY as WELCOME_MODAL_STORAGE_KEY } from "./WelcomeModal/welcome-steps";

vi.mock("@/hooks/useTour");

describe("DashboardTour", () => {
  let localStorageMock: Record<string, string>;
  const mockStartTour = vi.fn();

  const mockUseTourReturn: useTourModule.UseTourReturn = {
    isRunning: false,
    isCompleted: false,
    startTour: mockStartTour,
    stopTour: vi.fn(),
    completeTour: vi.fn(),
    resetTour: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorageMock = {};

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key: string) => localStorageMock[key] ?? null
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      (key: string, value: string) => {
        localStorageMock[key] = value;
      }
    );

    vi.mocked(useTourModule.useTour).mockReturnValue(mockUseTourReturn);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("hook initialization", () => {
    it("initializes tour with correct tourId", () => {
      render(<DashboardTour />);

      expect(useTourModule.useTour).toHaveBeenCalledWith(
        expect.objectContaining({ tourId: TOUR_IDS.dashboard })
      );
    });

    it("configures tour with autoStart: false (manual control)", () => {
      render(<DashboardTour />);

      expect(useTourModule.useTour).toHaveBeenCalledWith(
        expect.objectContaining({ autoStart: false })
      );
    });

    it("renders null (no visible output)", () => {
      const { container } = render(<DashboardTour />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("welcome modal integration", () => {
    it("starts tour when welcome modal is already completed", async () => {
      localStorageMock[WELCOME_MODAL_STORAGE_KEY] = "true";

      render(<DashboardTour />);

      // Advance timers past the 800ms delay
      await act(async () => {
        vi.advanceTimersByTime(900);
      });

      expect(mockStartTour).toHaveBeenCalled();
    });

    it("does not start tour when welcome modal is not completed", async () => {
      // Welcome modal not completed (no localStorage entry)
      render(<DashboardTour />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockStartTour).not.toHaveBeenCalled();
    });

    it("does not start tour when tour is already completed", async () => {
      localStorageMock[WELCOME_MODAL_STORAGE_KEY] = "true";
      vi.mocked(useTourModule.useTour).mockReturnValue({
        ...mockUseTourReturn,
        isCompleted: true,
      });

      render(<DashboardTour />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockStartTour).not.toHaveBeenCalled();
    });

    it("starts tour when welcomeModalCompleted event is dispatched", async () => {
      render(<DashboardTour />);

      // Initially tour should not start
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(mockStartTour).not.toHaveBeenCalled();

      // Dispatch welcome modal completed event
      await act(async () => {
        window.dispatchEvent(new Event("welcomeModalCompleted"));
      });

      // Now advance timers for the 800ms delay
      await act(async () => {
        vi.advanceTimersByTime(900);
      });

      expect(mockStartTour).toHaveBeenCalled();
    });

    it("cleans up event listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = render(<DashboardTour />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "welcomeModalCompleted",
        expect.any(Function)
      );
    });
  });

  describe("tour start timing", () => {
    it("delays tour start by 800ms after welcome modal completion", async () => {
      localStorageMock[WELCOME_MODAL_STORAGE_KEY] = "true";

      render(<DashboardTour />);

      // Just before 800ms - should not have started
      await act(async () => {
        vi.advanceTimersByTime(799);
      });
      expect(mockStartTour).not.toHaveBeenCalled();

      // At 800ms - should start
      await act(async () => {
        vi.advanceTimersByTime(1);
      });
      expect(mockStartTour).toHaveBeenCalled();
    });

    it("only starts tour once (prevents duplicate starts)", async () => {
      localStorageMock[WELCOME_MODAL_STORAGE_KEY] = "true";

      render(<DashboardTour />);

      // Start the tour
      await act(async () => {
        vi.advanceTimersByTime(900);
      });

      expect(mockStartTour).toHaveBeenCalledTimes(1);

      // Dispatch event again - should not start again
      await act(async () => {
        window.dispatchEvent(new Event("welcomeModalCompleted"));
        vi.advanceTimersByTime(900);
      });

      expect(mockStartTour).toHaveBeenCalledTimes(1);
    });
  });

  describe("localStorage error handling", () => {
    it("assumes welcome modal completed when localStorage unavailable", async () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("localStorage unavailable");
      });

      render(<DashboardTour />);

      await act(async () => {
        vi.advanceTimersByTime(900);
      });

      // Should start tour since we assume completed on error
      expect(mockStartTour).toHaveBeenCalled();
    });
  });
});
