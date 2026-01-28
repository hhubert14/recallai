import { Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CharacterCount } from "@/components/ui/character-count";
import type { TermWithMastery, MasteryStatus, TermFlashcard, TermQuestion, EditedTermContent } from "./types";
import { CHARACTER_LIMITS } from "./types";

interface TermCardProps {
    term: TermWithMastery;
    // View mode callbacks
    onEditFlashcard?: (flashcard: TermFlashcard) => void;
    onEditQuestion?: (question: TermQuestion) => void;
    // Inline edit mode props
    isEditing?: boolean;
    editedContent?: EditedTermContent;
    isSaving?: boolean;
    editError?: string | null;
    onEditedContentChange?: (content: EditedTermContent) => void;
    onSaveEdit?: () => void;
    onCancelEdit?: () => void;
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

function MasteryIndicator({ status, inline = false }: { status: MasteryStatus; inline?: boolean }) {
    if (inline) {
        return (
            <div className="flex items-center gap-2">
                <div
                    data-testid="mastery-indicator"
                    className={`w-2.5 h-2.5 rounded-full ${getMasteryIndicatorClass(status)}`}
                />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center px-3 border-r border-border">
            <div
                data-testid="mastery-indicator"
                className={`w-2.5 h-2.5 rounded-full ${getMasteryIndicatorClass(status)}`}
            />
        </div>
    );
}

export function TermCard({
    term,
    onEditFlashcard,
    onEditQuestion,
    isEditing = false,
    editedContent,
    isSaving = false,
    editError,
    onEditedContentChange,
    onSaveEdit,
    onCancelEdit,
}: TermCardProps) {
    if (term.itemType === "flashcard" && term.flashcard) {
        // Edit mode for flashcard
        if (isEditing && editedContent && onEditedContentChange && onSaveEdit && onCancelEdit) {
            return (
                <article className="border border-border rounded-lg bg-card p-4 space-y-3">
                    <MasteryIndicator status={term.masteryStatus} inline />
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor={`flashcard-front-${term.id}`}>Front</Label>
                            <CharacterCount current={(editedContent.front || "").length} max={CHARACTER_LIMITS.flashcardFront} />
                        </div>
                        <Textarea
                            id={`flashcard-front-${term.id}`}
                            value={editedContent.front || ""}
                            onChange={(e) =>
                                onEditedContentChange({ ...editedContent, front: e.target.value })
                            }
                            disabled={isSaving}
                            rows={2}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor={`flashcard-back-${term.id}`}>Back</Label>
                            <CharacterCount current={(editedContent.back || "").length} max={CHARACTER_LIMITS.flashcardBack} />
                        </div>
                        <Textarea
                            id={`flashcard-back-${term.id}`}
                            value={editedContent.back || ""}
                            onChange={(e) =>
                                onEditedContentChange({ ...editedContent, back: e.target.value })
                            }
                            disabled={isSaving}
                            rows={2}
                        />
                    </div>
                    {editError && (
                        <p className="text-sm text-destructive" role="alert">
                            {editError}
                        </p>
                    )}
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCancelEdit}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button size="sm" onClick={onSaveEdit} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </article>
            );
        }

        // View mode for flashcard
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
        // Edit mode for question
        if (isEditing && editedContent && onEditedContentChange && onSaveEdit && onCancelEdit) {
            const currentOptions = editedContent.options || term.question.options;

            return (
                <article className="border border-border rounded-lg bg-card p-4 space-y-3">
                    <MasteryIndicator status={term.masteryStatus} inline />
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor={`question-text-${term.id}`}>Question</Label>
                            <CharacterCount current={(editedContent.questionText || "").length} max={CHARACTER_LIMITS.questionText} />
                        </div>
                        <Textarea
                            id={`question-text-${term.id}`}
                            value={editedContent.questionText || ""}
                            onChange={(e) =>
                                onEditedContentChange({ ...editedContent, questionText: e.target.value })
                            }
                            disabled={isSaving}
                            rows={2}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Options (click badge to change correct answer)</Label>
                        {currentOptions.map((option, index) => (
                            <div key={option.id} className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newOptions = currentOptions.map((opt, i) => ({
                                            ...opt,
                                            isCorrect: i === index,
                                        }));
                                        onEditedContentChange({ ...editedContent, options: newOptions });
                                    }}
                                    disabled={isSaving}
                                    className={`text-xs px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                                        option.isCorrect
                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                                >
                                    {option.isCorrect ? "Correct" : "Wrong"}
                                </button>
                                <Input
                                    value={option.optionText}
                                    onChange={(e) => {
                                        const newOptions = [...currentOptions];
                                        newOptions[index] = { ...newOptions[index], optionText: e.target.value };
                                        onEditedContentChange({ ...editedContent, options: newOptions });
                                    }}
                                    disabled={isSaving}
                                    className="flex-1"
                                />
                                <CharacterCount current={option.optionText.length} max={CHARACTER_LIMITS.optionText} />
                            </div>
                        ))}
                    </div>
                    {editError && (
                        <p className="text-sm text-destructive" role="alert">
                            {editError}
                        </p>
                    )}
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCancelEdit}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button size="sm" onClick={onSaveEdit} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </article>
            );
        }

        // View mode for question
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
