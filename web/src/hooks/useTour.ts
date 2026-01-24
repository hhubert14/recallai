"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { type Driver } from "driver.js";
// NOTE: CSS is imported centrally in tour-constants.ts
import {
  TOUR_STORAGE_KEYS,
  createTourDriver,
  type TourId,
} from "@/components/tour/tour-constants";
import { getTourSteps } from "@/components/tour/tour-steps";

export interface UseTourOptions {
  /** The tour ID to manage */
  tourId: TourId;
  /** Whether to auto-start the tour if not completed. Default: false */
  autoStart?: boolean;
  /** Delay in ms before auto-starting. Default: 500 */
  autoStartDelay?: number;
}

export interface UseTourReturn {
  /** Whether the tour is currently running */
  isRunning: boolean;
  /** Whether the tour has been completed (stored in localStorage) */
  isCompleted: boolean;
  /** Start the tour */
  startTour: () => void;
  /** Stop the tour without completing */
  stopTour: () => void;
  /** Complete the tour (marks as done in localStorage) */
  completeTour: () => void;
  /** Reset the tour completion state */
  resetTour: () => void;
}

/**
 * Hook to manage guided tour state for a specific page/section
 *
 * @example
 * ```tsx
 * const { isRunning, startTour, completeTour } = useTour({
 *   tourId: "dashboard",
 *   autoStart: true,
 * });
 * ```
 */
export function useTour({
  tourId,
  autoStart = false,
  autoStartDelay = 500,
}: UseTourOptions): UseTourReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);

  const driverRef = useRef<Driver | null>(null);
  const hasAutoStartedRef = useRef(false);

  const initializeDriver = useCallback(() => {
    const steps = getTourSteps(tourId);
    if (steps.length === 0) return null;

    return createTourDriver({
      steps,
      onDestroyed: () => {
        setIsRunning(false);
        // Mark as completed when tour finishes
        try {
          const storageKey = TOUR_STORAGE_KEYS[tourId];
          localStorage.setItem(storageKey, "true");
          setIsCompleted(true);
        } catch {
          // Storage unavailable, just update state
          setIsCompleted(true);
        }
      },
    });
  }, [tourId]);

  const startTour = useCallback(() => {
    // Clean up any existing driver
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    const driverObj = initializeDriver();
    if (driverObj) {
      driverRef.current = driverObj;
      setIsRunning(true);
      driverObj.drive();
    }
  }, [initializeDriver]);

  const stopTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const completeTour = useCallback(() => {
    try {
      const storageKey = TOUR_STORAGE_KEYS[tourId];
      localStorage.setItem(storageKey, "true");
    } catch {
      // Storage unavailable
    }

    setIsCompleted(true);
    stopTour();
  }, [tourId]);

  const resetTour = useCallback(() => {
    try {
      const storageKey = TOUR_STORAGE_KEYS[tourId];
      localStorage.removeItem(storageKey);
    } catch {
      // Storage unavailable
    }
    setIsCompleted(false);
  }, [tourId]);

  useEffect(() => {
    try {
      const storageKey = TOUR_STORAGE_KEYS[tourId];
      const completed = localStorage.getItem(storageKey) === "true";
      setIsCompleted(completed);
    } catch {
      // localStorage unavailable, default to not completed
      setIsCompleted(false);
    }
  }, [tourId]);

  useEffect(() => {
    if (isCompleted === null) {
      return;
    }

    if (!autoStart || hasAutoStartedRef.current || isCompleted) {
      return;
    }

    hasAutoStartedRef.current = true;

    const timer = setTimeout(() => {
      startTour();
    }, autoStartDelay);

    return () => {
      clearTimeout(timer);
    };
  }, [autoStart, isCompleted, startTour, autoStartDelay]);

  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
    };
  }, [tourId]);

  return {
    isRunning,
    isCompleted: isCompleted ?? false, // Return false while loading
    startTour,
    stopTour,
    completeTour,
    resetTour,
  };
}
