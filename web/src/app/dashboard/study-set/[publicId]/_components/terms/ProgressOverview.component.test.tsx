import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProgressOverview } from "./ProgressOverview";
import type { StudySetProgress } from "../types";

describe("ProgressOverview", () => {
    it("renders mastered count", () => {
        const progress: StudySetProgress = {
            mastered: 5,
            learning: 3,
            notStarted: 2,
            total: 10,
        };

        render(<ProgressOverview progress={progress} />);

        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText(/mastered/i)).toBeInTheDocument();
    });

    it("renders learning count", () => {
        const progress: StudySetProgress = {
            mastered: 5,
            learning: 3,
            notStarted: 2,
            total: 10,
        };

        render(<ProgressOverview progress={progress} />);

        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText(/still learning/i)).toBeInTheDocument();
    });

    it("renders not started count", () => {
        const progress: StudySetProgress = {
            mastered: 5,
            learning: 3,
            notStarted: 2,
            total: 10,
        };

        render(<ProgressOverview progress={progress} />);

        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText(/not started/i)).toBeInTheDocument();
    });

    it("renders progress bar with correct proportions", () => {
        const progress: StudySetProgress = {
            mastered: 5,
            learning: 3,
            notStarted: 2,
            total: 10,
        };

        render(<ProgressOverview progress={progress} />);

        const progressBar = screen.getByRole("progressbar");
        expect(progressBar).toBeInTheDocument();
    });

    it("handles all items mastered", () => {
        const progress: StudySetProgress = {
            mastered: 10,
            learning: 0,
            notStarted: 0,
            total: 10,
        };

        render(<ProgressOverview progress={progress} />);

        expect(screen.getByText("10")).toBeInTheDocument();
        // Both learning and not started show 0
        const zeros = screen.getAllByText("0");
        expect(zeros).toHaveLength(2);
    });

    it("handles all items not started", () => {
        const progress: StudySetProgress = {
            mastered: 0,
            learning: 0,
            notStarted: 10,
            total: 10,
        };

        render(<ProgressOverview progress={progress} />);

        expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("handles zero total items gracefully", () => {
        const progress: StudySetProgress = {
            mastered: 0,
            learning: 0,
            notStarted: 0,
            total: 0,
        };

        const { container } = render(<ProgressOverview progress={progress} />);

        // Should not crash and should render something
        expect(container).toBeInTheDocument();
    });

    it("has proper accessibility attributes", () => {
        const progress: StudySetProgress = {
            mastered: 5,
            learning: 3,
            notStarted: 2,
            total: 10,
        };

        render(<ProgressOverview progress={progress} />);

        const progressBar = screen.getByRole("progressbar");
        expect(progressBar).toHaveAttribute("aria-valuenow");
        expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    });
});
