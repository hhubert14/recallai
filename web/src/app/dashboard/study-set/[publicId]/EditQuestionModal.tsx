"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { TermQuestion, QuestionOption } from "./types";

interface EditQuestionModalProps {
    onClose: () => void;
    onQuestionUpdated: (question: {
        id: number;
        questionText: string;
        options: Array<{
            id: number;
            optionText: string;
            isCorrect: boolean;
            explanation: string | null;
        }>;
    }) => void;
    question: TermQuestion;
}

export function EditQuestionModal({
    onClose,
    onQuestionUpdated,
    question,
}: EditQuestionModalProps) {
    const [questionText, setQuestionText] = useState(question.questionText);
    const [options, setOptions] = useState<QuestionOption[]>(question.options);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when question changes
    useEffect(() => {
        setQuestionText(question.questionText);
        setOptions(question.options);
        setError(null);
        setIsLoading(false);
    }, [question]);

    const handleOptionTextChange = (index: number, newText: string) => {
        setOptions(prev =>
            prev.map((opt, i) =>
                i === index ? { ...opt, optionText: newText } : opt
            )
        );
    };

    const handleCorrectAnswerChange = (index: number) => {
        setOptions(prev =>
            prev.map((opt, i) => ({
                ...opt,
                isCorrect: i === index,
            }))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/v1/questions/${question.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    questionText,
                    options: options.map(opt => ({
                        id: opt.id,
                        optionText: opt.optionText,
                        isCorrect: opt.isCorrect,
                        explanation: opt.explanation,
                    })),
                }),
            });

            const data = await response.json();

            if (!response.ok || data.status === "fail") {
                setError(data.data?.error || "Failed to update question");
                setIsLoading(false);
                return;
            }

            onQuestionUpdated(data.data.question);
            onClose();
        } catch {
            setError("An error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    const canSubmit =
        questionText.trim().length > 0 &&
        options.every(opt => opt.optionText.trim().length > 0);

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Question</DialogTitle>
                    <DialogDescription>
                        Update the question text and answer options.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="edit-question-text">Question Text</Label>
                                <span className="text-xs text-muted-foreground">
                                    {questionText.length}/1000
                                </span>
                            </div>
                            <Textarea
                                id="edit-question-text"
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                                placeholder="Enter your question"
                                disabled={isLoading}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Answer Options</Label>
                            <p className="text-xs text-muted-foreground">
                                Select the correct answer using the radio buttons.
                            </p>
                            {options.map((option, index) => (
                                <div key={option.id} className="flex items-start gap-3">
                                    <input
                                        type="radio"
                                        name="correct-answer"
                                        checked={option.isCorrect}
                                        onChange={() => handleCorrectAnswerChange(index)}
                                        disabled={isLoading}
                                        className="mt-3"
                                        aria-label={`Mark option ${index + 1} as correct`}
                                    />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor={`edit-option-${index + 1}`}>
                                                Option {index + 1}
                                            </Label>
                                            <span className="text-xs text-muted-foreground">
                                                {option.optionText.length}/500
                                            </span>
                                        </div>
                                        <Textarea
                                            id={`edit-option-${index + 1}`}
                                            value={option.optionText}
                                            onChange={(e) => handleOptionTextChange(index, e.target.value)}
                                            placeholder={`Enter option ${index + 1}`}
                                            disabled={isLoading}
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {error && (
                            <p className="text-sm text-destructive" role="alert">
                                {error}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!canSubmit || isLoading}>
                            {isLoading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
