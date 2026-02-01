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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CharacterCount } from "@/components/ui/character-count";
import { CHARACTER_LIMITS } from "./types";

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
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open && isLoading) return;
                if (!open) onClose();
            }}
        >
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Item</DialogTitle>
                    <DialogDescription>
                        Add a new flashcard or question to this study set.
                    </DialogDescription>
                </DialogHeader>

                {/* Tab buttons */}
                <div className="flex gap-2 border-b border-border pb-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab("flashcard")}
                        className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                            activeTab === "flashcard"
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background hover:bg-muted text-foreground"
                        }`}
                    >
                        Flashcard
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("question")}
                        className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                            activeTab === "question"
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background hover:bg-muted text-foreground"
                        }`}
                    >
                        Question
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        {activeTab === "flashcard" ? (
                            <>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="flashcard-front">Front</Label>
                                        <CharacterCount current={front.length} max={CHARACTER_LIMITS.flashcardFront} />
                                    </div>
                                    <Input
                                        id="flashcard-front"
                                        value={front}
                                        onChange={(e) => setFront(e.target.value)}
                                        placeholder="Question or term"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="flashcard-back">Back</Label>
                                        <CharacterCount current={back.length} max={CHARACTER_LIMITS.flashcardBack} />
                                    </div>
                                    <Textarea
                                        id="flashcard-back"
                                        value={back}
                                        onChange={(e) => setBack(e.target.value)}
                                        placeholder="Answer or definition"
                                        disabled={isLoading}
                                        rows={3}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="question-text">Question Text</Label>
                                        <CharacterCount current={questionText.length} max={CHARACTER_LIMITS.questionText} />
                                    </div>
                                    <Textarea
                                        id="question-text"
                                        value={questionText}
                                        onChange={(e) => setQuestionText(e.target.value)}
                                        placeholder="Enter your question"
                                        disabled={isLoading}
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label>Options (click badge to change correct answer)</Label>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCorrectOption("A")}
                                            disabled={isLoading}
                                            className={`text-xs px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                                                correctOption === "A"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            }`}
                                        >
                                            {correctOption === "A" ? "Correct" : "Wrong"}
                                        </button>
                                        <Input
                                            id="option-a"
                                            value={optionA}
                                            onChange={(e) => setOptionA(e.target.value)}
                                            placeholder="Option A"
                                            disabled={isLoading}
                                            className="flex-1"
                                        />
                                        <CharacterCount current={optionA.length} max={CHARACTER_LIMITS.optionText} />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCorrectOption("B")}
                                            disabled={isLoading}
                                            className={`text-xs px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                                                correctOption === "B"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            }`}
                                        >
                                            {correctOption === "B" ? "Correct" : "Wrong"}
                                        </button>
                                        <Input
                                            id="option-b"
                                            value={optionB}
                                            onChange={(e) => setOptionB(e.target.value)}
                                            placeholder="Option B"
                                            disabled={isLoading}
                                            className="flex-1"
                                        />
                                        <CharacterCount current={optionB.length} max={CHARACTER_LIMITS.optionText} />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCorrectOption("C")}
                                            disabled={isLoading}
                                            className={`text-xs px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                                                correctOption === "C"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            }`}
                                        >
                                            {correctOption === "C" ? "Correct" : "Wrong"}
                                        </button>
                                        <Input
                                            id="option-c"
                                            value={optionC}
                                            onChange={(e) => setOptionC(e.target.value)}
                                            placeholder="Option C"
                                            disabled={isLoading}
                                            className="flex-1"
                                        />
                                        <CharacterCount current={optionC.length} max={CHARACTER_LIMITS.optionText} />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCorrectOption("D")}
                                            disabled={isLoading}
                                            className={`text-xs px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                                                correctOption === "D"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            }`}
                                        >
                                            {correctOption === "D" ? "Correct" : "Wrong"}
                                        </button>
                                        <Input
                                            id="option-d"
                                            value={optionD}
                                            onChange={(e) => setOptionD(e.target.value)}
                                            placeholder="Option D"
                                            disabled={isLoading}
                                            className="flex-1"
                                        />
                                        <CharacterCount current={optionD.length} max={CHARACTER_LIMITS.optionText} />
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
