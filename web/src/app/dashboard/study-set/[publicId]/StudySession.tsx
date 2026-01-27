"use client";

import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlashcardInterface } from "./FlashcardInterface";
import { QuizInterface } from "./QuizInterface";
import { MixedInterface } from "./MixedInterface";
import type { Term, StudyMode } from "./types";

const MAX_SESSION_ITEMS = 10;

interface StudySessionProps {
    terms: Term[];
    mode: StudyMode;
    onComplete: () => void;
    videoId: number | null;
    studySetId: number;
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function StudySession({
    terms,
    mode,
    onComplete,
    videoId,
    studySetId,
}: StudySessionProps) {
    // Filter and prepare items based on mode
    const sessionItems = useMemo(() => {
        let filtered: Term[];

        if (mode === "flashcards") {
            filtered = terms.filter((t) => t.itemType === "flashcard");
        } else if (mode === "quiz") {
            filtered = terms.filter((t) => t.itemType === "question");
        } else {
            // "both" mode - shuffle all items
            filtered = shuffleArray(terms);
        }

        // Limit to max session items
        return filtered.slice(0, MAX_SESSION_ITEMS);
    }, [terms, mode]);

    // For pure flashcards mode, use FlashcardInterface
    if (mode === "flashcards") {
        const flashcards = sessionItems
            .filter((t) => t.flashcard)
            .map((t) => ({
                id: t.flashcard!.id,
                videoId: videoId,
                front: t.flashcard!.front,
                back: t.flashcard!.back,
            }));

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onComplete}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                <FlashcardInterface flashcards={flashcards} />
            </div>
        );
    }

    // For pure quiz mode, use QuizInterface
    if (mode === "quiz") {
        const questions = sessionItems
            .filter((t) => t.question)
            .map((t) => ({
                id: t.question!.id,
                videoId: videoId,
                questionText: t.question!.questionText,
                questionType: "multiple_choice",
                sourceTimestamp: t.question!.sourceTimestamp,
                options: t.question!.options,
            }));

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onComplete}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                <QuizInterface
                    questions={questions}
                    videoId={videoId}
                    studySetId={studySetId}
                />
            </div>
        );
    }

    // For "both" mode, use MixedInterface
    return (
        <MixedInterface
            items={sessionItems}
            onBack={onComplete}
        />
    );
}
