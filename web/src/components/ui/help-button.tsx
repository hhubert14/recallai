"use client";

import { useRef } from "react";
import { driver, type Driver } from "driver.js";
import { HelpCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TOUR_IDS,
  TOUR_TARGETS,
  TOUR_STORAGE_KEYS,
  tourSelector,
  type TourId,
} from "@/components/tour/tour-constants";
import { getTourSteps } from "@/components/tour/tour-steps";

interface HelpButtonProps {
  /** The tour ID for the current page */
  tourId: TourId;
}

/**
 * Determine the effective tour ID, checking DOM for session state
 */
function getEffectiveTourId(tourId: TourId): TourId {
  // On review page, check if a session is active by looking for session-specific elements
  if (tourId === TOUR_IDS.reviewModeSelector) {
    const sessionElement = document.querySelector(tourSelector(TOUR_TARGETS.quizProgress));
    if (sessionElement) {
      return TOUR_IDS.reviewSession;
    }
  }
  return tourId;
}

/**
 * Help button with dropdown menu for tour replay
 * Add to page headers to allow users to replay the page tour
 */
export function HelpButton({ tourId }: HelpButtonProps) {
  const driverRef = useRef<Driver | null>(null);

  const handleReplayTour = () => {
    // Check DOM at click time to determine correct tour
    const effectiveTourId = getEffectiveTourId(tourId);

    // Reset completion state for this tour
    try {
      const storageKey = TOUR_STORAGE_KEYS[effectiveTourId];
      localStorage.removeItem(storageKey);
    } catch {
      // Storage unavailable
    }

    // Clean up any existing driver
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    // Create and start the tour
    const steps = getTourSteps(effectiveTourId);
    if (steps.length === 0) return;

    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      steps,
      animate: true,
      overlayColor: "rgb(0, 0, 0)",
      overlayOpacity: 0.5,
      stagePadding: 8,
      stageRadius: 8,
      allowClose: true,
      smoothScroll: true,
      popoverClass: "tour-popover",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Done",
      onDestroyed: () => {
        try {
          const storageKey = TOUR_STORAGE_KEYS[effectiveTourId];
          localStorage.setItem(storageKey, "true");
        } catch {
          // Storage unavailable
        }
      },
    });

    driverRef.current = driverObj;
    driverObj.drive();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          title="Help"
        >
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleReplayTour}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Replay page tour
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
