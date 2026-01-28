import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AIGenerateModal } from "./AIGenerateModal";

describe("AIGenerateModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("when open", () => {
        it("renders the modal title", () => {
            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            expect(
                screen.getByRole("heading", { name: /generate with ai/i })
            ).toBeInTheDocument();
        });

        it("renders prompt textarea", () => {
            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            expect(
                screen.getByLabelText(/what would you like to learn/i)
            ).toBeInTheDocument();
        });

        it("renders count input", () => {
            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            expect(screen.getByLabelText(/number of items/i)).toBeInTheDocument();
        });

        it("renders cancel button", () => {
            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            expect(
                screen.getByRole("button", { name: /cancel/i })
            ).toBeInTheDocument();
        });

        it("renders generate button", () => {
            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            expect(
                screen.getByRole("button", { name: /generate/i })
            ).toBeInTheDocument();
        });
    });

    describe("when closed", () => {
        it("does not render the modal content", () => {
            render(
                <AIGenerateModal
                    isOpen={false}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            expect(
                screen.queryByRole("heading", { name: /generate with ai/i })
            ).not.toBeInTheDocument();
        });
    });

    describe("prompt suggestion chips", () => {
        it("shows suggestion chips for video-sourced study sets", () => {
            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={true}
                />
            );

            expect(screen.getByText(/key terms/i)).toBeInTheDocument();
            expect(screen.getByText(/main ideas/i)).toBeInTheDocument();
            expect(screen.getByText(/test my understanding/i)).toBeInTheDocument();
        });

        it("does not show suggestion chips for manual study sets", () => {
            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            expect(screen.queryByText(/key terms/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/main ideas/i)).not.toBeInTheDocument();
        });

        it("fills prompt when suggestion chip is clicked", async () => {
            const user = userEvent.setup();
            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={true}
                />
            );

            await user.click(screen.getByText(/key terms/i));

            const textarea = screen.getByLabelText(/what would you like to learn/i);
            // The prompt should contain "key terms" (case insensitive)
            expect((textarea as HTMLTextAreaElement).value.toLowerCase()).toContain("key terms");
        });
    });

    describe("item type selector", () => {
        it("renders item type options", () => {
            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            expect(screen.getByText(/mix \(ai decides\)/i)).toBeInTheDocument();
            expect(screen.getByText(/flashcards only/i)).toBeInTheDocument();
            expect(screen.getByText(/questions only/i)).toBeInTheDocument();
        });

        it("defaults to mix mode", () => {
            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            const mixButton = screen.getByRole("radio", { name: /mix \(ai decides\)/i });
            expect(mixButton).toHaveAttribute("aria-checked", "true");
        });

        it("allows selecting a different item type", async () => {
            const user = userEvent.setup();
            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            await user.click(screen.getByText(/questions only/i));

            const questionsButton = screen.getByRole("radio", { name: /questions only/i });
            expect(questionsButton).toHaveAttribute("aria-checked", "true");

            const mixButton = screen.getByRole("radio", { name: /mix \(ai decides\)/i });
            expect(mixButton).toHaveAttribute("aria-checked", "false");
        });

        it("sends selected item type in API request", async () => {
            const user = userEvent.setup();
            const onSuggestionsGenerated = vi.fn();

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: {
                            suggestions: [
                                {
                                    tempId: "temp-1",
                                    itemType: "question",
                                    questionText: "What is TS?",
                                    options: [
                                        { optionText: "TypeScript", isCorrect: true, explanation: "Correct" },
                                        { optionText: "Java", isCorrect: false, explanation: "Wrong" },
                                        { optionText: "Python", isCorrect: false, explanation: "Wrong" },
                                        { optionText: "Go", isCorrect: false, explanation: "Wrong" },
                                    ],
                                },
                            ],
                        },
                    }),
            });

            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={onSuggestionsGenerated}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            await user.type(
                screen.getByLabelText(/what would you like to learn/i),
                "TypeScript questions"
            );
            await user.click(screen.getByText(/questions only/i));
            await user.click(screen.getByRole("button", { name: /generate/i }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    "/api/v1/study-sets/abc-123/ai/generate",
                    expect.objectContaining({
                        method: "POST",
                        body: JSON.stringify({
                            prompt: "TypeScript questions",
                            count: 5,
                            itemType: "questions",
                        }),
                    })
                );
            });
        });
    });

    describe("form validation", () => {
        it("disables generate button when prompt is empty", () => {
            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            expect(screen.getByRole("button", { name: /generate/i })).toBeDisabled();
        });

        it("enables generate button when prompt is provided", async () => {
            const user = userEvent.setup();
            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            await user.type(
                screen.getByLabelText(/what would you like to learn/i),
                "JavaScript basics"
            );

            expect(screen.getByRole("button", { name: /generate/i })).toBeEnabled();
        });

        it("allows typing in prompt textarea", async () => {
            const user = userEvent.setup();
            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            const textarea = screen.getByLabelText(/what would you like to learn/i);
            await user.type(textarea, "React hooks and state management");

            expect(textarea).toHaveValue("React hooks and state management");
        });

        it("allows changing count within valid range", async () => {
            const user = userEvent.setup();
            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            const countInput = screen.getByLabelText(/number of items/i) as HTMLInputElement;
            // Default is 5, let's increase it by typing more digits
            await user.clear(countInput);
            await user.type(countInput, "10");

            // The input should have a value between 1 and 100
            const value = countInput.value;
            const numValue = parseInt(value, 10);
            expect(numValue).toBeGreaterThanOrEqual(1);
            expect(numValue).toBeLessThanOrEqual(100);
        });

        it("has default count of 5", () => {
            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            expect(screen.getByLabelText(/number of items/i)).toHaveValue(5);
        });
    });

    describe("form submission", () => {
        it("calls API and onSuggestionsGenerated on successful generation", async () => {
            const user = userEvent.setup();
            const onSuggestionsGenerated = vi.fn();

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: {
                            suggestions: [
                                {
                                    tempId: "temp-1",
                                    itemType: "flashcard",
                                    front: "What is JavaScript?",
                                    back: "A programming language",
                                },
                                {
                                    tempId: "temp-2",
                                    itemType: "question",
                                    questionText: "Which is a JS framework?",
                                    options: [
                                        { optionText: "React", isCorrect: true, explanation: "Correct" },
                                        { optionText: "Django", isCorrect: false, explanation: "Python" },
                                        { optionText: "Rails", isCorrect: false, explanation: "Ruby" },
                                        { optionText: "Laravel", isCorrect: false, explanation: "PHP" },
                                    ],
                                },
                            ],
                        },
                    }),
            });

            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={onSuggestionsGenerated}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            await user.type(
                screen.getByLabelText(/what would you like to learn/i),
                "JavaScript basics"
            );
            await user.click(screen.getByRole("button", { name: /generate/i }));

            await waitFor(() => {
                expect(onSuggestionsGenerated).toHaveBeenCalledWith([
                    {
                        tempId: "temp-1",
                        itemType: "flashcard",
                        front: "What is JavaScript?",
                        back: "A programming language",
                    },
                    {
                        tempId: "temp-2",
                        itemType: "question",
                        questionText: "Which is a JS framework?",
                        options: [
                            { optionText: "React", isCorrect: true, explanation: "Correct" },
                            { optionText: "Django", isCorrect: false, explanation: "Python" },
                            { optionText: "Rails", isCorrect: false, explanation: "Ruby" },
                            { optionText: "Laravel", isCorrect: false, explanation: "PHP" },
                        ],
                    },
                ]);
            });

            expect(global.fetch).toHaveBeenCalledWith(
                "/api/v1/study-sets/abc-123/ai/generate",
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({
                        prompt: "JavaScript basics",
                        count: 5,
                        itemType: "mix",
                    }),
                })
            );
        });

        it("shows error when API call fails", async () => {
            const user = userEvent.setup();

            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                json: () =>
                    Promise.resolve({
                        status: "fail",
                        data: { error: "Failed to generate suggestions" },
                    }),
            });

            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            await user.type(
                screen.getByLabelText(/what would you like to learn/i),
                "Test prompt"
            );
            await user.click(screen.getByRole("button", { name: /generate/i }));

            await waitFor(() => {
                expect(screen.getByText(/failed to generate suggestions/i)).toBeInTheDocument();
            });
        });

        it("shows loading state while generating", async () => {
            const user = userEvent.setup();

            // Create a promise that we can control
            let resolvePromise: (value: unknown) => void;
            const pendingPromise = new Promise((resolve) => {
                resolvePromise = resolve;
            });

            global.fetch = vi.fn().mockReturnValue(pendingPromise);

            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            await user.type(
                screen.getByLabelText(/what would you like to learn/i),
                "Test prompt"
            );
            await user.click(screen.getByRole("button", { name: /generate/i }));

            // Should show loading state
            expect(screen.getByText(/generating/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/what would you like to learn/i)).toBeDisabled();

            // Resolve the promise to clean up
            resolvePromise!({
                ok: true,
                json: () => Promise.resolve({ status: "success", data: { suggestions: [] } }),
            });
        });

        it("disables inputs while loading", async () => {
            const user = userEvent.setup();

            let resolvePromise: (value: unknown) => void;
            const pendingPromise = new Promise((resolve) => {
                resolvePromise = resolve;
            });

            global.fetch = vi.fn().mockReturnValue(pendingPromise);

            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            await user.type(
                screen.getByLabelText(/what would you like to learn/i),
                "Test prompt"
            );
            await user.click(screen.getByRole("button", { name: /generate/i }));

            expect(screen.getByLabelText(/what would you like to learn/i)).toBeDisabled();
            expect(screen.getByLabelText(/number of items/i)).toBeDisabled();
            expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();

            resolvePromise!({
                ok: true,
                json: () => Promise.resolve({ status: "success", data: { suggestions: [] } }),
            });
        });
    });

    describe("cancel behavior", () => {
        it("calls onClose when cancel is clicked", async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();

            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={onClose}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            await user.click(screen.getByRole("button", { name: /cancel/i }));

            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    describe("form reset", () => {
        it("clears form when modal is reopened", async () => {
            const user = userEvent.setup();
            const { rerender } = render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            await user.type(
                screen.getByLabelText(/what would you like to learn/i),
                "Some prompt text"
            );

            // Close modal
            rerender(
                <AIGenerateModal
                    isOpen={false}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            // Reopen modal
            rerender(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onSuggestionsGenerated={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            expect(screen.getByLabelText(/what would you like to learn/i)).toHaveValue("");
        });
    });
});
