import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditQuestionModal } from "./EditQuestionModal";
import type { TermQuestion } from "./types";

describe("EditQuestionModal", () => {
    const question: TermQuestion = {
        id: 100,
        questionText: "What is TDD?",
        sourceTimestamp: null,
        options: [
            { id: 1, optionText: "Test-Driven Development", isCorrect: true, explanation: "Correct!" },
            { id: 2, optionText: "Time-Driven Development", isCorrect: false, explanation: null },
            { id: 3, optionText: "Task-Driven Design", isCorrect: false, explanation: null },
            { id: 4, optionText: "Test-Delayed Development", isCorrect: false, explanation: null },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("rendering", () => {
        it("renders the modal title", () => {
            render(
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            expect(
                screen.getByRole("heading", { name: /edit question/i })
            ).toBeInTheDocument();
        });

        it("pre-populates the question text input with existing value", () => {
            render(
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            expect(screen.getByLabelText(/question text/i)).toHaveValue("What is TDD?");
        });

        it("pre-populates all option inputs with existing values", () => {
            render(
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            expect(screen.getByLabelText(/^option 1$/i)).toHaveValue("Test-Driven Development");
            expect(screen.getByLabelText(/^option 2$/i)).toHaveValue("Time-Driven Development");
            expect(screen.getByLabelText(/^option 3$/i)).toHaveValue("Task-Driven Design");
            expect(screen.getByLabelText(/^option 4$/i)).toHaveValue("Test-Delayed Development");
        });

        it("pre-selects the correct answer radio button", () => {
            render(
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            const radioButtons = screen.getAllByRole("radio");
            expect(radioButtons[0]).toBeChecked();
            expect(radioButtons[1]).not.toBeChecked();
            expect(radioButtons[2]).not.toBeChecked();
            expect(radioButtons[3]).not.toBeChecked();
        });

        it("renders cancel button", () => {
            render(
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            expect(
                screen.getByRole("button", { name: /cancel/i })
            ).toBeInTheDocument();
        });

        it("renders save button", () => {
            render(
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            expect(
                screen.getByRole("button", { name: /save/i })
            ).toBeInTheDocument();
        });

        it("displays character counter for question text", () => {
            render(
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            expect(screen.getByText("12/1000")).toBeInTheDocument();
        });

        it("displays character counter for options", () => {
            render(
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            // Multiple options may have the same length - just verify at least one counter exists
            const counters = screen.getAllByText(/\/500$/);
            expect(counters.length).toBe(4); // One for each option
        });
    });

    describe("form validation", () => {
        it("disables save button when question text is empty", async () => {
            const user = userEvent.setup();
            render(
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            const questionInput = screen.getByLabelText(/question text/i);
            await user.clear(questionInput);

            expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
        });

        it("disables save button when any option text is empty", async () => {
            const user = userEvent.setup();
            render(
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            const optionInput = screen.getByLabelText(/^option 2$/i);
            await user.clear(optionInput);

            expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
        });

        it("enables save button when all fields are valid", () => {
            render(
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
        });
    });

    describe("edit functionality", () => {
        it("allows editing the question text", async () => {
            const user = userEvent.setup();
            render(
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            const questionInput = screen.getByLabelText(/question text/i);
            await user.clear(questionInput);
            await user.type(questionInput, "What is BDD?");

            expect(questionInput).toHaveValue("What is BDD?");
        });

        it("allows editing option text", async () => {
            const user = userEvent.setup();
            render(
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            const optionInput = screen.getByLabelText(/^option 1$/i);
            await user.clear(optionInput);
            await user.type(optionInput, "Behavior-Driven Development");

            expect(optionInput).toHaveValue("Behavior-Driven Development");
        });

        it("allows changing the correct answer", async () => {
            const user = userEvent.setup();
            render(
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            const radioButtons = screen.getAllByRole("radio");
            await user.click(radioButtons[2]); // Select option 3 as correct

            expect(radioButtons[0]).not.toBeChecked();
            expect(radioButtons[2]).toBeChecked();
        });
    });

    describe("form submission", () => {
        it("submits updated question and calls onQuestionUpdated", async () => {
            const user = userEvent.setup();
            const onQuestionUpdated = vi.fn();
            const onClose = vi.fn();

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        status: "success",
                        data: {
                            question: {
                                id: 100,
                                videoId: null,
                                questionText: "What is BDD?",
                                options: [
                                    { id: 1, optionText: "Behavior-Driven Development", isCorrect: false, explanation: null },
                                    { id: 2, optionText: "Time-Driven Development", isCorrect: true, explanation: null },
                                    { id: 3, optionText: "Task-Driven Design", isCorrect: false, explanation: null },
                                    { id: 4, optionText: "Test-Delayed Development", isCorrect: false, explanation: null },
                                ],
                                sourceQuote: null,
                                sourceTimestamp: null,
                            },
                        },
                    }),
            });

            render(
                <EditQuestionModal
                    onClose={onClose}
                    onQuestionUpdated={onQuestionUpdated}
                    question={question}
                />
            );

            // Edit question text
            const questionInput = screen.getByLabelText(/question text/i);
            await user.clear(questionInput);
            await user.type(questionInput, "What is BDD?");

            // Edit first option
            const optionInput = screen.getByLabelText(/^option 1$/i);
            await user.clear(optionInput);
            await user.type(optionInput, "Behavior-Driven Development");

            // Change correct answer to option 2
            const radioButtons = screen.getAllByRole("radio");
            await user.click(radioButtons[1]);

            await user.click(screen.getByRole("button", { name: /save/i }));

            await waitFor(() => {
                expect(onQuestionUpdated).toHaveBeenCalledWith({
                    id: 100,
                    questionText: "What is BDD?",
                    options: [
                        { id: 1, optionText: "Behavior-Driven Development", isCorrect: false, explanation: "Correct!" },
                        { id: 2, optionText: "Time-Driven Development", isCorrect: true, explanation: null },
                        { id: 3, optionText: "Task-Driven Design", isCorrect: false, explanation: null },
                        { id: 4, optionText: "Test-Delayed Development", isCorrect: false, explanation: null },
                    ],
                });
            });

            expect(global.fetch).toHaveBeenCalledWith(
                "/api/v1/questions/100",
                expect.objectContaining({
                    method: "PATCH",
                    body: JSON.stringify({
                        questionText: "What is BDD?",
                        options: [
                            { id: 1, optionText: "Behavior-Driven Development", isCorrect: false, explanation: "Correct!" },
                            { id: 2, optionText: "Time-Driven Development", isCorrect: true, explanation: null },
                            { id: 3, optionText: "Task-Driven Design", isCorrect: false, explanation: null },
                            { id: 4, optionText: "Test-Delayed Development", isCorrect: false, explanation: null },
                        ],
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
                        data: { error: "Question text cannot be empty" },
                    }),
            });

            render(
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            await user.click(screen.getByRole("button", { name: /save/i }));

            await waitFor(() => {
                expect(screen.getByText(/question text cannot be empty/i)).toBeInTheDocument();
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
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            await user.click(screen.getByRole("button", { name: /save/i }));

            expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();

            // Cleanup
            resolvePromise!({
                ok: true,
                json: () => Promise.resolve({ status: "success", data: { question } }),
            });
        });
    });

    describe("cancel behavior", () => {
        it("calls onClose when cancel is clicked", async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();
            render(
                <EditQuestionModal
                    onClose={onClose}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            await user.click(screen.getByRole("button", { name: /cancel/i }));

            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    describe("form reset on question change", () => {
        it("resets form when a different question is provided", () => {
            const { rerender } = render(
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={question}
                />
            );

            expect(screen.getByLabelText(/question text/i)).toHaveValue("What is TDD?");

            const newQuestion: TermQuestion = {
                id: 200,
                questionText: "What is React?",
                sourceTimestamp: 120,
                options: [
                    { id: 5, optionText: "A framework", isCorrect: false, explanation: null },
                    { id: 6, optionText: "A library", isCorrect: true, explanation: null },
                    { id: 7, optionText: "A language", isCorrect: false, explanation: null },
                    { id: 8, optionText: "A database", isCorrect: false, explanation: null },
                ],
            };

            rerender(
                <EditQuestionModal
                    onClose={vi.fn()}
                    onQuestionUpdated={vi.fn()}
                    question={newQuestion}
                />
            );

            expect(screen.getByLabelText(/question text/i)).toHaveValue("What is React?");
            expect(screen.getByLabelText(/^option 1$/i)).toHaveValue("A framework");

            const radioButtons = screen.getAllByRole("radio");
            expect(radioButtons[1]).toBeChecked(); // Second option is correct
        });
    });
});
