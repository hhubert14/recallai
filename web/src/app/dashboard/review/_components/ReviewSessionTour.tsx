"use client";

import { useTour } from "@/hooks/useTour";
import { TOUR_IDS } from "@/components/tour/tour-constants";

/**
 * Review session tour component
 * Auto-starts on first time entering an active review session
 */
export function ReviewSessionTour() {
  // Initialize tour hook - auto-start on first visit to active session
  useTour({
    tourId: TOUR_IDS.reviewSession,
    autoStart: true,
    autoStartDelay: 500, // Shorter delay since user just clicked "Start Session"
  });

  // This component doesn't render anything visible
  // The tour UI is handled by driver.js
  return null;
}
