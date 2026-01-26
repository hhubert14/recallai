import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudySetCard } from "./StudySetCard";
import { StudySetWithCounts } from "./ClientStudySetList";
import { LibraryClientWrapper } from "./LibraryClientWrapper";

// Mock lucide-react icons to make them testable
vi.mock("lucide-react", () => ({
    Video: () => <svg data-testid="video-icon" aria-label="Video icon" />,
    BookOpen: () => <svg data-testid="book-open-icon" aria-label="Book open icon" />,
    HelpCircle: () => <svg data-testid="help-circle-icon" />,
    Layers: () => <svg data-testid="layers-icon" />,
    MoreVertical: () => <svg data-testid="more-vertical-icon" />,
    FolderPlus: () => <svg data-testid="folder-plus-icon" />,
    Plus: () => <svg data-testid="plus-icon" />,
    Folder: () => <svg data-testid="folder-icon" />,
    ArrowRight: () => <svg data-testid="arrow-right-icon" />,
    XIcon: () => <svg data-testid="x-icon" />,
    Check: () => <svg data-testid="check-icon" />,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
    useSearchParams: () => ({
        get: vi.fn().mockReturnValue(null),
    }),
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

// Wrapper component that provides the context
function WithLibraryContext({ children }: { children: React.ReactNode }) {
    return (
        <LibraryClientWrapper folders={[]}>
            {children}
        </LibraryClientWrapper>
    );
}

describe("StudySetCard", () => {
    describe("icon rendering based on sourceType", () => {
        it("renders Video icon when sourceType is 'video'", () => {
            const studySet = createMockStudySet({ sourceType: "video" });

            render(<StudySetCard studySet={studySet} />);

            expect(screen.getByTestId("video-icon")).toBeInTheDocument();
            expect(screen.queryByTestId("book-open-icon")).not.toBeInTheDocument();
        });

        it("renders BookOpen icon when sourceType is not 'video'", () => {
            const studySet = createMockStudySet({ sourceType: "manual" });

            render(<StudySetCard studySet={studySet} />);

            expect(screen.getByTestId("book-open-icon")).toBeInTheDocument();
            expect(screen.queryByTestId("video-icon")).not.toBeInTheDocument();
        });
    });

    describe("description rendering", () => {
        it("renders description when present", () => {
            const studySet = createMockStudySet({
                description: "This is a test description",
            });

            render(<StudySetCard studySet={studySet} />);

            expect(screen.getByText("This is a test description")).toBeInTheDocument();
        });

        it("does not render description when null", () => {
            const studySet = createMockStudySet({ description: null });

            render(<StudySetCard studySet={studySet} />);

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

            render(<StudySetCard studySet={studySet} />);

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

            render(<StudySetCard studySet={studySet} />);

            expect(
                screen.getByRole("heading", { name: "TypeScript Fundamentals" })
            ).toBeInTheDocument();
        });

        it("renders question and flashcard counts", () => {
            const studySet = createMockStudySet({
                questionCount: 15,
                flashcardCount: 20,
            });

            render(<StudySetCard studySet={studySet} />);

            expect(
                screen.getByText("15 questions · 20 flashcards")
            ).toBeInTheDocument();
        });
    });

    describe("isVideoSourced behavior", () => {
        it("treats 'video' sourceType as video-sourced", () => {
            const studySet = createMockStudySet({ sourceType: "video" });

            render(<StudySetCard studySet={studySet} />);

            expect(screen.getByTestId("video-icon")).toBeInTheDocument();
        });

        it("treats 'manual' sourceType as non-video-sourced", () => {
            const studySet = createMockStudySet({ sourceType: "manual" });

            render(<StudySetCard studySet={studySet} />);

            expect(screen.getByTestId("book-open-icon")).toBeInTheDocument();
        });
    });

    describe("dropdown menu", () => {
        it("renders dropdown menu trigger when context is provided", () => {
            const studySet = createMockStudySet();

            render(
                <WithLibraryContext>
                    <StudySetCard studySet={studySet} />
                </WithLibraryContext>
            );

            expect(
                screen.getByRole("button", { name: /more options/i })
            ).toBeInTheDocument();
        });

        it("does not render dropdown menu trigger when context is not provided", () => {
            const studySet = createMockStudySet();

            render(<StudySetCard studySet={studySet} />);

            expect(
                screen.queryByRole("button", { name: /more options/i })
            ).not.toBeInTheDocument();
        });

        it("shows Add to Folder option when dropdown is opened", async () => {
            const user = userEvent.setup();
            const studySet = createMockStudySet();

            render(
                <WithLibraryContext>
                    <StudySetCard studySet={studySet} />
                </WithLibraryContext>
            );

            await user.click(screen.getByRole("button", { name: /more options/i }));

            expect(
                screen.getByRole("menuitem", { name: /add to folder/i })
            ).toBeInTheDocument();
        });
    });

    describe("card click navigation", () => {
        it("navigates to study set page when card is clicked", async () => {
            const studySet = createMockStudySet({ publicId: "my-study-set-789" });

            render(
                <WithLibraryContext>
                    <StudySetCard studySet={studySet} />
                </WithLibraryContext>
            );

            // The card link should still work
            const link = screen.getByRole("link");
            expect(link).toHaveAttribute("href", "/dashboard/study-set/my-study-set-789");
        });
    });
});
