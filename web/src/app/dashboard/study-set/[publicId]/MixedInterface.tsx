"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIContent } from "@/components/ui/ai-content";
import { QuizProgress, QuizQuestion, QuizResult, QuizSummary } from "@/components/quiz";
import type { Term } from "./types";

interface MixedInterfaceProps {
    items: Term[];
    onBack: () => void;
}

export function MixedInterface({ items, onBack }: MixedInterfaceProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [sessionComplete, setSessionComplete] = useState(false);

    const currentItem = items[currentIndex];

    const handleReset = () => {
        setCurrentIndex(0);
        setCorrectCount(0);
        setSessionComplete(false);
    };

    // Session complete screen
    if (sessionComplete) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                <QuizSummary
                    correct={correctCount}
                    total={items.length}
                    actions={[
                        {
                            label: "Try Again",
                            onClick: handleReset,
                            variant: "outline",
                        },
                    ]}
                />
            </div>
        );
    }

    if (!currentItem) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No items to study.</p>
                <Button onClick={onBack} className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    const handleItemComplete = (isCorrect: boolean) => {
        if (isCorrect) {
            setCorrectCount((prev) => prev + 1);
        }
        if (currentIndex < items.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setSessionComplete(true);
        }
    };

    if (currentItem.itemType === "flashcard" && currentItem.flashcard) {
        const flashcard = {
            id: currentItem.flashcard.id,
            front: currentItem.flashcard.front,
            back: currentItem.flashcard.back,
        };

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                <QuizProgress
                    current={currentIndex + 1}
                    total={items.length}
                />
                <SingleFlashcardItem
                    key={flashcard.id}
                    flashcard={flashcard}
                    onComplete={handleItemComplete}
                />
            </div>
        );
    }

    if (currentItem.itemType === "question" && currentItem.question) {
        const question = {
            id: currentItem.question.id,
            questionText: currentItem.question.questionText,
            options: currentItem.question.options,
        };

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                <QuizProgress
                    current={currentIndex + 1}
                    total={items.length}
                />
                <SingleQuestionItem
                    key={question.id}
                    question={question}
                    onComplete={handleItemComplete}
                />
            </div>
        );
    }

    return null;
}

// Single flashcard item component
interface SingleFlashcardItemProps {
    flashcard: {
        id: number;
        front: string;
        back: string;
    };
    onComplete: (isCorrect: boolean) => void;
}

function SingleFlashcardItem({ flashcard, onComplete }: SingleFlashcardItemProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [selfAssessment, setSelfAssessment] = useState<boolean | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFlip = () => {
        if (!showResult) {
            setIsFlipped(!isFlipped);
        }
    };

    const handleSubmit = async () => {
        if (selfAssessment === null) return;
        setIsSubmitting(true);

        try {
            await fetch("/api/v1/reviews/initialize-progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    flashcardId: flashcard.id,
                    isCorrect: selfAssessment,
                }),
            });
        } catch (err) {
            console.error("Failed to save progress:", err);
        }

        setShowResult(true);
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6">
            <button
                type="button"
                onClick={handleFlip}
                disabled={showResult}
                className={`w-full bg-muted p-8 rounded-lg border border-border min-h-[200px] flex flex-col items-center justify-center transition-colors text-left ${
                    !showResult ? "cursor-pointer hover:border-primary/50 hover:bg-muted/80" : ""
                }`}
            >
                <div className="text-center">
                    <AIContent
                        content={isFlipped ? flashcard.back : flashcard.front}
                        className="text-lg text-foreground leading-relaxed"
                    />
                    <p className="text-sm text-muted-foreground/70 mt-4">
                        {isFlipped ? "(Click to see question)" : "(Click to reveal answer)"}
                    </p>
                </div>
            </button>

            {isFlipped && !showResult && (
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                        Did you know the answer?
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button
                            variant={selfAssessment === false ? "destructive" : "outline"}
                            onClick={() => setSelfAssessment(false)}
                            className="flex-1 max-w-32"
                        >
                            Not Yet
                        </Button>
                        <Button
                            variant={selfAssessment === true ? "default" : "outline"}
                            onClick={() => setSelfAssessment(true)}
                            className="flex-1 max-w-32"
                        >
                            Got It!
                        </Button>
                    </div>
                </div>
            )}

            {showResult && selfAssessment !== null && (
                <QuizResult
                    isCorrect={selfAssessment}
                    explanation={
                        selfAssessment
                            ? "Great job! Keep it up!"
                            : "No worries - you'll see this card again soon."
                    }
                />
            )}

            <div className="flex gap-3">
                {!showResult ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={selfAssessment === null || isSubmitting}
                        size="lg"
                    >
                        {isSubmitting ? "Checking..." : "Check Answer"}
                    </Button>
                ) : (
                    <Button onClick={() => onComplete(selfAssessment === true)} size="lg">
                        Next →
                    </Button>
                )}
            </div>
        </div>
    );
}

// Single question item component
interface SingleQuestionItemProps {
    question: {
        id: number;
        questionText: string;
        options: {
            id: number;
            optionText: string;
            isCorrect: boolean;
            explanation: string | null;
        }[];
    };
    onComplete: (isCorrect: boolean) => void;
}

function SingleQuestionItem({ question, onComplete }: SingleQuestionItemProps) {
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!selectedOptionId) return;
        setIsSubmitting(true);

        const selectedOption = question.options.find(
            (opt) => opt.id === selectedOptionId
        );

        if (!selectedOption) return;

        try {
            await fetch("/api/v1/answers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionId: question.id,
                    selectedOptionId: selectedOptionId,
                    isCorrect: selectedOption.isCorrect,
                }),
            });

            await fetch("/api/v1/reviews/initialize-progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionId: question.id,
                    isCorrect: selectedOption.isCorrect,
                }),
            });
        } catch (err) {
            console.error("Failed to save answer:", err);
        }

        setShowResult(true);
        setIsSubmitting(false);
    };

    const selectedOption = question.options.find(
        (opt) => opt.id === selectedOptionId
    );

    return (
        <div className="space-y-6">
            <QuizQuestion
                questionText={question.questionText}
                options={question.options}
                selectedOptionId={selectedOptionId}
                onSelect={setSelectedOptionId}
                disabled={showResult}
                showResult={showResult}
            />

            {showResult && selectedOption && (
                <QuizResult
                    isCorrect={selectedOption.isCorrect}
                    explanation={
                        question.options.find((opt) => opt.isCorrect)?.explanation
                    }
                />
            )}

            <div className="flex gap-3">
                {!showResult ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedOptionId || isSubmitting}
                        size="lg"
                    >
                        {isSubmitting ? "Checking..." : "Check Answer"}
                    </Button>
                ) : (
                    <Button onClick={() => onComplete(selectedOption?.isCorrect ?? false)} size="lg">
                        Next →
                    </Button>
                )}
            </div>
        </div>
    );
}
