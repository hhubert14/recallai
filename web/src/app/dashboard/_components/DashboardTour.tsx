"use client";

import { useEffect, useState, useRef } from "react";
import { useTour } from "@/hooks/useTour";
import { TOUR_IDS } from "@/components/tour/tour-constants";
import { STORAGE_KEY as WELCOME_MODAL_STORAGE_KEY } from "./WelcomeModal/welcome-steps";

/**
 * Dashboard tour component
 * Auto-starts after welcome modal is completed
 */
export function DashboardTour() {
  const [welcomeCompleted, setWelcomeCompleted] = useState<boolean | null>(null);
  const hasStartedRef = useRef(false);

  // Check if welcome modal has been completed
  useEffect(() => {
    const checkWelcomeCompleted = () => {
      try {
        const completed = localStorage.getItem(WELCOME_MODAL_STORAGE_KEY) === "true";
        setWelcomeCompleted(completed);
      } catch {
        // If localStorage unavailable, assume completed to avoid blocking
        setWelcomeCompleted(true);
      }
    };

    checkWelcomeCompleted();

    const handleWelcomeComplete = () => {
      setWelcomeCompleted(true);
    };

    window.addEventListener("welcomeModalCompleted", handleWelcomeComplete);
    return () => {
      window.removeEventListener("welcomeModalCompleted", handleWelcomeComplete);
    };
  }, []);

  // Initialize tour hook - auto-start only if welcome modal is completed
  const { startTour, isCompleted } = useTour({
    tourId: TOUR_IDS.dashboard,
    autoStart: false,
  });

  // Start tour when welcome modal completes (and tour not already completed)
  useEffect(() => {
    if (welcomeCompleted && !isCompleted && !hasStartedRef.current) {
      hasStartedRef.current = true;
      const timer = setTimeout(() => {
        startTour();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [welcomeCompleted, isCompleted, startTour]);

  // This component doesn't render anything visible
  // The tour UI is handled by driver.js
  return null;
}
