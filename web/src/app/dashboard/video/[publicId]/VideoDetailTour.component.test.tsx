import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { VideoDetailTour } from "./VideoDetailTour";
import * as useTourModule from "@/hooks/useTour";
import { TOUR_IDS } from "@/components/tour/tour-constants";

vi.mock("@/hooks/useTour");

describe("VideoDetailTour", () => {
  const mockUseTourReturn: useTourModule.UseTourReturn = {
    isRunning: false,
    isCompleted: false,
    startTour: vi.fn(),
    stopTour: vi.fn(),
    completeTour: vi.fn(),
    resetTour: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTourModule.useTour).mockReturnValue(mockUseTourReturn);
  });

  it("initializes tour with correct tourId", () => {
    render(<VideoDetailTour />);

    expect(useTourModule.useTour).toHaveBeenCalledWith(
      expect.objectContaining({ tourId: TOUR_IDS.videoDetail })
    );
  });

  it("configures tour to auto-start", () => {
    render(<VideoDetailTour />);

    expect(useTourModule.useTour).toHaveBeenCalledWith(
      expect.objectContaining({ autoStart: true })
    );
  });

  it("uses 800ms auto-start delay", () => {
    render(<VideoDetailTour />);

    expect(useTourModule.useTour).toHaveBeenCalledWith(
      expect.objectContaining({ autoStartDelay: 800 })
    );
  });

  it("renders null (no visible output)", () => {
    const { container } = render(<VideoDetailTour />);

    expect(container.firstChild).toBeNull();
  });
});
