import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StudySession } from "./StudySession";
import type { Term } from "./types";
import { VideoPlayerProvider } from "./VideoPlayerContext";
import { QuizCompletionProvider } from "@/components/providers/QuizCompletionProvider";

// Mock fetch for API calls
global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "success" }),
    })
) as unknown as typeof fetch;

function renderWithProviders(ui: React.ReactNode) {
    return render(
        <QuizCompletionProvider>
            <VideoPlayerProvider>{ui}</VideoPlayerProvider>
        </QuizCompletionProvider>
    );
}

const flashcardTerms: Term[] = [
    {
        id: 1,
        itemType: "flashcard",
        flashcard: { id: 1, front: "What is React?", back: "A JavaScript library" },
    },
    {
        id: 2,
        itemType: "flashcard",
        flashcard: { id: 2, front: "What is Vue?", back: "Another JS framework" },
    },
];

const questionTerms: Term[] = [
    {
        id: 3,
        itemType: "question",
        question: {
            id: 1,
            questionText: "Which is a hook?",
            sourceTimestamp: null,
            options: [
                { id: 1, optionText: "useState", isCorrect: true, explanation: "useState is a hook" },
                { id: 2, optionText: "React.memo", isCorrect: false, explanation: null },
            ],
        },
    },
];

const mixedTerms: Term[] = [...flashcardTerms, ...questionTerms];

describe("StudySession", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("flashcards mode", () => {
        it("renders FlashcardInterface for flashcard mode", () => {
            renderWithProviders(
                <StudySession
                    terms={mixedTerms}
                    mode="flashcards"
                    onComplete={vi.fn()}
                    videoId={null}
                    studySetId={1}
                />
            );
            // FlashcardInterface shows the flashcard front text
            expect(screen.getByText("What is React?")).toBeInTheDocument();
        });

        it("filters to only flashcards when in flashcards mode", () => {
            renderWithProviders(
                <StudySession
                    terms={mixedTerms}
                    mode="flashcards"
                    onComplete={vi.fn()}
                    videoId={null}
                    studySetId={1}
                />
            );
            // Should show flashcard count (2 flashcards)
            expect(screen.getByText(/1.*of.*2/)).toBeInTheDocument();
        });
    });

    describe("quiz mode", () => {
        it("renders QuizInterface for quiz mode", () => {
            renderWithProviders(
                <StudySession
                    terms={mixedTerms}
                    mode="quiz"
                    onComplete={vi.fn()}
                    videoId={null}
                    studySetId={1}
                />
            );
            // QuizInterface shows the question text
            expect(screen.getByText("Which is a hook?")).toBeInTheDocument();
        });

        it("filters to only questions when in quiz mode", () => {
            renderWithProviders(
                <StudySession
                    terms={mixedTerms}
                    mode="quiz"
                    onComplete={vi.fn()}
                    videoId={null}
                    studySetId={1}
                />
            );
            // Should show question count (1 question)
            expect(screen.getByText(/1.*of.*1/)).toBeInTheDocument();
        });
    });

    describe("both mode", () => {
        it("includes both flashcards and questions", () => {
            renderWithProviders(
                <StudySession
                    terms={mixedTerms}
                    mode="both"
                    onComplete={vi.fn()}
                    videoId={null}
                    studySetId={1}
                />
            );
            // Should show total count (3 items) - "both" mode uses "x / y" format
            expect(screen.getByText("3", { exact: false })).toBeInTheDocument();
        });
    });

    describe("session limits", () => {
        it("limits to 10 items maximum", () => {
            const manyFlashcards: Term[] = Array.from({ length: 15 }, (_, i) => ({
                id: i + 1,
                itemType: "flashcard" as const,
                flashcard: { id: i + 1, front: `Card ${i + 1}`, back: `Answer ${i + 1}` },
            }));

            renderWithProviders(
                <StudySession
                    terms={manyFlashcards}
                    mode="flashcards"
                    onComplete={vi.fn()}
                    videoId={null}
                    studySetId={1}
                />
            );
            // Should only show 10 items max
            expect(screen.getByText(/1.*of.*10/)).toBeInTheDocument();
        });
    });

    describe("back button", () => {
        it("renders back button", () => {
            renderWithProviders(
                <StudySession
                    terms={flashcardTerms}
                    mode="flashcards"
                    onComplete={vi.fn()}
                    videoId={null}
                    studySetId={1}
                />
            );
            expect(
                screen.getByRole("button", { name: /back/i })
            ).toBeInTheDocument();
        });

        it("calls onComplete when back is clicked", async () => {
            const user = userEvent.setup();
            const handleComplete = vi.fn();
            renderWithProviders(
                <StudySession
                    terms={flashcardTerms}
                    mode="flashcards"
                    onComplete={handleComplete}
                    videoId={null}
                    studySetId={1}
                />
            );

            await user.click(screen.getByRole("button", { name: /back/i }));
            expect(handleComplete).toHaveBeenCalled();
        });
    });
});
