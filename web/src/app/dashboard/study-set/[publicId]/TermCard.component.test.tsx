import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TermCard } from "./TermCard";
import type { TermWithMastery, EditedTermContent } from "./types";

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

        it("renders edit button for question terms when onEditQuestion is provided", () => {
            const onEditQuestion = vi.fn();
            render(<TermCard term={questionTerm} onEditQuestion={onEditQuestion} />);

            expect(screen.getByRole("button", { name: /edit question/i })).toBeInTheDocument();
        });

        it("does not render edit button for question terms when onEditQuestion is not provided", () => {
            render(<TermCard term={questionTerm} />);

            expect(screen.queryByRole("button", { name: /edit question/i })).not.toBeInTheDocument();
        });

        it("calls onEditQuestion with question data when edit button is clicked", async () => {
            const user = userEvent.setup();
            const onEditQuestion = vi.fn();

            const questionTermWithAllOptions: TermWithMastery = {
                id: 2,
                itemType: "question",
                question: {
                    id: 2,
                    questionText: "Which hook is used for side effects?",
                    sourceTimestamp: 120,
                    options: [
                        { id: 1, optionText: "useState", isCorrect: false, explanation: null },
                        { id: 2, optionText: "useEffect", isCorrect: true, explanation: "Handles side effects" },
                        { id: 3, optionText: "useRef", isCorrect: false, explanation: null },
                        { id: 4, optionText: "useMemo", isCorrect: false, explanation: null },
                    ],
                },
                masteryStatus: "learning",
            };

            render(<TermCard term={questionTermWithAllOptions} onEditQuestion={onEditQuestion} />);

            await user.click(screen.getByRole("button", { name: /edit question/i }));

            expect(onEditQuestion).toHaveBeenCalledWith({
                id: 2,
                questionText: "Which hook is used for side effects?",
                sourceTimestamp: 120,
                options: [
                    { id: 1, optionText: "useState", isCorrect: false, explanation: null },
                    { id: 2, optionText: "useEffect", isCorrect: true, explanation: "Handles side effects" },
                    { id: 3, optionText: "useRef", isCorrect: false, explanation: null },
                    { id: 4, optionText: "useMemo", isCorrect: false, explanation: null },
                ],
            });
        });

        it("does not render edit question button for flashcard terms", () => {
            const onEditQuestion = vi.fn();
            render(<TermCard term={flashcardTerm} onEditQuestion={onEditQuestion} />);

            expect(screen.queryByRole("button", { name: /edit question/i })).not.toBeInTheDocument();
        });
    });

    describe("inline edit mode for flashcard", () => {
        const flashcardTerm: TermWithMastery = {
            id: 1,
            itemType: "flashcard",
            flashcard: {
                id: 1,
                front: "What is TDD?",
                back: "Test-Driven Development",
            },
            masteryStatus: "not_started",
        };

        const editedContent: EditedTermContent = {
            front: "What is TDD?",
            back: "Test-Driven Development",
        };

        it("renders flashcard in edit mode with textareas when isEditing is true", () => {
            render(
                <TermCard
                    term={flashcardTerm}
                    isEditing={true}
                    editedContent={editedContent}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            expect(screen.getByLabelText(/front/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/back/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/front/i)).toHaveValue("What is TDD?");
            expect(screen.getByLabelText(/back/i)).toHaveValue("Test-Driven Development");
        });

        it("shows Save and Cancel buttons in edit mode", () => {
            render(
                <TermCard
                    term={flashcardTerm}
                    isEditing={true}
                    editedContent={editedContent}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
        });

        it("hides the pencil edit button when in edit mode", () => {
            render(
                <TermCard
                    term={flashcardTerm}
                    isEditing={true}
                    editedContent={editedContent}
                    onEditFlashcard={vi.fn()}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            expect(screen.queryByRole("button", { name: /edit flashcard/i })).not.toBeInTheDocument();
        });

        it("calls onEditedContentChange when front text is modified", async () => {
            const user = userEvent.setup();
            const onEditedContentChange = vi.fn();

            render(
                <TermCard
                    term={flashcardTerm}
                    isEditing={true}
                    editedContent={editedContent}
                    onEditedContentChange={onEditedContentChange}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            const frontInput = screen.getByLabelText(/front/i);
            // Type a single character to test the callback is called with updated content
            await user.type(frontInput, "X");

            expect(onEditedContentChange).toHaveBeenCalled();
            // Verify the callback receives the updated front value (appended character)
            const lastCall = onEditedContentChange.mock.calls[onEditedContentChange.mock.calls.length - 1][0];
            expect(lastCall.front).toBe("What is TDD?X");
            // Verify back is preserved
            expect(lastCall.back).toBe("Test-Driven Development");
        });

        it("calls onEditedContentChange when back text is modified", async () => {
            const user = userEvent.setup();
            const onEditedContentChange = vi.fn();

            render(
                <TermCard
                    term={flashcardTerm}
                    isEditing={true}
                    editedContent={editedContent}
                    onEditedContentChange={onEditedContentChange}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            const backInput = screen.getByLabelText(/back/i);
            // Type a single character to test the callback is called with updated content
            await user.type(backInput, "X");

            expect(onEditedContentChange).toHaveBeenCalled();
            // Verify the callback receives the updated back value
            const lastCall = onEditedContentChange.mock.calls[onEditedContentChange.mock.calls.length - 1][0];
            expect(lastCall.back).toBe("Test-Driven DevelopmentX");
            // Verify front is preserved
            expect(lastCall.front).toBe("What is TDD?");
        });

        it("calls onSaveEdit when Save button is clicked", async () => {
            const user = userEvent.setup();
            const onSaveEdit = vi.fn();

            render(
                <TermCard
                    term={flashcardTerm}
                    isEditing={true}
                    editedContent={editedContent}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={onSaveEdit}
                    onCancelEdit={vi.fn()}
                />
            );

            await user.click(screen.getByRole("button", { name: /save/i }));

            expect(onSaveEdit).toHaveBeenCalled();
        });

        it("calls onCancelEdit when Cancel button is clicked", async () => {
            const user = userEvent.setup();
            const onCancelEdit = vi.fn();

            render(
                <TermCard
                    term={flashcardTerm}
                    isEditing={true}
                    editedContent={editedContent}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={onCancelEdit}
                />
            );

            await user.click(screen.getByRole("button", { name: /cancel/i }));

            expect(onCancelEdit).toHaveBeenCalled();
        });

        it("disables Save button and shows Saving text when isSaving is true", () => {
            render(
                <TermCard
                    term={flashcardTerm}
                    isEditing={true}
                    editedContent={editedContent}
                    isSaving={true}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
            expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
        });

        it("disables textareas when isSaving is true", () => {
            render(
                <TermCard
                    term={flashcardTerm}
                    isEditing={true}
                    editedContent={editedContent}
                    isSaving={true}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            expect(screen.getByLabelText(/front/i)).toBeDisabled();
            expect(screen.getByLabelText(/back/i)).toBeDisabled();
        });

        it("displays character count for front field in edit mode", () => {
            const content: EditedTermContent = {
                front: "Hello", // 5 characters
                back: "World",
            };

            render(
                <TermCard
                    term={flashcardTerm}
                    isEditing={true}
                    editedContent={content}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            expect(screen.getByText("5/500")).toBeInTheDocument();
        });

        it("displays character count for back field in edit mode", () => {
            const content: EditedTermContent = {
                front: "Test",
                back: "This is a longer response", // 25 characters
            };

            render(
                <TermCard
                    term={flashcardTerm}
                    isEditing={true}
                    editedContent={content}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            expect(screen.getByText("25/2000")).toBeInTheDocument();
        });

        it("updates character count as user types in front field", async () => {
            const user = userEvent.setup();
            const content: EditedTermContent = {
                front: "",
                back: "",
            };
            const onEditedContentChange = vi.fn();

            const { rerender } = render(
                <TermCard
                    term={flashcardTerm}
                    isEditing={true}
                    editedContent={content}
                    onEditedContentChange={onEditedContentChange}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            expect(screen.getByText("0/500")).toBeInTheDocument();

            // Simulate typing by updating editedContent
            const frontInput = screen.getByLabelText(/front/i);
            await user.type(frontInput, "A");

            // Rerender with updated content to see count change
            rerender(
                <TermCard
                    term={flashcardTerm}
                    isEditing={true}
                    editedContent={{ front: "A", back: "" }}
                    onEditedContentChange={onEditedContentChange}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            expect(screen.getByText("1/500")).toBeInTheDocument();
        });
    });

    describe("inline edit mode for question", () => {
        const questionTerm: TermWithMastery = {
            id: 2,
            itemType: "question",
            question: {
                id: 2,
                questionText: "Which is a testing framework?",
                options: [
                    { id: 1, optionText: "Vitest", isCorrect: true, explanation: null },
                    { id: 2, optionText: "Banana", isCorrect: false, explanation: null },
                    { id: 3, optionText: "Chair", isCorrect: false, explanation: null },
                    { id: 4, optionText: "Window", isCorrect: false, explanation: null },
                ],
                sourceTimestamp: null,
            },
            masteryStatus: "learning",
        };

        const questionEditedContent: EditedTermContent = {
            questionText: "Which is a testing framework?",
            options: [
                { id: 1, optionText: "Vitest", isCorrect: true, explanation: null },
                { id: 2, optionText: "Banana", isCorrect: false, explanation: null },
                { id: 3, optionText: "Chair", isCorrect: false, explanation: null },
                { id: 4, optionText: "Window", isCorrect: false, explanation: null },
            ],
        };

        it("renders question in edit mode with textarea for question text", () => {
            render(
                <TermCard
                    term={questionTerm}
                    isEditing={true}
                    editedContent={questionEditedContent}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            expect(screen.getByLabelText(/question/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/question/i)).toHaveValue("Which is a testing framework?");
        });

        it("renders inputs for each option", () => {
            render(
                <TermCard
                    term={questionTerm}
                    isEditing={true}
                    editedContent={questionEditedContent}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            expect(screen.getByDisplayValue("Vitest")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Banana")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Chair")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Window")).toBeInTheDocument();
        });

        it("renders clickable Correct/Wrong badges for options", () => {
            render(
                <TermCard
                    term={questionTerm}
                    isEditing={true}
                    editedContent={questionEditedContent}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            // Should have one "Correct" badge and three "Wrong" badges
            expect(screen.getByRole("button", { name: /correct/i })).toBeInTheDocument();
            expect(screen.getAllByRole("button", { name: /wrong/i })).toHaveLength(3);
        });

        it("calls onEditedContentChange with updated options when Wrong badge is clicked", async () => {
            const user = userEvent.setup();
            const onEditedContentChange = vi.fn();

            render(
                <TermCard
                    term={questionTerm}
                    isEditing={true}
                    editedContent={questionEditedContent}
                    onEditedContentChange={onEditedContentChange}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            // Click on a "Wrong" badge to make it the correct answer
            const wrongBadges = screen.getAllByRole("button", { name: /wrong/i });
            await user.click(wrongBadges[0]); // Click on "Banana" option

            expect(onEditedContentChange).toHaveBeenCalled();
            const lastCall = onEditedContentChange.mock.calls[onEditedContentChange.mock.calls.length - 1][0];
            // Banana (index 1) should now be correct, Vitest (index 0) should be wrong
            expect(lastCall.options[0].isCorrect).toBe(false);
            expect(lastCall.options[1].isCorrect).toBe(true);
        });

        it("calls onEditedContentChange when question text is modified", async () => {
            const user = userEvent.setup();
            const onEditedContentChange = vi.fn();

            render(
                <TermCard
                    term={questionTerm}
                    isEditing={true}
                    editedContent={questionEditedContent}
                    onEditedContentChange={onEditedContentChange}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            const questionInput = screen.getByLabelText(/question/i);
            // Type a single character to test the callback is called with updated content
            await user.type(questionInput, "X");

            expect(onEditedContentChange).toHaveBeenCalled();
            const lastCall = onEditedContentChange.mock.calls[onEditedContentChange.mock.calls.length - 1][0];
            expect(lastCall.questionText).toBe("Which is a testing framework?X");
        });

        it("calls onEditedContentChange when option text is modified", async () => {
            const user = userEvent.setup();
            const onEditedContentChange = vi.fn();

            render(
                <TermCard
                    term={questionTerm}
                    isEditing={true}
                    editedContent={questionEditedContent}
                    onEditedContentChange={onEditedContentChange}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            const firstOptionInput = screen.getByDisplayValue("Vitest");
            // Type a single character to test the callback is called with updated content
            await user.type(firstOptionInput, "X");

            expect(onEditedContentChange).toHaveBeenCalled();
            const lastCall = onEditedContentChange.mock.calls[onEditedContentChange.mock.calls.length - 1][0];
            expect(lastCall.options[0].optionText).toBe("VitestX");
        });

        it("shows Save and Cancel buttons in question edit mode", () => {
            render(
                <TermCard
                    term={questionTerm}
                    isEditing={true}
                    editedContent={questionEditedContent}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
        });

        it("hides the pencil edit button when in edit mode", () => {
            render(
                <TermCard
                    term={questionTerm}
                    isEditing={true}
                    editedContent={questionEditedContent}
                    onEditQuestion={vi.fn()}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            expect(screen.queryByRole("button", { name: /edit question/i })).not.toBeInTheDocument();
        });

        it("displays character count for question text field in edit mode", () => {
            const content: EditedTermContent = {
                questionText: "What is TDD?", // 12 characters
                options: [
                    { id: 1, optionText: "Test-Driven Development", isCorrect: true, explanation: null },
                    { id: 2, optionText: "Option B", isCorrect: false, explanation: null },
                    { id: 3, optionText: "Option C", isCorrect: false, explanation: null },
                    { id: 4, optionText: "Option D", isCorrect: false, explanation: null },
                ],
            };

            render(
                <TermCard
                    term={questionTerm}
                    isEditing={true}
                    editedContent={content}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            expect(screen.getByText("12/1000")).toBeInTheDocument();
        });

        it("displays character count for each option field in edit mode", () => {
            const content: EditedTermContent = {
                questionText: "Question?",
                options: [
                    { id: 1, optionText: "Short", isCorrect: true, explanation: null }, // 5 characters
                    { id: 2, optionText: "Medium length", isCorrect: false, explanation: null }, // 13 characters
                    { id: 3, optionText: "A bit longer option", isCorrect: false, explanation: null }, // 19 characters
                    { id: 4, optionText: "The longest option text here", isCorrect: false, explanation: null }, // 28 characters
                ],
            };

            render(
                <TermCard
                    term={questionTerm}
                    isEditing={true}
                    editedContent={content}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            expect(screen.getByText("5/500")).toBeInTheDocument();
            expect(screen.getByText("13/500")).toBeInTheDocument();
            expect(screen.getByText("19/500")).toBeInTheDocument();
            expect(screen.getByText("28/500")).toBeInTheDocument();
        });
    });

    describe("character count over limit styling", () => {
        const flashcardTerm: TermWithMastery = {
            id: 1,
            itemType: "flashcard",
            flashcard: {
                id: 1,
                front: "Test",
                back: "Test",
            },
            masteryStatus: "not_started",
        };

        it("displays front character count in red when over 500 limit", () => {
            const overLimitText = "a".repeat(501);
            const content: EditedTermContent = {
                front: overLimitText,
                back: "",
            };

            render(
                <TermCard
                    term={flashcardTerm}
                    isEditing={true}
                    editedContent={content}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            const counter = screen.getByText("501/500");
            expect(counter).toHaveClass("text-destructive");
        });

        it("displays back character count in red when over 2000 limit", () => {
            const overLimitText = "a".repeat(2001);
            const content: EditedTermContent = {
                front: "",
                back: overLimitText,
            };

            render(
                <TermCard
                    term={flashcardTerm}
                    isEditing={true}
                    editedContent={content}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            const counter = screen.getByText("2001/2000");
            expect(counter).toHaveClass("text-destructive");
        });

        it("displays edit error message when provided", () => {
            const content: EditedTermContent = {
                front: "Test",
                back: "Test",
            };

            render(
                <TermCard
                    term={flashcardTerm}
                    isEditing={true}
                    editedContent={content}
                    editError="Front text exceeds maximum length of 500 characters"
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            expect(screen.getByRole("alert")).toHaveTextContent(
                "Front text exceeds maximum length of 500 characters"
            );
        });
    });

    describe("delete functionality", () => {
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
                    { id: 3, optionText: "useRef", isCorrect: false, explanation: null },
                    { id: 4, optionText: "useMemo", isCorrect: false, explanation: null },
                ],
            },
            masteryStatus: "learning",
        };

        it("renders delete button for flashcard when onDeleteFlashcard is provided", () => {
            const onDeleteFlashcard = vi.fn();
            render(<TermCard term={flashcardTerm} onDeleteFlashcard={onDeleteFlashcard} />);

            expect(screen.getByRole("button", { name: /delete flashcard/i })).toBeInTheDocument();
        });

        it("does not render delete button when onDeleteFlashcard is not provided", () => {
            render(<TermCard term={flashcardTerm} />);

            expect(screen.queryByRole("button", { name: /delete flashcard/i })).not.toBeInTheDocument();
        });

        it("shows confirmation dialog when delete button is clicked for flashcard", async () => {
            const user = userEvent.setup();
            const onDeleteFlashcard = vi.fn();
            render(<TermCard term={flashcardTerm} onDeleteFlashcard={onDeleteFlashcard} />);

            await user.click(screen.getByRole("button", { name: /delete flashcard/i }));

            expect(screen.getByRole("alertdialog")).toBeInTheDocument();
            expect(screen.getByText(/are you sure you want to delete this flashcard/i)).toBeInTheDocument();
        });

        it("calls onDeleteFlashcard when confirm button is clicked in flashcard dialog", async () => {
            const user = userEvent.setup();
            const onDeleteFlashcard = vi.fn();
            render(<TermCard term={flashcardTerm} onDeleteFlashcard={onDeleteFlashcard} />);

            await user.click(screen.getByRole("button", { name: /delete flashcard/i }));
            await user.click(screen.getByRole("button", { name: /^delete$/i }));

            expect(onDeleteFlashcard).toHaveBeenCalledWith(1);
        });

        it("does not call onDeleteFlashcard when cancel button is clicked", async () => {
            const user = userEvent.setup();
            const onDeleteFlashcard = vi.fn();
            render(<TermCard term={flashcardTerm} onDeleteFlashcard={onDeleteFlashcard} />);

            await user.click(screen.getByRole("button", { name: /delete flashcard/i }));
            await user.click(screen.getByRole("button", { name: /cancel/i }));

            expect(onDeleteFlashcard).not.toHaveBeenCalled();
            expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
        });

        it("renders delete button for question when onDeleteQuestion is provided", () => {
            const onDeleteQuestion = vi.fn();
            render(<TermCard term={questionTerm} onDeleteQuestion={onDeleteQuestion} />);

            expect(screen.getByRole("button", { name: /delete question/i })).toBeInTheDocument();
        });

        it("does not render delete button when onDeleteQuestion is not provided", () => {
            render(<TermCard term={questionTerm} />);

            expect(screen.queryByRole("button", { name: /delete question/i })).not.toBeInTheDocument();
        });

        it("shows confirmation dialog when delete button is clicked for question", async () => {
            const user = userEvent.setup();
            const onDeleteQuestion = vi.fn();
            render(<TermCard term={questionTerm} onDeleteQuestion={onDeleteQuestion} />);

            await user.click(screen.getByRole("button", { name: /delete question/i }));

            expect(screen.getByRole("alertdialog")).toBeInTheDocument();
            expect(screen.getByText(/are you sure you want to delete this question/i)).toBeInTheDocument();
        });

        it("calls onDeleteQuestion when confirm button is clicked in question dialog", async () => {
            const user = userEvent.setup();
            const onDeleteQuestion = vi.fn();
            render(<TermCard term={questionTerm} onDeleteQuestion={onDeleteQuestion} />);

            await user.click(screen.getByRole("button", { name: /delete question/i }));
            await user.click(screen.getByRole("button", { name: /^delete$/i }));

            expect(onDeleteQuestion).toHaveBeenCalledWith(2);
        });

        it("does not render delete buttons in edit mode", () => {
            const onDeleteFlashcard = vi.fn();
            const editedContent: EditedTermContent = {
                front: "Test",
                back: "Test",
            };

            render(
                <TermCard
                    term={flashcardTerm}
                    onDeleteFlashcard={onDeleteFlashcard}
                    isEditing={true}
                    editedContent={editedContent}
                    onEditedContentChange={vi.fn()}
                    onSaveEdit={vi.fn()}
                    onCancelEdit={vi.fn()}
                />
            );

            expect(screen.queryByRole("button", { name: /delete flashcard/i })).not.toBeInTheDocument();
        });

        it("shows deletion warning about permanent action", async () => {
            const user = userEvent.setup();
            const onDeleteFlashcard = vi.fn();
            render(<TermCard term={flashcardTerm} onDeleteFlashcard={onDeleteFlashcard} />);

            await user.click(screen.getByRole("button", { name: /delete flashcard/i }));

            expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
        });
    });
});
