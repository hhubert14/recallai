import { Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TermWithMastery, MasteryStatus, TermFlashcard, TermQuestion } from "./types";

interface TermCardProps {
    term: TermWithMastery;
    onEditFlashcard?: (flashcard: TermFlashcard) => void;
    onEditQuestion?: (question: TermQuestion) => void;
}

function getMasteryIndicatorClass(status: MasteryStatus): string {
    switch (status) {
        case "mastered":
            return "bg-green-500";
        case "learning":
            return "bg-amber-500";
        case "not_started":
            return "bg-muted-foreground";
    }
}

function MasteryIndicator({ status }: { status: MasteryStatus }) {
    return (
        <div className="flex items-center justify-center px-3 border-r border-border">
            <div
                data-testid="mastery-indicator"
                className={`w-2.5 h-2.5 rounded-full ${getMasteryIndicatorClass(status)}`}
            />
        </div>
    );
}

export function TermCard({ term, onEditFlashcard, onEditQuestion }: TermCardProps) {
    if (term.itemType === "flashcard" && term.flashcard) {
        return (
            <article className="flex border border-border rounded-lg bg-card overflow-hidden">
                <MasteryIndicator status={term.masteryStatus} />
                <div className="flex-1 min-w-0 p-4 border-r border-border">
                    <p className="text-sm text-foreground break-words">{term.flashcard.front}</p>
                </div>
                <div className="flex-1 min-w-0 p-4 flex items-start justify-between gap-2">
                    <p className="text-sm text-foreground break-words min-w-0">{term.flashcard.back}</p>
                    {onEditFlashcard && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => onEditFlashcard(term.flashcard!)}
                            aria-label="Edit flashcard"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </article>
        );
    }

    if (term.itemType === "question" && term.question) {
        return (
            <article className="flex border border-border rounded-lg bg-card overflow-hidden">
                <MasteryIndicator status={term.masteryStatus} />
                <div className="flex-1 min-w-0 p-4 border-r border-border">
                    <p className="text-sm text-foreground break-words">{term.question.questionText}</p>
                </div>
                <div className="flex-1 min-w-0 p-4 flex items-start justify-between gap-2">
                    <ul className="space-y-1 min-w-0">
                        {term.question.options.map((option) => (
                            <li
                                key={option.id}
                                className={`text-sm flex items-start gap-1.5 ${
                                    option.isCorrect
                                        ? "text-green-600 dark:text-green-400 font-medium"
                                        : "text-muted-foreground"
                                }`}
                            >
                                {option.isCorrect && <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                                <span className="break-words min-w-0">{option.optionText}</span>
                            </li>
                        ))}
                    </ul>
                    {onEditQuestion && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => onEditQuestion(term.question!)}
                            aria-label="Edit question"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </article>
        );
    }

    return null;
}
