"use client";

import { useTour } from "@/hooks/useTour";
import { TOUR_IDS } from "@/components/tour/tour-constants";

/**
 * Study set detail page tour component
 * Auto-starts on first visit to a study set detail page
 */
export function StudySetDetailTour() {
  useTour({
    tourId: TOUR_IDS.studySetDetail,
    autoStart: true,
    autoStartDelay: 800,
  });

  // This component doesn't render anything visible
  // The tour UI is handled by driver.js
  return null;
}
