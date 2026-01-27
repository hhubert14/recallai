"use client";

import { TermCard } from "./TermCard";
import { StudyDropdown } from "./StudyDropdown";
import type { Term, StudyMode } from "./types";

interface TermsListProps {
    terms: Term[];
    onStudy: (mode: StudyMode) => void;
}

export function TermsList({ terms, onStudy }: TermsListProps) {
    const hasFlashcards = terms.some((t) => t.itemType === "flashcard");
    const hasQuestions = terms.some((t) => t.itemType === "question");

    const disabledModes: StudyMode[] = [];
    if (!hasFlashcards) disabledModes.push("flashcards");
    if (!hasQuestions) disabledModes.push("quiz");
    if (!hasFlashcards || !hasQuestions) disabledModes.push("both");

    if (terms.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No terms in this set yet.</p>
            </div>
        );
    }

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                    Terms in this set <span className="text-muted-foreground">({terms.length})</span>
                </h2>
                <StudyDropdown onSelect={onStudy} disabledModes={disabledModes} />
            </div>
            <div className="space-y-3">
                {terms.map((term) => (
                    <TermCard key={`${term.itemType}-${term.id}`} term={term} />
                ))}
            </div>
        </section>
    );
}
