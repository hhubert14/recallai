import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddItemModal } from "./AddItemModal";

describe("AddItemModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("when open", () => {
        it("renders the modal title", () => {
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            expect(
                screen.getByRole("heading", { name: /add item/i })
            ).toBeInTheDocument();
        });

        it("shows flashcard tab as active by default", () => {
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            // Should show front/back inputs for flashcard
            expect(screen.getByLabelText(/front/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/back/i)).toBeInTheDocument();
        });

        it("renders cancel button", () => {
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            expect(
                screen.getByRole("button", { name: /cancel/i })
            ).toBeInTheDocument();
        });
    });

    describe("when closed", () => {
        it("does not render the modal content", () => {
            render(
                <AddItemModal
                    isOpen={false}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            expect(
                screen.queryByRole("heading", { name: /add item/i })
            ).not.toBeInTheDocument();
        });
    });

    describe("tab switching", () => {
        it("switches to question form when Question tab is clicked", async () => {
            const user = userEvent.setup();
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            await user.click(screen.getByRole("button", { name: /^question$/i }));

            // Should now show question inputs instead of flashcard inputs
            expect(screen.queryByLabelText(/front/i)).not.toBeInTheDocument();
            expect(screen.getByLabelText(/question text/i)).toBeInTheDocument();
        });

        it("switches back to flashcard form when Flashcard tab is clicked", async () => {
            const user = userEvent.setup();
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            // First switch to question
            await user.click(screen.getByRole("button", { name: /^question$/i }));
            // Then switch back to flashcard
            await user.click(screen.getByRole("button", { name: /^flashcard$/i }));

            expect(screen.getByLabelText(/front/i)).toBeInTheDocument();
        });
    });

    describe("flashcard form", () => {
        it("allows typing in front and back inputs", async () => {
            const user = userEvent.setup();
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            const frontInput = screen.getByLabelText(/front/i);
            const backInput = screen.getByLabelText(/back/i);

            await user.type(frontInput, "What is TDD?");
            await user.type(backInput, "Test-Driven Development");

            expect(frontInput).toHaveValue("What is TDD?");
            expect(backInput).toHaveValue("Test-Driven Development");
        });

        it("disables add button when front is empty", async () => {
            const user = userEvent.setup();
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            await user.type(screen.getByLabelText(/back/i), "Some answer");

            expect(screen.getByRole("button", { name: /^add$/i })).toBeDisabled();
        });

        it("disables add button when back is empty", async () => {
            const user = userEvent.setup();
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            await user.type(screen.getByLabelText(/front/i), "Some question");

            expect(screen.getByRole("button", { name: /^add$/i })).toBeDisabled();
        });

        it("enables add button when both front and back are provided", async () => {
            const user = userEvent.setup();
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            await user.type(screen.getByLabelText(/front/i), "What is TDD?");
            await user.type(screen.getByLabelText(/back/i), "Test-Driven Development");

            expect(screen.getByRole("button", { name: /^add$/i })).toBeEnabled();
        });

        it("submits flashcard and calls onFlashcardAdded", async () => {
            const user = userEvent.setup();
            const onFlashcardAdded = vi.fn();

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: {
                            flashcard: {
                                id: 100,
                                videoId: null,
                                userId: "user-123",
                                front: "What is TDD?",
                                back: "Test-Driven Development",
                                createdAt: "2025-01-27T10:00:00Z",
                            },
                        },
                    }),
            });

            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={onFlashcardAdded}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            await user.type(screen.getByLabelText(/front/i), "What is TDD?");
            await user.type(screen.getByLabelText(/back/i), "Test-Driven Development");
            await user.click(screen.getByRole("button", { name: /^add$/i }));

            await waitFor(() => {
                expect(onFlashcardAdded).toHaveBeenCalledWith({
                    id: 100,
                    videoId: null,
                    userId: "user-123",
                    front: "What is TDD?",
                    back: "Test-Driven Development",
                    createdAt: "2025-01-27T10:00:00Z",
                });
            });

            expect(global.fetch).toHaveBeenCalledWith(
                "/api/v1/study-sets/abc-123/flashcards",
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({
                        front: "What is TDD?",
                        back: "Test-Driven Development",
                    }),
                })
            );
        });

        it("shows error when submission fails", async () => {
            const user = userEvent.setup();

            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                json: () =>
                    Promise.resolve({
                        status: "fail",
                        data: { error: "Database error" },
                    }),
            });

            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            await user.type(screen.getByLabelText(/front/i), "Some question");
            await user.type(screen.getByLabelText(/back/i), "Answer");
            await user.click(screen.getByRole("button", { name: /^add$/i }));

            await waitFor(() => {
                expect(screen.getByText(/database error/i)).toBeInTheDocument();
            });
        });
    });

    describe("question form", () => {
        it("renders all question form fields", async () => {
            const user = userEvent.setup();
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            await user.click(screen.getByRole("button", { name: /^question$/i }));

            expect(screen.getByLabelText(/question text/i)).toBeInTheDocument();
            // Use placeholder text since label associations may have multiple matches
            expect(screen.getByPlaceholderText("Option A")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Option B")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Option C")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Option D")).toBeInTheDocument();
        });

        it("allows selecting which option is correct via clickable badges", async () => {
            const user = userEvent.setup();
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            await user.click(screen.getByRole("button", { name: /^question$/i }));

            // Initially Option A is correct (one Correct badge, three Wrong badges)
            expect(screen.getByRole("button", { name: /correct/i })).toBeInTheDocument();
            expect(screen.getAllByRole("button", { name: /wrong/i })).toHaveLength(3);

            // Click on first Wrong badge (Option B) to make it correct
            const wrongBadges = screen.getAllByRole("button", { name: /wrong/i });
            await user.click(wrongBadges[0]);

            // Now Option B should be correct (still one Correct badge, three Wrong badges)
            expect(screen.getByRole("button", { name: /correct/i })).toBeInTheDocument();
            expect(screen.getAllByRole("button", { name: /wrong/i })).toHaveLength(3);
        });

        it("submits question and calls onQuestionAdded", async () => {
            const user = userEvent.setup();
            const onQuestionAdded = vi.fn();

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: {
                            question: {
                                id: 100,
                                videoId: null,
                                questionText: "What is TDD?",
                                options: [
                                    { id: 1, optionText: "Option A", isCorrect: true, explanation: null },
                                    { id: 2, optionText: "Option B", isCorrect: false, explanation: null },
                                    { id: 3, optionText: "Option C", isCorrect: false, explanation: null },
                                    { id: 4, optionText: "Option D", isCorrect: false, explanation: null },
                                ],
                                sourceQuote: null,
                                sourceTimestamp: null,
                            },
                        },
                    }),
            });

            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={onQuestionAdded}
                    studySetPublicId="abc-123"
                />
            );

            await user.click(screen.getByRole("button", { name: /^question$/i }));

            // Use specific input IDs since there are multiple labels with "Option A" etc.
            await user.type(screen.getByLabelText(/question text/i), "What is TDD?");
            await user.type(screen.getByPlaceholderText("Option A"), "Test-Driven Development");
            await user.type(screen.getByPlaceholderText("Option B"), "Technical Design Document");
            await user.type(screen.getByPlaceholderText("Option C"), "Top-Down Design");
            await user.type(screen.getByPlaceholderText("Option D"), "Type Definition Document");

            await user.click(screen.getByRole("button", { name: /^add$/i }));

            await waitFor(() => {
                expect(onQuestionAdded).toHaveBeenCalled();
            });

            expect(global.fetch).toHaveBeenCalledWith(
                "/api/v1/study-sets/abc-123/questions",
                expect.objectContaining({
                    method: "POST",
                })
            );
        });
    });

    describe("form reset", () => {
        it("clears flashcard form when modal is reopened", async () => {
            const user = userEvent.setup();
            const { rerender } = render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            await user.type(screen.getByLabelText(/front/i), "Some text");

            // Close modal
            rerender(
                <AddItemModal
                    isOpen={false}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            // Reopen modal
            rerender(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            expect(screen.getByLabelText(/front/i)).toHaveValue("");
        });
    });

    describe("cancel behavior", () => {
        it("calls onClose when cancel is clicked", async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={onClose}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            await user.click(screen.getByRole("button", { name: /cancel/i }));

            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    describe("UI polish", () => {
        it("uses Textarea for flashcard back field", () => {
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            const backField = screen.getByLabelText(/back/i);
            // Textarea elements have tagName "TEXTAREA"
            expect(backField.tagName).toBe("TEXTAREA");
        });

        it("uses Textarea for question text field", async () => {
            const user = userEvent.setup();
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            await user.click(screen.getByRole("button", { name: /^question$/i }));

            const questionField = screen.getByLabelText(/question text/i);
            expect(questionField.tagName).toBe("TEXTAREA");
        });

        it("uses clickable Correct/Wrong badges instead of radio buttons for question options", async () => {
            const user = userEvent.setup();
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            await user.click(screen.getByRole("button", { name: /^question$/i }));

            // Should have clickable "Correct" badge for option A (default)
            expect(screen.getByRole("button", { name: /correct/i })).toBeInTheDocument();
            // Should have clickable "Wrong" badges for options B, C, D
            expect(screen.getAllByRole("button", { name: /wrong/i })).toHaveLength(3);
        });

        it("changes correct answer when badge is clicked", async () => {
            const user = userEvent.setup();
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            await user.click(screen.getByRole("button", { name: /^question$/i }));

            // Initially, Option A is correct (one Correct badge, three Wrong badges)
            expect(screen.getByRole("button", { name: /correct/i })).toBeInTheDocument();
            expect(screen.getAllByRole("button", { name: /wrong/i })).toHaveLength(3);

            // Click on first Wrong badge (Option B)
            const wrongBadges = screen.getAllByRole("button", { name: /wrong/i });
            await user.click(wrongBadges[0]);

            // Now Option B should be correct (still one Correct, three Wrong badges)
            expect(screen.getByRole("button", { name: /correct/i })).toBeInTheDocument();
            expect(screen.getAllByRole("button", { name: /wrong/i })).toHaveLength(3);
        });

        it("applies active styling to selected tab", () => {
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            const flashcardTab = screen.getByRole("button", { name: /^flashcard$/i });
            // Active tab should have primary styling
            expect(flashcardTab).toHaveClass("border-primary");
            expect(flashcardTab).toHaveClass("bg-primary");
        });

        it("applies inactive styling to non-selected tab", () => {
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            const questionTab = screen.getByRole("button", { name: /^question$/i });
            // Inactive tab should have border-border and bg-background styling
            expect(questionTab).toHaveClass("border-border");
            expect(questionTab).toHaveClass("bg-background");
        });
    });

    describe("character counts", () => {
        it("displays character count for flashcard front field", async () => {
            const user = userEvent.setup();
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            // Initially 0/500
            expect(screen.getByText("0/500")).toBeInTheDocument();

            await user.type(screen.getByLabelText(/front/i), "Hello");

            expect(screen.getByText("5/500")).toBeInTheDocument();
        });

        it("displays character count for flashcard back field", async () => {
            const user = userEvent.setup();
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            // Initially 0/2000
            expect(screen.getByText("0/2000")).toBeInTheDocument();

            await user.type(screen.getByLabelText(/back/i), "This is an answer");

            expect(screen.getByText("17/2000")).toBeInTheDocument();
        });

        it("displays character count for question text field", async () => {
            const user = userEvent.setup();
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            await user.click(screen.getByRole("button", { name: /^question$/i }));

            // Initially 0/1000
            expect(screen.getByText("0/1000")).toBeInTheDocument();

            await user.type(screen.getByLabelText(/question text/i), "What is TDD?");

            expect(screen.getByText("12/1000")).toBeInTheDocument();
        });

        it("displays character count for each option field", async () => {
            const user = userEvent.setup();
            render(
                <AddItemModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                />
            );

            await user.click(screen.getByRole("button", { name: /^question$/i }));

            // All option fields should show 0/500 initially
            const optionCounters = screen.getAllByText("0/500");
            expect(optionCounters).toHaveLength(4);

            await user.type(screen.getByPlaceholderText("Option A"), "Test answer");

            // First option should now show 11/500
            expect(screen.getByText("11/500")).toBeInTheDocument();
        });
    });
});
