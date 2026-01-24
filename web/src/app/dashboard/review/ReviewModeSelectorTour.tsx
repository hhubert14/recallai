"use client";

import { useTour } from "@/hooks/useTour";
import { TOUR_IDS } from "@/components/tour/tour-constants";

/**
 * Review mode selector tour component
 * Auto-starts on first visit to the review page (mode selection screen)
 */
export function ReviewModeSelectorTour() {
  useTour({
    tourId: TOUR_IDS.reviewModeSelector,
    autoStart: true,
    autoStartDelay: 800,
  });

  // This component doesn't render anything visible
  // The tour UI is handled by driver.js
  return null;
}
