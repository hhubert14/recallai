"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuizProgress, QuizResult, QuizSummary } from "@/components/quiz";

type Flashcard = {
    id: number;
    videoId: number | null;
    front: string;
    back: string;
};

interface FlashcardInterfaceProps {
    flashcards: Flashcard[];
}

export function FlashcardInterface({ flashcards }: FlashcardInterfaceProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [selfAssessment, setSelfAssessment] = useState<boolean | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentFlashcard = flashcards[currentIndex];

    if (!currentFlashcard || flashcards.length === 0) {
        return <div className="text-center py-8">Loading flashcards...</div>;
    }

    const handleFlip = () => {
        if (!showResult) {
            setIsFlipped(!isFlipped);
        }
    };

    const handleSubmit = async () => {
        if (selfAssessment === null) return;
        setIsSubmitting(true);
        setError(null);

        if (selfAssessment) {
            setCorrectCount(prev => prev + 1);
        }

        try {
            const response = await fetch("/api/v1/reviews/initialize-progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    flashcardId: currentFlashcard.id,
                    isCorrect: selfAssessment,
                }),
            });

            if (!response.ok) {
                console.error("Failed to save progress:", response.status);
                setError("Failed to save progress. Your answer was recorded locally.");
            }
        } catch (err) {
            console.error("Failed to save progress:", err);
            setError("Failed to save progress. Your answer was recorded locally.");
        }

        setShowResult(true);
        setIsSubmitting(false);
    };

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
            setSelfAssessment(null);
            setShowResult(false);
            setError(null);
        }
    };

    const handleFinish = () => {
        setSessionComplete(true);
    };

    const handleReset = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setSelfAssessment(null);
        setShowResult(false);
        setCorrectCount(0);
        setSessionComplete(false);
        setError(null);
    };

    const isLastCard = currentIndex === flashcards.length - 1;

    // Session complete screen
    if (sessionComplete) {
        return (
            <QuizSummary
                correct={correctCount}
                total={flashcards.length}
                actions={[
                    {
                        label: "Try Again",
                        onClick: handleReset,
                        variant: "outline",
                    },
                ]}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Progress */}
            <QuizProgress
                current={currentIndex + 1}
                total={flashcards.length}
            />

            {/* Flashcard */}
            <div
                onClick={handleFlip}
                className={`bg-muted p-8 rounded-lg border border-border min-h-[200px] flex flex-col items-center justify-center transition-colors ${
                    !showResult ? "cursor-pointer hover:border-primary/50" : ""
                }`}
            >
                <div className="text-center">
                    <p className="text-lg text-foreground leading-relaxed">
                        {isFlipped ? currentFlashcard.back : currentFlashcard.front}
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-4">
                        {isFlipped ? "(Click to see question)" : "(Click to reveal answer)"}
                    </p>
                </div>
            </div>

            {/* Self-assessment buttons (after flip, before result) */}
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

            {/* Result feedback */}
            {showResult && (
                <QuizResult
                    isCorrect={selfAssessment === true}
                    explanation={
                        selfAssessment
                            ? "Great job! Keep it up!"
                            : "No worries - you'll see this card again soon."
                    }
                />
            )}

            {/* Error message */}
            {error && (
                <p className="text-sm text-amber-600 text-center">
                    {error}
                </p>
            )}

            {/* Actions */}
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
                    <>
                        {!isLastCard ? (
                            <Button onClick={handleNext} size="lg">
                                Next Card →
                            </Button>
                        ) : (
                            <Button
                                onClick={handleFinish}
                                size="lg"
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Finish
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
