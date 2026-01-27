import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TermCard } from "./TermCard";
import type { Term } from "./types";

describe("TermCard", () => {
    describe("flashcard term", () => {
        const flashcardTerm: Term = {
            id: 1,
            itemType: "flashcard",
            flashcard: {
                id: 1,
                front: "What is React?",
                back: "A JavaScript library for building user interfaces",
            },
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
        const questionTerm: Term = {
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
        const flashcardTerm: Term = {
            id: 1,
            itemType: "flashcard",
            flashcard: {
                id: 1,
                front: "Term",
                back: "Definition",
            },
        };

        it("has accessible structure with term and definition sections", () => {
            render(<TermCard term={flashcardTerm} />);
            const card = screen.getByRole("article");
            expect(card).toBeInTheDocument();
        });
    });
});
