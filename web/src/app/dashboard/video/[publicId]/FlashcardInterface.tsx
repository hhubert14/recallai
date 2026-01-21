"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Flashcard = {
    id: number;
    videoId: number;
    front: string;
    back: string;
};

interface FlashcardInterfaceProps {
    flashcards: Flashcard[];
}

export function FlashcardInterface({ flashcards }: FlashcardInterfaceProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const currentFlashcard = flashcards[currentIndex];

    if (!currentFlashcard || flashcards.length === 0) {
        return <div className="text-center py-8">Loading flashcards...</div>;
    }

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        }
    };

    const handleReset = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const isFirstCard = currentIndex === 0;
    const isLastCard = currentIndex === flashcards.length - 1;

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                    Card {currentIndex + 1} of {flashcards.length}
                </span>
                <div className="w-32 bg-muted rounded-full h-2">
                    <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                            width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
                        }}
                    />
                </div>
            </div>

            {/* Flashcard */}
            <div
                onClick={handleFlip}
                className="bg-muted p-8 rounded-lg border border-border min-h-[200px] flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
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

            {/* Navigation */}
            <div className="flex justify-between gap-3">
                <Button
                    onClick={handlePrevious}
                    disabled={isFirstCard}
                    variant="outline"
                >
                    Previous
                </Button>

                {isLastCard ? (
                    <Button
                        onClick={handleReset}
                        variant="outline"
                    >
                        Start Over
                    </Button>
                ) : (
                    <Button onClick={handleNext}>
                        Next
                    </Button>
                )}
            </div>
        </div>
    );
}
