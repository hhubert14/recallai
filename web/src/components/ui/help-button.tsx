"use client";

import { HelpCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTour } from "@/hooks/useTour";
import { TOUR_IDS, type TourId } from "@/components/tour/tour-constants";
import "driver.js/dist/driver.css";

interface HelpButtonProps {
  /** The tour ID for the current page */
  tourId: TourId;
}

/**
 * Help button with dropdown menu for tour replay
 * Add to page headers to allow users to replay the page tour
 */
export function HelpButton({ tourId }: HelpButtonProps) {
  const { startTour, resetTour } = useTour({
    tourId,
    autoStart: false,
  });

  const handleReplayTour = () => {
    resetTour();
    // Small delay to ensure state is reset before starting
    setTimeout(() => {
      startTour();
    }, 100);
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
