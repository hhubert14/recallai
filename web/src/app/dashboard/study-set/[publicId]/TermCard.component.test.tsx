import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TermCard } from "./TermCard";
import type { TermWithMastery } from "./types";

describe("TermCard", () => {
    describe("flashcard term", () => {
        const flashcardTerm: TermWithMastery = {
            id: 1,
            itemType: "flashcard",
            flashcard: {
                id: 1,
                front: "What is React?",
                back: "A JavaScript library for building user interfaces",
            },
            masteryStatus: "not_started",
        };

        it("renders flashcard front on the left side", () => {
            render(<TermCard term={flashcardTerm} />);
            expect(screen.getByText("What is React?")).toBeInTheDocument();
        });

        it("renders flashcard back on the right side", () => {
            render(<TermCard term={flashcardTerm} />);
            expect(
                screen.getByText(
                    "A JavaScript library for building user interfaces"
                )
            ).toBeInTheDocument();
        });
    });

    describe("question term", () => {
        const questionTerm: TermWithMastery = {
            id: 2,
            itemType: "question",
            question: {
                id: 2,
                questionText: "Which hook is used for side effects?",
                sourceTimestamp: null,
                options: [
                    {
                        id: 1,
                        optionText: "useState",
                        isCorrect: false,
                        explanation: null,
                    },
                    {
                        id: 2,
                        optionText: "useEffect",
                        isCorrect: true,
                        explanation: "useEffect handles side effects in React",
                    },
                    {
                        id: 3,
                        optionText: "useRef",
                        isCorrect: false,
                        explanation: null,
                    },
                    {
                        id: 4,
                        optionText: "useMemo",
                        isCorrect: false,
                        explanation: null,
                    },
                ],
            },
            masteryStatus: "learning",
        };

        it("renders question text on the left side", () => {
            render(<TermCard term={questionTerm} />);
            expect(
                screen.getByText("Which hook is used for side effects?")
            ).toBeInTheDocument();
        });

        it("renders all answer options", () => {
            render(<TermCard term={questionTerm} />);
            expect(screen.getByText("useState")).toBeInTheDocument();
            expect(screen.getByText("useEffect")).toBeInTheDocument();
            expect(screen.getByText("useRef")).toBeInTheDocument();
            expect(screen.getByText("useMemo")).toBeInTheDocument();
        });

        it("marks the correct answer with a checkmark", () => {
            render(<TermCard term={questionTerm} />);
            // The correct answer should have a visual indicator
            const correctOption = screen.getByText("useEffect").closest("li");
            expect(correctOption).toHaveClass("text-green-600");
        });
    });

    describe("accessibility", () => {
        const flashcardTerm: TermWithMastery = {
            id: 1,
            itemType: "flashcard",
            flashcard: {
                id: 1,
                front: "Term",
                back: "Definition",
            },
            masteryStatus: "mastered",
        };

        it("has accessible structure with term and definition sections", () => {
            render(<TermCard term={flashcardTerm} />);
            const card = screen.getByRole("article");
            expect(card).toBeInTheDocument();
        });
    });

    describe("mastery status indicator", () => {
        const baseTerm: TermWithMastery = {
            id: 1,
            itemType: "flashcard",
            flashcard: {
                id: 1,
                front: "What is React?",
                back: "A JavaScript library",
            },
            masteryStatus: "not_started",
        };

        it("renders green indicator for mastered terms", () => {
            const masteredTerm: TermWithMastery = {
                ...baseTerm,
                masteryStatus: "mastered",
            };

            render(<TermCard term={masteredTerm} />);

            const indicator = screen.getByTestId("mastery-indicator");
            expect(indicator).toHaveClass("bg-green-500");
        });

        it("renders amber indicator for learning terms", () => {
            const learningTerm: TermWithMastery = {
                ...baseTerm,
                masteryStatus: "learning",
            };

            render(<TermCard term={learningTerm} />);

            const indicator = screen.getByTestId("mastery-indicator");
            expect(indicator).toHaveClass("bg-amber-500");
        });

        it("renders gray indicator for not started terms", () => {
            const notStartedTerm: TermWithMastery = {
                ...baseTerm,
                masteryStatus: "not_started",
            };

            render(<TermCard term={notStartedTerm} />);

            const indicator = screen.getByTestId("mastery-indicator");
            expect(indicator).toHaveClass("bg-muted-foreground");
        });
    });

    describe("edit functionality", () => {
        const flashcardTerm: TermWithMastery = {
            id: 1,
            itemType: "flashcard",
            flashcard: {
                id: 1,
                front: "What is React?",
                back: "A JavaScript library for building user interfaces",
            },
            masteryStatus: "not_started",
        };

        const questionTerm: TermWithMastery = {
            id: 2,
            itemType: "question",
            question: {
                id: 2,
                questionText: "Which hook is used for side effects?",
                sourceTimestamp: null,
                options: [
                    { id: 1, optionText: "useState", isCorrect: false, explanation: null },
                    { id: 2, optionText: "useEffect", isCorrect: true, explanation: null },
                ],
            },
            masteryStatus: "learning",
        };

        it("renders edit button for flashcard terms when onEditFlashcard is provided", () => {
            const onEditFlashcard = vi.fn();
            render(<TermCard term={flashcardTerm} onEditFlashcard={onEditFlashcard} />);

            expect(screen.getByRole("button", { name: /edit flashcard/i })).toBeInTheDocument();
        });

        it("does not render edit button for flashcard terms when onEditFlashcard is not provided", () => {
            render(<TermCard term={flashcardTerm} />);

            expect(screen.queryByRole("button", { name: /edit flashcard/i })).not.toBeInTheDocument();
        });

        it("calls onEditFlashcard with flashcard data when edit button is clicked", async () => {
            const user = userEvent.setup();
            const onEditFlashcard = vi.fn();
            render(<TermCard term={flashcardTerm} onEditFlashcard={onEditFlashcard} />);

            await user.click(screen.getByRole("button", { name: /edit flashcard/i }));

            expect(onEditFlashcard).toHaveBeenCalledWith({
                id: 1,
                front: "What is React?",
                back: "A JavaScript library for building user interfaces",
            });
        });

        it("does not render edit button for question terms", () => {
            const onEditFlashcard = vi.fn();
            render(<TermCard term={questionTerm} onEditFlashcard={onEditFlashcard} />);

            expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
        });
    });
});
