import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LibraryStudySetCard } from "./LibraryStudySetCard";
import { StudySetWithCounts } from "./ClientLibraryStudySetList";

// Mock lucide-react icons to make them testable
vi.mock("lucide-react", () => ({
    Video: () => <svg data-testid="video-icon" aria-label="Video icon" />,
    BookOpen: () => <svg data-testid="book-open-icon" aria-label="Book open icon" />,
    HelpCircle: () => <svg data-testid="help-circle-icon" />,
    Layers: () => <svg data-testid="layers-icon" />,
}));

function createMockStudySet(
    overrides: Partial<StudySetWithCounts> = {}
): StudySetWithCounts {
    return {
        id: 1,
        publicId: "test-public-id-123",
        name: "Test Study Set",
        description: null,
        sourceType: "video",
        createdAt: "2026-01-15T10:00:00Z",
        questionCount: 5,
        flashcardCount: 10,
        ...overrides,
    };
}

describe("LibraryStudySetCard", () => {
    describe("icon rendering based on sourceType", () => {
        it("renders Video icon when sourceType is 'video'", () => {
            const studySet = createMockStudySet({ sourceType: "video" });

            render(<LibraryStudySetCard studySet={studySet} />);

            expect(screen.getByTestId("video-icon")).toBeInTheDocument();
            expect(screen.queryByTestId("book-open-icon")).not.toBeInTheDocument();
        });

        it("renders BookOpen icon when sourceType is not 'video'", () => {
            const studySet = createMockStudySet({ sourceType: "manual" });

            render(<LibraryStudySetCard studySet={studySet} />);

            expect(screen.getByTestId("book-open-icon")).toBeInTheDocument();
            expect(screen.queryByTestId("video-icon")).not.toBeInTheDocument();
        });
    });

    describe("description rendering", () => {
        it("renders description when present", () => {
            const studySet = createMockStudySet({
                description: "This is a test description",
            });

            render(<LibraryStudySetCard studySet={studySet} />);

            expect(screen.getByText("This is a test description")).toBeInTheDocument();
        });

        it("does not render description when null", () => {
            const studySet = createMockStudySet({ description: null });

            render(<LibraryStudySetCard studySet={studySet} />);

            // The description text should not be present
            // (The component only renders the description paragraph when description is truthy)
            expect(screen.queryByText("This is a test description")).not.toBeInTheDocument();

            // Verify heading exists but no sibling paragraph for description
            const heading = screen.getByRole("heading", { name: "Test Study Set" });
            const parentDiv = heading.parentElement;
            const descriptionParagraph = parentDiv?.querySelector("p.truncate");
            expect(descriptionParagraph).toBeNull();
        });
    });

    describe("link navigation", () => {
        it("links to the correct study set detail page", () => {
            const studySet = createMockStudySet({ publicId: "my-study-set-456" });

            render(<LibraryStudySetCard studySet={studySet} />);

            const link = screen.getByRole("link");
            expect(link).toHaveAttribute(
                "href",
                "/dashboard/study-set/my-study-set-456"
            );
        });
    });

    describe("content display", () => {
        it("renders the study set name", () => {
            const studySet = createMockStudySet({ name: "TypeScript Fundamentals" });

            render(<LibraryStudySetCard studySet={studySet} />);

            expect(
                screen.getByRole("heading", { name: "TypeScript Fundamentals" })
            ).toBeInTheDocument();
        });

        it("renders question count", () => {
            const studySet = createMockStudySet({ questionCount: 15 });

            render(<LibraryStudySetCard studySet={studySet} />);

            expect(screen.getByText("15")).toBeInTheDocument();
        });

        it("renders flashcard count", () => {
            const studySet = createMockStudySet({ flashcardCount: 20 });

            render(<LibraryStudySetCard studySet={studySet} />);

            expect(screen.getByText("20")).toBeInTheDocument();
        });

        it("renders formatted date", () => {
            const studySet = createMockStudySet({
                createdAt: "2026-06-15T10:00:00Z",
            });

            render(<LibraryStudySetCard studySet={studySet} />);

            expect(screen.getByText("June 15, 2026")).toBeInTheDocument();
        });
    });

    describe("isVideoSourced behavior", () => {
        it("treats 'video' sourceType as video-sourced", () => {
            const studySet = createMockStudySet({ sourceType: "video" });

            render(<LibraryStudySetCard studySet={studySet} />);

            expect(screen.getByTestId("video-icon")).toBeInTheDocument();
        });

        it("treats 'manual' sourceType as non-video-sourced", () => {
            const studySet = createMockStudySet({ sourceType: "manual" });

            render(<LibraryStudySetCard studySet={studySet} />);

            expect(screen.getByTestId("book-open-icon")).toBeInTheDocument();
        });
    });
});
