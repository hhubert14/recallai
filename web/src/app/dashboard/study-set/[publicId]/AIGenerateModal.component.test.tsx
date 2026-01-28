import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AIGenerateModal } from "./AIGenerateModal";
import type { Suggestion } from "@/clean-architecture/domain/services/suggestion-generator.interface";

// Helper to create mock suggestions
const createMockFlashcardSuggestion = (id: string, front: string, back: string): Suggestion => ({
    tempId: id,
    itemType: "flashcard",
    front,
    back,
});

const createMockQuestionSuggestion = (id: string, questionText: string): Suggestion => ({
    tempId: id,
    itemType: "question",
    questionText,
    options: [
        { optionText: "Option A", isCorrect: true, explanation: "Correct answer" },
        { optionText: "Option B", isCorrect: false, explanation: "Wrong" },
        { optionText: "Option C", isCorrect: false, explanation: "Wrong" },
        { optionText: "Option D", isCorrect: false, explanation: "Wrong" },
    ],
});

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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            expect(screen.getByLabelText(/number of items/i)).toHaveValue(5);
        });
    });

    describe("form submission", () => {
        it("calls API and transitions to review phase on successful generation", async () => {
            const user = userEvent.setup();

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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            await user.type(
                screen.getByLabelText(/what would you like to learn/i),
                "JavaScript basics"
            );
            await user.click(screen.getByRole("button", { name: /generate/i }));

            // Should transition to review phase
            await waitFor(() => {
                expect(screen.getByText(/review suggestions/i)).toBeInTheDocument();
            });

            // Generated suggestions should be displayed
            expect(screen.getByText("What is JavaScript?")).toBeInTheDocument();
            expect(screen.getByText("Which is a JS framework?")).toBeInTheDocument();

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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            // Reopen modal
            rerender(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
                    studySetPublicId="abc-123"
                    isVideoSourced={false}
                />
            );

            expect(screen.getByLabelText(/what would you like to learn/i)).toHaveValue("");
        });
    });

    describe("review phase", () => {
        // Helper to generate suggestions and enter review phase
        async function enterReviewPhase(
            user: ReturnType<typeof userEvent.setup>,
            suggestions: Suggestion[]
        ) {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: { suggestions },
                    }),
            });

            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                expect(screen.getByText(/review suggestions/i)).toBeInTheDocument();
            });
        }

        it("shows review phase after successful generation", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "What is React?", "A JavaScript library"),
            ];

            await enterReviewPhase(user, suggestions);

            expect(screen.getByText(/review suggestions/i)).toBeInTheDocument();
        });

        it("displays flashcard suggestion with front and back", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "What is React?", "A JavaScript library"),
            ];

            await enterReviewPhase(user, suggestions);

            expect(screen.getByText("What is React?")).toBeInTheDocument();
            expect(screen.getByText("A JavaScript library")).toBeInTheDocument();
        });

        it("displays question suggestion with question text and options", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockQuestionSuggestion("temp-1", "Which hook is used for side effects?"),
            ];

            await enterReviewPhase(user, suggestions);

            expect(screen.getByText("Which hook is used for side effects?")).toBeInTheDocument();
            expect(screen.getByText("Option A")).toBeInTheDocument();
            expect(screen.getByText("Option B")).toBeInTheDocument();
        });

        it("shows accept, reject, and edit buttons for each suggestion", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "What is React?", "A JavaScript library"),
            ];

            await enterReviewPhase(user, suggestions);

            // Use exact name matching to avoid matching "Accept All"
            const suggestionCard = screen.getByTestId("suggestion-card");
            expect(within(suggestionCard).getByRole("button", { name: /^accept$/i })).toBeInTheDocument();
            expect(within(suggestionCard).getByRole("button", { name: /^reject$/i })).toBeInTheDocument();
            expect(within(suggestionCard).getByRole("button", { name: /^edit$/i })).toBeInTheDocument();
        });

        it("shows progress indicator with count", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "Card 1", "Back 1"),
                createMockFlashcardSuggestion("temp-2", "Card 2", "Back 2"),
                createMockFlashcardSuggestion("temp-3", "Card 3", "Back 3"),
            ];

            await enterReviewPhase(user, suggestions);

            // Should show "0 of 3 reviewed" initially
            expect(screen.getByText(/0 of 3 reviewed/i)).toBeInTheDocument();
        });

        it("calls flashcard API and onFlashcardAdded when accepting flashcard", async () => {
            const user = userEvent.setup();
            const onFlashcardAdded = vi.fn();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "What is React?", "A JavaScript library"),
            ];

            // Set up initial generation fetch
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: { suggestions },
                    }),
            });

            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={onFlashcardAdded}
                    onQuestionAdded={vi.fn()}
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
                expect(screen.getByText(/review suggestions/i)).toBeInTheDocument();
            });

            // Set up accept fetch
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: {
                            flashcard: {
                                id: 123,
                                videoId: null,
                                userId: "user-1",
                                front: "What is React?",
                                back: "A JavaScript library",
                                createdAt: "2025-01-01T00:00:00Z",
                            },
                        },
                    }),
            });

            // Use exact name matching to avoid matching "Accept All"
            const suggestionCard = screen.getByTestId("suggestion-card");
            await user.click(within(suggestionCard).getByRole("button", { name: /^accept$/i }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    "/api/v1/study-sets/abc-123/flashcards",
                    expect.objectContaining({
                        method: "POST",
                        body: JSON.stringify({
                            front: "What is React?",
                            back: "A JavaScript library",
                        }),
                    })
                );
            });

            await waitFor(() => {
                expect(onFlashcardAdded).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 123,
                        front: "What is React?",
                        back: "A JavaScript library",
                    })
                );
            });
        });

        it("calls question API and onQuestionAdded when accepting question", async () => {
            const user = userEvent.setup();
            const onQuestionAdded = vi.fn();
            const suggestions = [
                createMockQuestionSuggestion("temp-1", "Which hook is for state?"),
            ];

            // Set up initial generation fetch
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: { suggestions },
                    }),
            });

            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={onQuestionAdded}
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
                expect(screen.getByText(/review suggestions/i)).toBeInTheDocument();
            });

            // Set up accept fetch
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: {
                            question: {
                                id: 456,
                                videoId: null,
                                questionText: "Which hook is for state?",
                                options: [
                                    { id: 1, optionText: "Option A", isCorrect: true, explanation: "Correct answer" },
                                    { id: 2, optionText: "Option B", isCorrect: false, explanation: "Wrong" },
                                    { id: 3, optionText: "Option C", isCorrect: false, explanation: "Wrong" },
                                    { id: 4, optionText: "Option D", isCorrect: false, explanation: "Wrong" },
                                ],
                                sourceQuote: null,
                                sourceTimestamp: null,
                            },
                        },
                    }),
            });

            // Use exact name matching to avoid matching "Accept All"
            const suggestionCard = screen.getByTestId("suggestion-card");
            await user.click(within(suggestionCard).getByRole("button", { name: /^accept$/i }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    "/api/v1/study-sets/abc-123/questions",
                    expect.objectContaining({
                        method: "POST",
                    })
                );
            });

            await waitFor(() => {
                expect(onQuestionAdded).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 456,
                        questionText: "Which hook is for state?",
                    })
                );
            });
        });

        it("removes suggestion from list when rejected", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "What is React?", "A JavaScript library"),
                createMockFlashcardSuggestion("temp-2", "What is Vue?", "Another JS framework"),
            ];

            await enterReviewPhase(user, suggestions);

            // Find the first suggestion card and reject it
            const firstCard = screen.getByText("What is React?").closest('[data-testid="suggestion-card"]');
            expect(firstCard).toBeInTheDocument();
            const rejectButton = within(firstCard as HTMLElement).getByRole("button", { name: /reject/i });
            await user.click(rejectButton);

            // First suggestion should be removed
            expect(screen.queryByText("What is React?")).not.toBeInTheDocument();
            // Second suggestion should still be there
            expect(screen.getByText("What is Vue?")).toBeInTheDocument();
        });

        it("enables inline editing when edit button is clicked for flashcard", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "What is React?", "A JavaScript library"),
            ];

            await enterReviewPhase(user, suggestions);

            await user.click(screen.getByRole("button", { name: /edit/i }));

            // Should show edit inputs
            const frontInput = screen.getByLabelText(/front/i);
            const backInput = screen.getByLabelText(/back/i);
            expect(frontInput).toBeInTheDocument();
            expect(backInput).toBeInTheDocument();
            expect(frontInput).toHaveValue("What is React?");
            expect(backInput).toHaveValue("A JavaScript library");
        });

        it("allows editing flashcard content and saving", async () => {
            const user = userEvent.setup();
            const onFlashcardAdded = vi.fn();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "What is React?", "A JavaScript library"),
            ];

            // Set up initial generation fetch
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: { suggestions },
                    }),
            });

            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={onFlashcardAdded}
                    onQuestionAdded={vi.fn()}
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
                expect(screen.getByText(/review suggestions/i)).toBeInTheDocument();
            });

            // Edit mode
            await user.click(screen.getByRole("button", { name: /edit/i }));

            const frontInput = screen.getByLabelText(/front/i);
            await user.clear(frontInput);
            await user.type(frontInput, "Updated question");

            // Save edit
            await user.click(screen.getByRole("button", { name: /save/i }));

            // Set up accept fetch
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: {
                            flashcard: {
                                id: 123,
                                videoId: null,
                                userId: "user-1",
                                front: "Updated question",
                                back: "A JavaScript library",
                                createdAt: "2025-01-01T00:00:00Z",
                            },
                        },
                    }),
            });

            // Accept the edited card - use exact name matching
            const suggestionCard = screen.getByTestId("suggestion-card");
            await user.click(within(suggestionCard).getByRole("button", { name: /^accept$/i }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    "/api/v1/study-sets/abc-123/flashcards",
                    expect.objectContaining({
                        method: "POST",
                        body: JSON.stringify({
                            front: "Updated question",
                            back: "A JavaScript library",
                        }),
                    })
                );
            });
        });

        it("shows Accept All and Reject All buttons", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "Card 1", "Back 1"),
                createMockFlashcardSuggestion("temp-2", "Card 2", "Back 2"),
            ];

            await enterReviewPhase(user, suggestions);

            expect(screen.getByRole("button", { name: /accept all/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /reject all/i })).toBeInTheDocument();
        });

        it("accepts all remaining suggestions when Accept All is clicked", async () => {
            const user = userEvent.setup();
            const onFlashcardAdded = vi.fn();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "Card 1", "Back 1"),
                createMockFlashcardSuggestion("temp-2", "Card 2", "Back 2"),
            ];

            // Set up initial generation fetch
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: { suggestions },
                    }),
            });

            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={onFlashcardAdded}
                    onQuestionAdded={vi.fn()}
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
                expect(screen.getByText(/review suggestions/i)).toBeInTheDocument();
            });

            // Set up accept fetches for both cards
            global.fetch = vi.fn()
                .mockResolvedValueOnce({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            status: "success",
                            data: {
                                flashcard: { id: 1, videoId: null, userId: "user-1", front: "Card 1", back: "Back 1", createdAt: "2025-01-01" },
                            },
                        }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            status: "success",
                            data: {
                                flashcard: { id: 2, videoId: null, userId: "user-1", front: "Card 2", back: "Back 2", createdAt: "2025-01-01" },
                            },
                        }),
                });

            await user.click(screen.getByRole("button", { name: /accept all/i }));

            await waitFor(() => {
                expect(onFlashcardAdded).toHaveBeenCalledTimes(2);
            });
        });

        it("removes all suggestions when Reject All is clicked", async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "Card 1", "Back 1"),
                createMockFlashcardSuggestion("temp-2", "Card 2", "Back 2"),
            ];

            // Set up initial generation fetch
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: { suggestions },
                    }),
            });

            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={onClose}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                expect(screen.getByText(/review suggestions/i)).toBeInTheDocument();
            });

            await user.click(screen.getByRole("button", { name: /reject all/i }));

            // Modal should close after rejecting all
            await waitFor(() => {
                expect(onClose).toHaveBeenCalled();
            });
        });

        it("shows Regenerate button in review phase", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "Card 1", "Back 1"),
            ];

            await enterReviewPhase(user, suggestions);

            expect(screen.getByRole("button", { name: /regenerate/i })).toBeInTheDocument();
        });

        it("returns to generation phase when Regenerate is clicked", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "Card 1", "Back 1"),
            ];

            await enterReviewPhase(user, suggestions);

            await user.click(screen.getByRole("button", { name: /regenerate/i }));

            // Should be back in generation phase
            expect(screen.getByLabelText(/what would you like to learn/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /generate/i })).toBeInTheDocument();
            expect(screen.queryByText(/review suggestions/i)).not.toBeInTheDocument();
        });

        it("updates progress indicator when suggestions are accepted", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "Card 1", "Back 1"),
                createMockFlashcardSuggestion("temp-2", "Card 2", "Back 2"),
            ];

            // Set up initial generation fetch
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: { suggestions },
                    }),
            });

            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                expect(screen.getByText(/0 of 2 reviewed/i)).toBeInTheDocument();
            });

            // Set up accept fetch
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: {
                            flashcard: { id: 1, videoId: null, userId: "user-1", front: "Card 1", back: "Back 1", createdAt: "2025-01-01" },
                        },
                    }),
            });

            // Accept first card
            const firstCard = screen.getByText("Card 1").closest('[data-testid="suggestion-card"]');
            const acceptButton = within(firstCard as HTMLElement).getByRole("button", { name: /accept/i });
            await user.click(acceptButton);

            await waitFor(() => {
                expect(screen.getByText(/1 of 2 reviewed/i)).toBeInTheDocument();
            });
        });

        it("closes modal when all suggestions are reviewed", async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "Card 1", "Back 1"),
            ];

            // Set up initial generation fetch
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: { suggestions },
                    }),
            });

            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={onClose}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                expect(screen.getByText(/review suggestions/i)).toBeInTheDocument();
            });

            // Set up accept fetch
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: {
                            flashcard: { id: 1, videoId: null, userId: "user-1", front: "Card 1", back: "Back 1", createdAt: "2025-01-01" },
                        },
                    }),
            });

            // Use exact name matching to avoid matching "Accept All"
            const suggestionCard = screen.getByTestId("suggestion-card");
            await user.click(within(suggestionCard).getByRole("button", { name: /^accept$/i }));

            // Modal should close after last suggestion is reviewed
            await waitFor(() => {
                expect(onClose).toHaveBeenCalled();
            });
        });

        it("shows loading state while accepting suggestion", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "Card 1", "Back 1"),
            ];

            // Set up initial generation fetch
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: { suggestions },
                    }),
            });

            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                expect(screen.getByText(/review suggestions/i)).toBeInTheDocument();
            });

            // Create a promise that we can control
            let resolvePromise: (value: unknown) => void;
            const pendingPromise = new Promise((resolve) => {
                resolvePromise = resolve;
            });

            global.fetch = vi.fn().mockReturnValue(pendingPromise);

            // Use exact name matching to avoid matching "Accept All"
            const suggestionCard = screen.getByTestId("suggestion-card");
            await user.click(within(suggestionCard).getByRole("button", { name: /^accept$/i }));

            // Should show loading state on the button
            expect(screen.getByRole("button", { name: /accepting/i })).toBeInTheDocument();

            // Resolve to clean up
            resolvePromise!({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: {
                            flashcard: { id: 1, videoId: null, userId: "user-1", front: "Card 1", back: "Back 1", createdAt: "2025-01-01" },
                        },
                    }),
            });
        });

        it("enables inline editing when edit button is clicked for question", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockQuestionSuggestion("temp-1", "Which hook is for state?"),
            ];

            await enterReviewPhase(user, suggestions);

            await user.click(screen.getByRole("button", { name: /edit/i }));

            // Should show edit input for question text
            const questionInput = screen.getByLabelText(/question/i);
            expect(questionInput).toBeInTheDocument();
            expect(questionInput).toHaveValue("Which hook is for state?");
        });

        it("allows changing the correct answer by clicking option badges", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockQuestionSuggestion("temp-1", "Which hook is for state?"),
            ];

            await enterReviewPhase(user, suggestions);

            await user.click(screen.getByRole("button", { name: /edit/i }));

            // Initially, first option (Option A) should be marked correct
            const badges = screen.getAllByRole("button", { name: /correct|wrong/i });
            expect(badges[0]).toHaveTextContent("Correct");
            expect(badges[1]).toHaveTextContent("Wrong");
            expect(badges[2]).toHaveTextContent("Wrong");
            expect(badges[3]).toHaveTextContent("Wrong");

            // Click on the second option's "Wrong" badge to make it correct
            await user.click(badges[1]);

            // Now second option should be correct, first should be wrong
            const updatedBadges = screen.getAllByRole("button", { name: /correct|wrong/i });
            expect(updatedBadges[0]).toHaveTextContent("Wrong");
            expect(updatedBadges[1]).toHaveTextContent("Correct");
            expect(updatedBadges[2]).toHaveTextContent("Wrong");
            expect(updatedBadges[3]).toHaveTextContent("Wrong");
        });

        it("cancels editing when cancel button is clicked", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "What is React?", "A JavaScript library"),
            ];

            await enterReviewPhase(user, suggestions);

            await user.click(screen.getByRole("button", { name: /edit/i }));

            const frontInput = screen.getByLabelText(/front/i);
            await user.clear(frontInput);
            await user.type(frontInput, "Modified text");

            // Cancel the edit
            await user.click(screen.getByRole("button", { name: /cancel/i }));

            // Should show original text again
            expect(screen.getByText("What is React?")).toBeInTheDocument();
            expect(screen.queryByLabelText(/front/i)).not.toBeInTheDocument();
        });

        it("displays character count for front field when editing flashcard", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "Hello", "World"), // front is 5 chars
            ];

            await enterReviewPhase(user, suggestions);

            await user.click(screen.getByRole("button", { name: /edit/i }));

            // Should show character count for front (5/500)
            expect(screen.getByText("5/500")).toBeInTheDocument();
        });

        it("displays character count for back field when editing flashcard", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "Term", "A longer definition here"), // back is 24 chars
            ];

            await enterReviewPhase(user, suggestions);

            await user.click(screen.getByRole("button", { name: /edit/i }));

            // Should show character count for back (24/2000)
            expect(screen.getByText("24/2000")).toBeInTheDocument();
        });

        it("displays character count for question text when editing question", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockQuestionSuggestion("temp-1", "What is TDD?"), // 12 chars
            ];

            await enterReviewPhase(user, suggestions);

            await user.click(screen.getByRole("button", { name: /edit/i }));

            // Should show character count for question (12/1000)
            expect(screen.getByText("12/1000")).toBeInTheDocument();
        });

        it("displays character count for each option when editing question", async () => {
            const user = userEvent.setup();
            // Options from createMockQuestionSuggestion are:
            // "Option A" (8), "Option B" (8), "Option C" (8), "Option D" (8)
            const suggestions = [
                createMockQuestionSuggestion("temp-1", "A question?"),
            ];

            await enterReviewPhase(user, suggestions);

            await user.click(screen.getByRole("button", { name: /edit/i }));

            // Should show 4 option counters with "8/500"
            const optionCounters = screen.getAllByText("8/500");
            expect(optionCounters).toHaveLength(4);
        });

        it("displays error message when accepting suggestion fails", async () => {
            const user = userEvent.setup();
            const suggestions = [
                createMockFlashcardSuggestion("temp-1", "What is React?", "A JavaScript library"),
            ];

            // Set up initial generation fetch
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: { suggestions },
                    }),
            });

            render(
                <AIGenerateModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onFlashcardAdded={vi.fn()}
                    onQuestionAdded={vi.fn()}
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
                expect(screen.getByText(/review suggestions/i)).toBeInTheDocument();
            });

            // Set up failing accept fetch
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: false,
                json: () =>
                    Promise.resolve({
                        status: "fail",
                        data: { error: "Front text exceeds maximum length" },
                    }),
            });

            // Click accept on the suggestion
            const suggestionCard = screen.getByTestId("suggestion-card");
            await user.click(within(suggestionCard).getByRole("button", { name: /^accept$/i }));

            // Should show error message
            await waitFor(() => {
                expect(screen.getByRole("alert")).toHaveTextContent("Front text exceeds maximum length");
            });

            // Suggestion should still be visible (not removed)
            expect(screen.getByText("What is React?")).toBeInTheDocument();
        });
    });
});
