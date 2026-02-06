import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ReviewSessionTour } from "./ReviewSessionTour";
import * as useTourModule from "@/hooks/useTour";
import { TOUR_IDS } from "@/components/tour/tour-constants";

vi.mock("@/hooks/useTour");

describe("ReviewSessionTour", () => {
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
    render(<ReviewSessionTour />);

    expect(useTourModule.useTour).toHaveBeenCalledWith(
      expect.objectContaining({ tourId: TOUR_IDS.reviewSession })
    );
  });

  it("configures tour to auto-start", () => {
    render(<ReviewSessionTour />);

    expect(useTourModule.useTour).toHaveBeenCalledWith(
      expect.objectContaining({ autoStart: true })
    );
  });

  it("uses 500ms auto-start delay (shorter since user just clicked Start Session)", () => {
    render(<ReviewSessionTour />);

    expect(useTourModule.useTour).toHaveBeenCalledWith(
      expect.objectContaining({ autoStartDelay: 500 })
    );
  });

  it("renders null (no visible output)", () => {
    const { container } = render(<ReviewSessionTour />);

    expect(container.firstChild).toBeNull();
  });
});
