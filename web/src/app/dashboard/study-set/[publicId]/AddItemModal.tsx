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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ItemType = "flashcard" | "question";

interface FlashcardData {
    id: number;
    videoId: number | null;
    userId: string;
    front: string;
    back: string;
    createdAt: string;
}

interface QuestionOption {
    id: number;
    optionText: string;
    isCorrect: boolean;
    explanation: string | null;
}

interface QuestionData {
    id: number;
    videoId: number | null;
    questionText: string;
    options: QuestionOption[];
    sourceQuote: string | null;
    sourceTimestamp: number | null;
}

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFlashcardAdded: (flashcard: FlashcardData) => void;
    onQuestionAdded: (question: QuestionData) => void;
    studySetPublicId: string;
}

export function AddItemModal({
    isOpen,
    onClose,
    onFlashcardAdded,
    onQuestionAdded,
    studySetPublicId,
}: AddItemModalProps) {
    const [activeTab, setActiveTab] = useState<ItemType>("flashcard");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Flashcard form state
    const [front, setFront] = useState("");
    const [back, setBack] = useState("");

    // Question form state
    const [questionText, setQuestionText] = useState("");
    const [optionA, setOptionA] = useState("");
    const [optionB, setOptionB] = useState("");
    const [optionC, setOptionC] = useState("");
    const [optionD, setOptionD] = useState("");
    const [correctOption, setCorrectOption] = useState<"A" | "B" | "C" | "D">("A");

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setActiveTab("flashcard");
            setFront("");
            setBack("");
            setQuestionText("");
            setOptionA("");
            setOptionB("");
            setOptionC("");
            setOptionD("");
            setCorrectOption("A");
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleSubmitFlashcard = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/v1/study-sets/${studySetPublicId}/flashcards`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    front,
                    back,
                }),
            });

            const data = await response.json();

            if (!response.ok || data.status === "fail") {
                setError(data.data?.error || "Failed to add flashcard");
                setIsLoading(false);
                return;
            }

            onFlashcardAdded(data.data.flashcard);
            onClose();
        } catch {
            setError("An error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    const handleSubmitQuestion = async () => {
        setIsLoading(true);
        setError(null);

        const options = [
            { optionText: optionA, isCorrect: correctOption === "A", explanation: null },
            { optionText: optionB, isCorrect: correctOption === "B", explanation: null },
            { optionText: optionC, isCorrect: correctOption === "C", explanation: null },
            { optionText: optionD, isCorrect: correctOption === "D", explanation: null },
        ];

        try {
            const response = await fetch(`/api/v1/study-sets/${studySetPublicId}/questions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    questionText,
                    options,
                }),
            });

            const data = await response.json();

            if (!response.ok || data.status === "fail") {
                setError(data.data?.error || "Failed to add question");
                setIsLoading(false);
                return;
            }

            onQuestionAdded(data.data.question);
            onClose();
        } catch {
            setError("An error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === "flashcard") {
            handleSubmitFlashcard();
        } else {
            handleSubmitQuestion();
        }
    };

    const canSubmitFlashcard = front.trim().length > 0 && back.trim().length > 0;
    const canSubmitQuestion =
        questionText.trim().length > 0 &&
        optionA.trim().length > 0 &&
        optionB.trim().length > 0 &&
        optionC.trim().length > 0 &&
        optionD.trim().length > 0;

    const canSubmit = activeTab === "flashcard" ? canSubmitFlashcard : canSubmitQuestion;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Item</DialogTitle>
                    <DialogDescription>
                        Add a new flashcard or question to this study set.
                    </DialogDescription>
                </DialogHeader>

                {/* Tab buttons */}
                <div className="flex gap-2 border-b border-border pb-2">
                    <Button
                        type="button"
                        variant={activeTab === "flashcard" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab("flashcard")}
                    >
                        Flashcard
                    </Button>
                    <Button
                        type="button"
                        variant={activeTab === "question" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab("question")}
                    >
                        Question
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        {activeTab === "flashcard" ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="flashcard-front">Front</Label>
                                    <Input
                                        id="flashcard-front"
                                        value={front}
                                        onChange={(e) => setFront(e.target.value)}
                                        placeholder="Question or term"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="flashcard-back">Back</Label>
                                    <Input
                                        id="flashcard-back"
                                        value={back}
                                        onChange={(e) => setBack(e.target.value)}
                                        placeholder="Answer or definition"
                                        disabled={isLoading}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="question-text">Question Text</Label>
                                    <Input
                                        id="question-text"
                                        value={questionText}
                                        onChange={(e) => setQuestionText(e.target.value)}
                                        placeholder="Enter your question"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <p className="text-sm font-medium">Options (select correct answer)</p>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                id="correct-a"
                                                name="correctOption"
                                                checked={correctOption === "A"}
                                                onChange={() => setCorrectOption("A")}
                                                disabled={isLoading}
                                                aria-label="Option A is correct"
                                            />
                                            <Label htmlFor="option-a" className="flex-1">Option A</Label>
                                        </div>
                                        <Input
                                            id="option-a"
                                            value={optionA}
                                            onChange={(e) => setOptionA(e.target.value)}
                                            placeholder="Option A"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                id="correct-b"
                                                name="correctOption"
                                                checked={correctOption === "B"}
                                                onChange={() => setCorrectOption("B")}
                                                disabled={isLoading}
                                                aria-label="Option B is correct"
                                            />
                                            <Label htmlFor="option-b" className="flex-1">Option B</Label>
                                        </div>
                                        <Input
                                            id="option-b"
                                            value={optionB}
                                            onChange={(e) => setOptionB(e.target.value)}
                                            placeholder="Option B"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                id="correct-c"
                                                name="correctOption"
                                                checked={correctOption === "C"}
                                                onChange={() => setCorrectOption("C")}
                                                disabled={isLoading}
                                                aria-label="Option C is correct"
                                            />
                                            <Label htmlFor="option-c" className="flex-1">Option C</Label>
                                        </div>
                                        <Input
                                            id="option-c"
                                            value={optionC}
                                            onChange={(e) => setOptionC(e.target.value)}
                                            placeholder="Option C"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                id="correct-d"
                                                name="correctOption"
                                                checked={correctOption === "D"}
                                                onChange={() => setCorrectOption("D")}
                                                disabled={isLoading}
                                                aria-label="Option D is correct"
                                            />
                                            <Label htmlFor="option-d" className="flex-1">Option D</Label>
                                        </div>
                                        <Input
                                            id="option-d"
                                            value={optionD}
                                            onChange={(e) => setOptionD(e.target.value)}
                                            placeholder="Option D"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

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
                            {isLoading ? "Adding..." : "Add"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
