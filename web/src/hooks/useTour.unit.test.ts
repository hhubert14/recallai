import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTour } from "./useTour";
import { TOUR_IDS, TOUR_STORAGE_KEYS } from "@/components/tour/tour-constants";

// Mock driver.js
vi.mock("driver.js", () => ({
  driver: vi.fn(() => ({
    drive: vi.fn(),
    destroy: vi.fn(),
    isActive: vi.fn(() => false),
    getActiveIndex: vi.fn(() => 0),
  })),
}));

describe("useTour", () => {
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
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

  describe("initialization", () => {
    it("returns isCompleted as false when tour has not been completed", () => {
      const { result } = renderHook(() =>
        useTour({ tourId: TOUR_IDS.dashboard, autoStart: false })
      );

      expect(result.current.isCompleted).toBe(false);
    });

    it("returns isCompleted as true when tour has been completed", () => {
      localStorageMock[TOUR_STORAGE_KEYS.dashboard] = "true";

      const { result } = renderHook(() =>
        useTour({ tourId: TOUR_IDS.dashboard, autoStart: false })
      );

      expect(result.current.isCompleted).toBe(true);
    });

    it("starts in non-running state by default", () => {
      const { result } = renderHook(() =>
        useTour({ tourId: TOUR_IDS.dashboard, autoStart: false })
      );

      expect(result.current.isRunning).toBe(false);
    });
  });

  describe("autoStart", () => {
    it("does not auto-start when autoStart is false", async () => {
      const { result } = renderHook(() =>
        useTour({ tourId: TOUR_IDS.dashboard, autoStart: false })
      );

      // Wait a tick to ensure any async effects have run
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isRunning).toBe(false);
    });

    it("does not auto-start when tour is already completed", async () => {
      localStorageMock[TOUR_STORAGE_KEYS.dashboard] = "true";

      const { result } = renderHook(() =>
        useTour({ tourId: TOUR_IDS.dashboard, autoStart: true })
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isRunning).toBe(false);
    });

    it("auto-starts when autoStart is true and tour not completed", async () => {
      const { result } = renderHook(() =>
        useTour({ tourId: TOUR_IDS.dashboard, autoStart: true })
      );

      await waitFor(() => {
        expect(result.current.isRunning).toBe(true);
      });
    });
  });

  describe("startTour", () => {
    it("sets isRunning to true when startTour is called", async () => {
      const { result } = renderHook(() =>
        useTour({ tourId: TOUR_IDS.dashboard, autoStart: false })
      );

      act(() => {
        result.current.startTour();
      });

      expect(result.current.isRunning).toBe(true);
    });

    it("starts tour even if already completed (for replay functionality)", async () => {
      localStorageMock[TOUR_STORAGE_KEYS.dashboard] = "true";

      const { result } = renderHook(() =>
        useTour({ tourId: TOUR_IDS.dashboard, autoStart: false })
      );

      act(() => {
        result.current.startTour();
      });

      expect(result.current.isRunning).toBe(true);
    });
  });

  describe("stopTour", () => {
    it("sets isRunning to false when stopTour is called", async () => {
      const { result } = renderHook(() =>
        useTour({ tourId: TOUR_IDS.dashboard, autoStart: false })
      );

      act(() => {
        result.current.startTour();
      });

      expect(result.current.isRunning).toBe(true);

      act(() => {
        result.current.stopTour();
      });

      expect(result.current.isRunning).toBe(false);
    });
  });

  describe("completeTour", () => {
    it("marks tour as completed in localStorage", () => {
      const { result } = renderHook(() =>
        useTour({ tourId: TOUR_IDS.dashboard, autoStart: false })
      );

      act(() => {
        result.current.completeTour();
      });

      expect(localStorageMock[TOUR_STORAGE_KEYS.dashboard]).toBe("true");
      expect(result.current.isCompleted).toBe(true);
    });

    it("sets isRunning to false when completing tour", () => {
      const { result } = renderHook(() =>
        useTour({ tourId: TOUR_IDS.dashboard, autoStart: false })
      );

      act(() => {
        result.current.startTour();
      });

      act(() => {
        result.current.completeTour();
      });

      expect(result.current.isRunning).toBe(false);
    });
  });

  describe("resetTour", () => {
    it("clears completion state from localStorage", () => {
      localStorageMock[TOUR_STORAGE_KEYS.dashboard] = "true";

      const { result } = renderHook(() =>
        useTour({ tourId: TOUR_IDS.dashboard, autoStart: false })
      );

      act(() => {
        result.current.resetTour();
      });

      expect(localStorageMock[TOUR_STORAGE_KEYS.dashboard]).toBeUndefined();
      expect(result.current.isCompleted).toBe(false);
    });
  });

  describe("different tour IDs", () => {
    it("uses correct storage key for study set detail tour", () => {
      const { result } = renderHook(() =>
        useTour({ tourId: TOUR_IDS.studySetDetail, autoStart: false })
      );

      act(() => {
        result.current.completeTour();
      });

      expect(localStorageMock[TOUR_STORAGE_KEYS[TOUR_IDS.studySetDetail]]).toBe(
        "true"
      );
    });

    it("uses correct storage key for review mode selector tour", () => {
      const { result } = renderHook(() =>
        useTour({ tourId: TOUR_IDS.reviewModeSelector, autoStart: false })
      );

      act(() => {
        result.current.completeTour();
      });

      expect(
        localStorageMock[TOUR_STORAGE_KEYS[TOUR_IDS.reviewModeSelector]]
      ).toBe("true");
    });
  });

  describe("localStorage error handling", () => {
    it("handles localStorage errors gracefully during read", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("localStorage unavailable");
      });

      // Should not throw
      const { result } = renderHook(() =>
        useTour({ tourId: TOUR_IDS.dashboard, autoStart: false })
      );

      expect(result.current.isCompleted).toBe(false);
    });

    it("handles localStorage errors gracefully during write", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("localStorage unavailable");
      });

      const { result } = renderHook(() =>
        useTour({ tourId: TOUR_IDS.dashboard, autoStart: false })
      );

      // Should not throw
      act(() => {
        result.current.completeTour();
      });

      // State should still update even if storage fails
      expect(result.current.isCompleted).toBe(true);
    });
  });
});
