import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { CollapsibleSummary } from "./CollapsibleSummary";
import { VideoPlayerProvider } from "./VideoPlayerContext";

// Wrap component with VideoPlayerProvider since MarkdownWithTimestamps uses it
function renderWithProvider(ui: React.ReactNode) {
    return render(<VideoPlayerProvider>{ui}</VideoPlayerProvider>);
}

describe("CollapsibleSummary", () => {
    const summaryContent = "# Summary\n\nThis is a test summary with **markdown** content.";

    it("renders a header with 'Summary' title", () => {
        renderWithProvider(<CollapsibleSummary content={summaryContent} />);
        expect(
            screen.getByRole("button", { name: /summary/i })
        ).toBeInTheDocument();
    });

    it("is collapsed by default", () => {
        renderWithProvider(<CollapsibleSummary content={summaryContent} />);
        expect(screen.queryByText(/test summary/i)).not.toBeInTheDocument();
    });

    it("expands when header is clicked", async () => {
        const user = userEvent.setup();
        renderWithProvider(<CollapsibleSummary content={summaryContent} />);

        await user.click(screen.getByRole("button", { name: /summary/i }));

        expect(screen.getByText(/test summary/i)).toBeInTheDocument();
    });

    it("collapses when header is clicked again", async () => {
        const user = userEvent.setup();
        renderWithProvider(<CollapsibleSummary content={summaryContent} />);

        // Expand
        await user.click(screen.getByRole("button", { name: /summary/i }));
        expect(screen.getByText(/test summary/i)).toBeInTheDocument();

        // Collapse
        await user.click(screen.getByRole("button", { name: /summary/i }));
        expect(screen.queryByText(/test summary/i)).not.toBeInTheDocument();
    });

    it("shows expand icon when collapsed", () => {
        renderWithProvider(<CollapsibleSummary content={summaryContent} />);
        // ChevronDown indicates collapsed state
        const button = screen.getByRole("button", { name: /summary/i });
        expect(button.querySelector("svg")).toBeInTheDocument();
    });

    it("can be initially expanded via prop", () => {
        renderWithProvider(
            <CollapsibleSummary content={summaryContent} defaultExpanded />
        );
        expect(screen.getByText(/test summary/i)).toBeInTheDocument();
    });
});
