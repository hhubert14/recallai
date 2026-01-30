"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TermCard } from "./TermCard";
import { StudyDropdown } from "./StudyDropdown";
import { ProgressOverview } from "./ProgressOverview";
import type { TermWithMastery, StudyMode, StudySetProgress, TermFlashcard, TermQuestion, EditedTermContent } from "./types";

interface TermsListProps {
    terms: TermWithMastery[];
    onStudy: (mode: StudyMode) => void;
    progress: StudySetProgress;
    studySetPublicId: string;
    dueCount?: number;
    onEditFlashcard?: (flashcard: TermFlashcard) => void;
    onEditQuestion?: (question: TermQuestion) => void;
    onDeleteFlashcard?: (flashcardId: number) => void;
    onDeleteQuestion?: (questionId: number) => void;
    // Inline editing props
    editingTermId?: { id: number; type: "flashcard" | "question" } | null;
    editedContent?: EditedTermContent;
    isSaving?: boolean;
    editError?: string | null;
    onEditedContentChange?: (content: EditedTermContent) => void;
    onSaveEdit?: () => void;
    onCancelEdit?: () => void;
}

export function TermsList({
    terms,
    onStudy,
    progress,
    studySetPublicId,
    dueCount = 0,
    onEditFlashcard,
    onEditQuestion,
    onDeleteFlashcard,
    onDeleteQuestion,
    editingTermId,
    editedContent,
    isSaving,
    editError,
    onEditedContentChange,
    onSaveEdit,
    onCancelEdit,
}: TermsListProps) {
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
            {/* Progress Overview */}
            {progress.total > 0 && <ProgressOverview progress={progress} />}

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                    Terms in this set <span className="text-muted-foreground">({terms.length})</span>
                </h2>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/study-set/${studySetPublicId}/review`}>
                            <Clock className="h-4 w-4 mr-1.5" />
                            Review{dueCount > 0 && ` (${dueCount})`}
                        </Link>
                    </Button>
                    <StudyDropdown onSelect={onStudy} disabledModes={disabledModes} totalItems={terms.length} />
                </div>
            </div>
            <div className="space-y-3">
                {terms.map((term) => {
                    const isEditing =
                        editingTermId?.id === term.id &&
                        editingTermId?.type === term.itemType;

                    return (
                        <TermCard
                            key={`${term.itemType}-${term.id}`}
                            term={term}
                            onEditFlashcard={onEditFlashcard}
                            onEditQuestion={onEditQuestion}
                            onDeleteFlashcard={onDeleteFlashcard}
                            onDeleteQuestion={onDeleteQuestion}
                            isEditing={isEditing}
                            editedContent={isEditing ? editedContent : undefined}
                            isSaving={isSaving}
                            editError={isEditing ? editError : undefined}
                            onEditedContentChange={onEditedContentChange}
                            onSaveEdit={onSaveEdit}
                            onCancelEdit={onCancelEdit}
                        />
                    );
                })}
            </div>
        </section>
    );
}
