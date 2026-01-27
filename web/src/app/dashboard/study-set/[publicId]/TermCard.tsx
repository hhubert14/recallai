import { Check } from "lucide-react";
import type { Term } from "./types";

interface TermCardProps {
    term: Term;
}

export function TermCard({ term }: TermCardProps) {
    if (term.itemType === "flashcard" && term.flashcard) {
        return (
            <article className="flex border border-border rounded-lg bg-card overflow-hidden">
                <div className="flex-1 p-4 border-r border-border">
                    <p className="text-sm text-foreground">{term.flashcard.front}</p>
                </div>
                <div className="flex-1 p-4">
                    <p className="text-sm text-foreground">{term.flashcard.back}</p>
                </div>
            </article>
        );
    }

    if (term.itemType === "question" && term.question) {
        return (
            <article className="flex border border-border rounded-lg bg-card overflow-hidden">
                <div className="flex-1 p-4 border-r border-border">
                    <p className="text-sm text-foreground">{term.question.questionText}</p>
                </div>
                <div className="flex-1 p-4">
                    <ul className="space-y-1">
                        {term.question.options.map((option) => (
                            <li
                                key={option.id}
                                className={`text-sm flex items-center gap-1.5 ${
                                    option.isCorrect
                                        ? "text-green-600 dark:text-green-400 font-medium"
                                        : "text-muted-foreground"
                                }`}
                            >
                                {option.isCorrect && <Check className="h-3.5 w-3.5 shrink-0" />}
                                <span>{option.optionText}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </article>
        );
    }

    return null;
}
