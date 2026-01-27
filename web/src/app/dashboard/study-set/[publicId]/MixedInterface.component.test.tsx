import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MixedInterface } from "./MixedInterface";
import type { Term } from "./types";

// Mock fetch for API calls
global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "success" }),
    })
) as unknown as typeof fetch;

const flashcardTerm: Term = {
    id: 1,
    itemType: "flashcard",
    flashcard: {
        id: 1,
        front: "What is React?",
        back: "A JavaScript library for building UIs",
    },
};

const questionTerm: Term = {
    id: 2,
    itemType: "question",
    question: {
        id: 2,
        questionText: "Which hook is used for state?",
        sourceTimestamp: null,
        options: [
            { id: 1, optionText: "useState", isCorrect: true, explanation: "useState manages state" },
            { id: 2, optionText: "useEffect", isCorrect: false, explanation: null },
            { id: 3, optionText: "useRef", isCorrect: false, explanation: null },
            { id: 4, optionText: "useMemo", isCorrect: false, explanation: null },
        ],
    },
};

describe("MixedInterface", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("flashcard item", () => {
        it("shows flashcard front initially", () => {
            render(<MixedInterface items={[flashcardTerm]} onBack={vi.fn()} />);
            expect(screen.getByText("What is React?")).toBeInTheDocument();
            expect(screen.getByText("(Click to reveal answer)")).toBeInTheDocument();
        });

        it("flips to show back when clicked", async () => {
            const user = userEvent.setup();
            render(<MixedInterface items={[flashcardTerm]} onBack={vi.fn()} />);

            await user.click(screen.getByRole("button", { name: /what is react/i }));

            expect(screen.getByText("A JavaScript library for building UIs")).toBeInTheDocument();
            expect(screen.getByText("(Click to see question)")).toBeInTheDocument();
        });

        it("shows self-assessment buttons after flipping", async () => {
            const user = userEvent.setup();
            render(<MixedInterface items={[flashcardTerm]} onBack={vi.fn()} />);

            await user.click(screen.getByRole("button", { name: /what is react/i }));

            expect(screen.getByText("Did you know the answer?")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /not yet/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /got it/i })).toBeInTheDocument();
        });

        it("enables Check Answer button after selecting assessment", async () => {
            const user = userEvent.setup();
            render(<MixedInterface items={[flashcardTerm]} onBack={vi.fn()} />);

            await user.click(screen.getByRole("button", { name: /what is react/i }));

            const checkButton = screen.getByRole("button", { name: /check answer/i });
            expect(checkButton).toBeDisabled();

            await user.click(screen.getByRole("button", { name: /got it/i }));
            expect(checkButton).toBeEnabled();
        });

        it("shows success result after checking correct self-assessment", async () => {
            const user = userEvent.setup();
            render(<MixedInterface items={[flashcardTerm]} onBack={vi.fn()} />);

            await user.click(screen.getByRole("button", { name: /what is react/i }));
            await user.click(screen.getByRole("button", { name: /got it/i }));
            await user.click(screen.getByRole("button", { name: /check answer/i }));

            await waitFor(() => {
                expect(screen.getByText(/great job/i)).toBeInTheDocument();
            });
        });

        it("shows encouragement result after checking incorrect self-assessment", async () => {
            const user = userEvent.setup();
            render(<MixedInterface items={[flashcardTerm]} onBack={vi.fn()} />);

            await user.click(screen.getByRole("button", { name: /what is react/i }));
            await user.click(screen.getByRole("button", { name: /not yet/i }));
            await user.click(screen.getByRole("button", { name: /check answer/i }));

            await waitFor(() => {
                expect(screen.getByText(/no worries/i)).toBeInTheDocument();
            });
        });

        it("calls API to save progress on submit", async () => {
            const user = userEvent.setup();
            render(<MixedInterface items={[flashcardTerm]} onBack={vi.fn()} />);

            await user.click(screen.getByRole("button", { name: /what is react/i }));
            await user.click(screen.getByRole("button", { name: /got it/i }));
            await user.click(screen.getByRole("button", { name: /check answer/i }));

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(
                    "/api/v1/reviews/initialize-progress",
                    expect.objectContaining({
                        method: "POST",
                        body: JSON.stringify({ flashcardId: 1, isCorrect: true }),
                    })
                );
            });
        });

        it("disables card flip after showing result", async () => {
            const user = userEvent.setup();
            render(<MixedInterface items={[flashcardTerm]} onBack={vi.fn()} />);

            await user.click(screen.getByRole("button", { name: /what is react/i }));
            await user.click(screen.getByRole("button", { name: /got it/i }));
            await user.click(screen.getByRole("button", { name: /check answer/i }));

            await waitFor(() => {
                expect(screen.getByText(/great job/i)).toBeInTheDocument();
            });

            const cardButton = screen.getByRole("button", { name: /javascript library/i });
            expect(cardButton).toBeDisabled();
        });
    });

    describe("question item", () => {
        it("shows question text", () => {
            render(<MixedInterface items={[questionTerm]} onBack={vi.fn()} />);
            expect(screen.getByText("Which hook is used for state?")).toBeInTheDocument();
        });

        it("shows all answer options", () => {
            render(<MixedInterface items={[questionTerm]} onBack={vi.fn()} />);
            expect(screen.getByText("useState")).toBeInTheDocument();
            expect(screen.getByText("useEffect")).toBeInTheDocument();
            expect(screen.getByText("useRef")).toBeInTheDocument();
            expect(screen.getByText("useMemo")).toBeInTheDocument();
        });

        it("enables Check Answer button after selecting an option", async () => {
            const user = userEvent.setup();
            render(<MixedInterface items={[questionTerm]} onBack={vi.fn()} />);

            const checkButton = screen.getByRole("button", { name: /check answer/i });
            expect(checkButton).toBeDisabled();

            await user.click(screen.getByText("useState"));
            expect(checkButton).toBeEnabled();
        });

        it("shows correct result after answering correctly", async () => {
            const user = userEvent.setup();
            render(<MixedInterface items={[questionTerm]} onBack={vi.fn()} />);

            await user.click(screen.getByText("useState"));
            await user.click(screen.getByRole("button", { name: /check answer/i }));

            await waitFor(() => {
                expect(screen.getByText(/useState manages state/i)).toBeInTheDocument();
            });
        });

        it("shows incorrect result after answering incorrectly", async () => {
            const user = userEvent.setup();
            render(<MixedInterface items={[questionTerm]} onBack={vi.fn()} />);

            await user.click(screen.getByText("useEffect"));
            await user.click(screen.getByRole("button", { name: /check answer/i }));

            await waitFor(() => {
                // Should show the correct answer's explanation
                expect(screen.getByText(/useState manages state/i)).toBeInTheDocument();
            });
        });

        it("calls APIs to save answer and progress on submit", async () => {
            const user = userEvent.setup();
            render(<MixedInterface items={[questionTerm]} onBack={vi.fn()} />);

            await user.click(screen.getByText("useState"));
            await user.click(screen.getByRole("button", { name: /check answer/i }));

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(
                    "/api/v1/answers",
                    expect.objectContaining({
                        method: "POST",
                        body: JSON.stringify({
                            questionId: 2,
                            selectedOptionId: 1,
                            isCorrect: true,
                        }),
                    })
                );
                expect(fetch).toHaveBeenCalledWith(
                    "/api/v1/reviews/initialize-progress",
                    expect.objectContaining({
                        method: "POST",
                        body: JSON.stringify({ questionId: 2, isCorrect: true }),
                    })
                );
            });
        });
    });

    describe("session flow", () => {
        it("shows progress indicator", () => {
            render(<MixedInterface items={[flashcardTerm, questionTerm]} onBack={vi.fn()} />);
            // QuizProgress shows "X of Y" format
            expect(screen.getByText(/1.*of.*2/)).toBeInTheDocument();
        });

        it("advances to next item after clicking Next", async () => {
            const user = userEvent.setup();
            render(<MixedInterface items={[flashcardTerm, questionTerm]} onBack={vi.fn()} />);

            // Complete first item (flashcard)
            await user.click(screen.getByRole("button", { name: /what is react/i }));
            await user.click(screen.getByRole("button", { name: /got it/i }));
            await user.click(screen.getByRole("button", { name: /check answer/i }));

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
            });

            await user.click(screen.getByRole("button", { name: /next/i }));

            // Should now show the question
            expect(screen.getByText("Which hook is used for state?")).toBeInTheDocument();
        });

        it("shows summary after completing all items", async () => {
            const user = userEvent.setup();
            render(<MixedInterface items={[flashcardTerm]} onBack={vi.fn()} />);

            await user.click(screen.getByRole("button", { name: /what is react/i }));
            await user.click(screen.getByRole("button", { name: /got it/i }));
            await user.click(screen.getByRole("button", { name: /check answer/i }));

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
            });

            await user.click(screen.getByRole("button", { name: /next/i }));

            // Should show quiz summary
            expect(screen.getByText(/1.*\/.*1/)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
        });

        it("tracks correct count accurately", async () => {
            const user = userEvent.setup();
            render(<MixedInterface items={[flashcardTerm, questionTerm]} onBack={vi.fn()} />);

            // Answer flashcard correctly
            await user.click(screen.getByRole("button", { name: /what is react/i }));
            await user.click(screen.getByRole("button", { name: /got it/i }));
            await user.click(screen.getByRole("button", { name: /check answer/i }));
            await waitFor(() => {
                expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
            });
            await user.click(screen.getByRole("button", { name: /next/i }));

            // Answer question incorrectly
            await user.click(screen.getByText("useEffect"));
            await user.click(screen.getByRole("button", { name: /check answer/i }));
            await waitFor(() => {
                expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
            });
            await user.click(screen.getByRole("button", { name: /next/i }));

            // Summary should show 1 out of 2 correct
            expect(screen.getByText(/1.*\/.*2/)).toBeInTheDocument();
        });

        it("resets session when Try Again is clicked", async () => {
            const user = userEvent.setup();
            render(<MixedInterface items={[flashcardTerm]} onBack={vi.fn()} />);

            // Complete the session
            await user.click(screen.getByRole("button", { name: /what is react/i }));
            await user.click(screen.getByRole("button", { name: /got it/i }));
            await user.click(screen.getByRole("button", { name: /check answer/i }));
            await waitFor(() => {
                expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
            });
            await user.click(screen.getByRole("button", { name: /next/i }));

            // Click Try Again
            await user.click(screen.getByRole("button", { name: /try again/i }));

            // Should be back at the first flashcard
            expect(screen.getByText("What is React?")).toBeInTheDocument();
            expect(screen.getByText("(Click to reveal answer)")).toBeInTheDocument();
        });
    });

    describe("back button", () => {
        it("renders back button", () => {
            render(<MixedInterface items={[flashcardTerm]} onBack={vi.fn()} />);
            expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
        });

        it("calls onBack when clicked", async () => {
            const user = userEvent.setup();
            const handleBack = vi.fn();
            render(<MixedInterface items={[flashcardTerm]} onBack={handleBack} />);

            await user.click(screen.getByRole("button", { name: /back/i }));
            expect(handleBack).toHaveBeenCalled();
        });

        it("shows back button on session complete screen", async () => {
            const user = userEvent.setup();
            render(<MixedInterface items={[flashcardTerm]} onBack={vi.fn()} />);

            // Complete the session
            await user.click(screen.getByRole("button", { name: /what is react/i }));
            await user.click(screen.getByRole("button", { name: /got it/i }));
            await user.click(screen.getByRole("button", { name: /check answer/i }));
            await waitFor(() => {
                expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
            });
            await user.click(screen.getByRole("button", { name: /next/i }));

            // Back button should still be visible
            expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
        });
    });

    describe("empty state", () => {
        it("shows empty message when no items", () => {
            render(<MixedInterface items={[]} onBack={vi.fn()} />);
            expect(screen.getByText(/no items to study/i)).toBeInTheDocument();
        });

        it("shows Go Back button when no items", () => {
            render(<MixedInterface items={[]} onBack={vi.fn()} />);
            expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
        });

        it("calls onBack when Go Back is clicked", async () => {
            const user = userEvent.setup();
            const handleBack = vi.fn();
            render(<MixedInterface items={[]} onBack={handleBack} />);

            await user.click(screen.getByRole("button", { name: /go back/i }));
            expect(handleBack).toHaveBeenCalled();
        });
    });
});
