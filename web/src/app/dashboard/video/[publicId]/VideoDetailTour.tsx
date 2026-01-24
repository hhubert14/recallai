"use client";

import { useTour } from "@/hooks/useTour";
import { TOUR_IDS } from "@/components/tour/tour-constants";

/**
 * Video detail page tour component
 * Auto-starts on first visit to a video detail page
 */
export function VideoDetailTour() {
  useTour({
    tourId: TOUR_IDS.videoDetail,
    autoStart: true,
    autoStartDelay: 800,
  });

  // This component doesn't render anything visible
  // The tour UI is handled by driver.js
  return null;
}
