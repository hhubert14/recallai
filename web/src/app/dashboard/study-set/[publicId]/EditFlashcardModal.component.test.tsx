import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditFlashcardModal } from "./EditFlashcardModal";
import type { TermFlashcard } from "./types";

describe("EditFlashcardModal", () => {
    const flashcard: TermFlashcard = {
        id: 100,
        front: "What is TDD?",
        back: "Test-Driven Development",
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("when open", () => {
        it("renders the modal title", () => {
            render(
                <EditFlashcardModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardUpdated={vi.fn()}
                    flashcard={flashcard}
                />
            );

            expect(
                screen.getByRole("heading", { name: /edit flashcard/i })
            ).toBeInTheDocument();
        });

        it("pre-populates the front input with existing value", () => {
            render(
                <EditFlashcardModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardUpdated={vi.fn()}
                    flashcard={flashcard}
                />
            );

            expect(screen.getByLabelText(/front/i)).toHaveValue("What is TDD?");
        });

        it("pre-populates the back input with existing value", () => {
            render(
                <EditFlashcardModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardUpdated={vi.fn()}
                    flashcard={flashcard}
                />
            );

            expect(screen.getByLabelText(/back/i)).toHaveValue("Test-Driven Development");
        });

        it("renders cancel button", () => {
            render(
                <EditFlashcardModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardUpdated={vi.fn()}
                    flashcard={flashcard}
                />
            );

            expect(
                screen.getByRole("button", { name: /cancel/i })
            ).toBeInTheDocument();
        });

        it("renders save button", () => {
            render(
                <EditFlashcardModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardUpdated={vi.fn()}
                    flashcard={flashcard}
                />
            );

            expect(
                screen.getByRole("button", { name: /save/i })
            ).toBeInTheDocument();
        });
    });

    describe("when closed", () => {
        it("does not render the modal content", () => {
            render(
                <EditFlashcardModal
                    isOpen={false}
                    onClose={vi.fn()}
                    onFlashcardUpdated={vi.fn()}
                    flashcard={flashcard}
                />
            );

            expect(
                screen.queryByRole("heading", { name: /edit flashcard/i })
            ).not.toBeInTheDocument();
        });
    });

    describe("form validation", () => {
        it("disables save button when front is empty", async () => {
            const user = userEvent.setup();
            render(
                <EditFlashcardModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardUpdated={vi.fn()}
                    flashcard={flashcard}
                />
            );

            const frontInput = screen.getByLabelText(/front/i);
            await user.clear(frontInput);

            expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
        });

        it("disables save button when back is empty", async () => {
            const user = userEvent.setup();
            render(
                <EditFlashcardModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardUpdated={vi.fn()}
                    flashcard={flashcard}
                />
            );

            const backInput = screen.getByLabelText(/back/i);
            await user.clear(backInput);

            expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
        });

        it("enables save button when both front and back are provided", () => {
            render(
                <EditFlashcardModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardUpdated={vi.fn()}
                    flashcard={flashcard}
                />
            );

            expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
        });
    });

    describe("edit functionality", () => {
        it("allows editing the front text", async () => {
            const user = userEvent.setup();
            render(
                <EditFlashcardModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardUpdated={vi.fn()}
                    flashcard={flashcard}
                />
            );

            const frontInput = screen.getByLabelText(/front/i);
            await user.clear(frontInput);
            await user.type(frontInput, "What is BDD?");

            expect(frontInput).toHaveValue("What is BDD?");
        });

        it("allows editing the back text", async () => {
            const user = userEvent.setup();
            render(
                <EditFlashcardModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardUpdated={vi.fn()}
                    flashcard={flashcard}
                />
            );

            const backInput = screen.getByLabelText(/back/i);
            await user.clear(backInput);
            await user.type(backInput, "Behavior-Driven Development");

            expect(backInput).toHaveValue("Behavior-Driven Development");
        });
    });

    describe("form submission", () => {
        it("submits updated flashcard and calls onFlashcardUpdated", async () => {
            const user = userEvent.setup();
            const onFlashcardUpdated = vi.fn();
            const onClose = vi.fn();

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
                                front: "What is BDD?",
                                back: "Behavior-Driven Development",
                                createdAt: "2025-01-27T10:00:00Z",
                            },
                        },
                    }),
            });

            render(
                <EditFlashcardModal
                    isOpen={true}
                    onClose={onClose}
                    onFlashcardUpdated={onFlashcardUpdated}
                    flashcard={flashcard}
                />
            );

            const frontInput = screen.getByLabelText(/front/i);
            await user.clear(frontInput);
            await user.type(frontInput, "What is BDD?");

            const backInput = screen.getByLabelText(/back/i);
            await user.clear(backInput);
            await user.type(backInput, "Behavior-Driven Development");

            await user.click(screen.getByRole("button", { name: /save/i }));

            await waitFor(() => {
                expect(onFlashcardUpdated).toHaveBeenCalledWith({
                    id: 100,
                    front: "What is BDD?",
                    back: "Behavior-Driven Development",
                });
            });

            expect(global.fetch).toHaveBeenCalledWith(
                "/api/v1/flashcards/100",
                expect.objectContaining({
                    method: "PATCH",
                    body: JSON.stringify({
                        front: "What is BDD?",
                        back: "Behavior-Driven Development",
                    }),
                })
            );

            expect(onClose).toHaveBeenCalled();
        });

        it("shows error when submission fails", async () => {
            const user = userEvent.setup();

            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                json: () =>
                    Promise.resolve({
                        status: "fail",
                        data: { error: "Front of flashcard cannot be empty" },
                    }),
            });

            render(
                <EditFlashcardModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardUpdated={vi.fn()}
                    flashcard={flashcard}
                />
            );

            await user.click(screen.getByRole("button", { name: /save/i }));

            await waitFor(() => {
                expect(screen.getByText(/front of flashcard cannot be empty/i)).toBeInTheDocument();
            });
        });

        it("shows loading state during submission", async () => {
            const user = userEvent.setup();

            let resolvePromise: (value: unknown) => void;
            global.fetch = vi.fn().mockReturnValue(
                new Promise((resolve) => {
                    resolvePromise = resolve;
                })
            );

            render(
                <EditFlashcardModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardUpdated={vi.fn()}
                    flashcard={flashcard}
                />
            );

            await user.click(screen.getByRole("button", { name: /save/i }));

            expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();

            // Cleanup
            resolvePromise!({
                ok: true,
                json: () => Promise.resolve({ status: "success", data: { flashcard } }),
            });
        });
    });

    describe("cancel behavior", () => {
        it("calls onClose when cancel is clicked", async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();
            render(
                <EditFlashcardModal
                    isOpen={true}
                    onClose={onClose}
                    onFlashcardUpdated={vi.fn()}
                    flashcard={flashcard}
                />
            );

            await user.click(screen.getByRole("button", { name: /cancel/i }));

            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    describe("form reset on flashcard change", () => {
        it("resets form when a different flashcard is provided", () => {
            const { rerender } = render(
                <EditFlashcardModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardUpdated={vi.fn()}
                    flashcard={flashcard}
                />
            );

            expect(screen.getByLabelText(/front/i)).toHaveValue("What is TDD?");

            const newFlashcard: TermFlashcard = {
                id: 200,
                front: "What is React?",
                back: "A JavaScript library",
            };

            rerender(
                <EditFlashcardModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardUpdated={vi.fn()}
                    flashcard={newFlashcard}
                />
            );

            expect(screen.getByLabelText(/front/i)).toHaveValue("What is React?");
            expect(screen.getByLabelText(/back/i)).toHaveValue("A JavaScript library");
        });
    });
});
