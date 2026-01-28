"use client";

import { useState, useMemo } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "./VideoPlayer";
import { CollapsibleSummary } from "./CollapsibleSummary";
import { TermsList } from "./TermsList";
import { StudySession } from "./StudySession";
import { AddItemModal } from "./AddItemModal";
import { AIGenerateModal } from "./AIGenerateModal";
import type { TermWithMastery, StudyMode, TermFlashcard, TermQuestion, QuestionOption, EditedTermContent } from "./types";

interface StudySetContentProps {
    title: string;
    channelName: string | null;
    youtubeVideoId: string | null;
    isVideoSourced: boolean;
    summary: { id: number; videoId: number; content: string } | null;
    terms: TermWithMastery[];
    videoId: number | null;
    studySetId: number;
    studySetPublicId: string;
}

export function StudySetContent({
    title,
    channelName,
    youtubeVideoId,
    isVideoSourced,
    summary,
    terms: initialTerms,
    videoId,
    studySetId,
    studySetPublicId,
}: StudySetContentProps) {
    const [terms, setTerms] = useState<TermWithMastery[]>(initialTerms);
    const [activeMode, setActiveMode] = useState<StudyMode | null>(null);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [isAIGenerateModalOpen, setIsAIGenerateModalOpen] = useState(false);

    // Inline editing state
    const [editingTermId, setEditingTermId] = useState<{ id: number; type: "flashcard" | "question" } | null>(null);
    const [editedContent, setEditedContent] = useState<EditedTermContent>({});
    const [isSaving, setIsSaving] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    // Compute progress from current terms state so it updates when new terms are added
    const currentProgress = useMemo(() => ({
        mastered: terms.filter((t) => t.masteryStatus === "mastered").length,
        learning: terms.filter((t) => t.masteryStatus === "learning").length,
        notStarted: terms.filter((t) => t.masteryStatus === "not_started").length,
        total: terms.length,
    }), [terms]);

    const handleStudy = (mode: StudyMode) => {
        setActiveMode(mode);
    };

    const handleStudyComplete = () => {
        setActiveMode(null);
    };

    const handleFlashcardAdded = (flashcard: {
        id: number;
        videoId: number | null;
        userId: string;
        front: string;
        back: string;
        createdAt: string;
    }) => {
        const newTerm: TermWithMastery = {
            id: flashcard.id,
            itemType: "flashcard",
            flashcard: { id: flashcard.id, front: flashcard.front, back: flashcard.back },
            masteryStatus: "not_started",
        };
        setTerms((prev) => [...prev, newTerm]);
    };

    const handleQuestionAdded = (question: {
        id: number;
        videoId: number | null;
        questionText: string;
        options: { id: number; optionText: string; isCorrect: boolean; explanation: string | null }[];
        sourceQuote: string | null;
        sourceTimestamp: number | null;
    }) => {
        const newTerm: TermWithMastery = {
            id: question.id,
            itemType: "question",
            question: {
                id: question.id,
                questionText: question.questionText,
                options: question.options,
                sourceTimestamp: question.sourceTimestamp,
            },
            masteryStatus: "not_started",
        };
        setTerms((prev) => [...prev, newTerm]);
    };

    // Start inline editing a flashcard
    const handleEditFlashcard = (flashcard: TermFlashcard) => {
        setEditingTermId({ id: flashcard.id, type: "flashcard" });
        setEditedContent({ front: flashcard.front, back: flashcard.back });
        setEditError(null);
    };

    // Start inline editing a question
    const handleEditQuestion = (question: TermQuestion) => {
        setEditingTermId({ id: question.id, type: "question" });
        setEditedContent({
            questionText: question.questionText,
            options: question.options,
        });
        setEditError(null);
    };

    // Handle content changes during inline editing
    const handleEditedContentChange = (content: EditedTermContent) => {
        setEditedContent(content);
        // Clear error when user starts typing
        if (editError) setEditError(null);
    };

    // Cancel inline editing
    const handleCancelEdit = () => {
        setEditingTermId(null);
        setEditedContent({});
        setEditError(null);
    };

    // Delete a flashcard
    const handleDeleteFlashcard = async (flashcardId: number) => {
        try {
            const response = await fetch(`/api/v1/flashcards/${flashcardId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setTerms((prev) => prev.filter(
                    (term) => !(term.itemType === "flashcard" && term.flashcard?.id === flashcardId)
                ));
            }
        } catch {
            // Silently fail - user can retry
        }
    };

    // Delete a question
    const handleDeleteQuestion = async (questionId: number) => {
        try {
            const response = await fetch(`/api/v1/questions/${questionId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setTerms((prev) => prev.filter(
                    (term) => !(term.itemType === "question" && term.question?.id === questionId)
                ));
            }
        } catch {
            // Silently fail - user can retry
        }
    };

    // Save inline edit
    const handleSaveEdit = async () => {
        if (!editingTermId) return;

        setIsSaving(true);
        setEditError(null);

        try {
            if (editingTermId.type === "flashcard") {
                const response = await fetch(`/api/v1/flashcards/${editingTermId.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        front: editedContent.front,
                        back: editedContent.back,
                    }),
                });

                const data = await response.json();

                if (response.ok && data.status === "success") {
                    setTerms((prev) =>
                        prev.map((term) => {
                            if (term.itemType === "flashcard" && term.flashcard?.id === editingTermId.id) {
                                return {
                                    ...term,
                                    flashcard: {
                                        ...term.flashcard,
                                        front: editedContent.front ?? term.flashcard.front,
                                        back: editedContent.back ?? term.flashcard.back,
                                    },
                                };
                            }
                            return term;
                        })
                    );
                    setEditingTermId(null);
                    setEditedContent({});
                } else {
                    setEditError(data.data?.error || "Failed to save changes");
                }
            } else {
                const response = await fetch(`/api/v1/questions/${editingTermId.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        questionText: editedContent.questionText,
                        options: editedContent.options?.map((opt) => ({
                            id: opt.id,
                            optionText: opt.optionText,
                            isCorrect: opt.isCorrect,
                            explanation: opt.explanation,
                        })),
                    }),
                });

                const data = await response.json();

                if (response.ok && data.status === "success") {
                    setTerms((prev) =>
                        prev.map((term) => {
                            if (term.itemType === "question" && term.question?.id === editingTermId.id) {
                                return {
                                    ...term,
                                    question: {
                                        ...term.question,
                                        questionText: editedContent.questionText ?? term.question.questionText,
                                        options: (editedContent.options ?? term.question.options) as QuestionOption[],
                                    },
                                };
                            }
                            return term;
                        })
                    );
                    setEditingTermId(null);
                    setEditedContent({});
                } else {
                    setEditError(data.data?.error || "Failed to save changes");
                }
            }
        } catch {
            setEditError("An error occurred. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // If a study session is active, show the study interface
    if (activeMode) {
        return (
            <div className="space-y-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground mb-3 mt-2">
                        {title}
                    </h1>
                    {channelName && (
                        <p className="text-lg text-muted-foreground">
                            by {channelName}
                        </p>
                    )}
                </div>
                <StudySession
                    terms={terms}
                    mode={activeMode}
                    onComplete={handleStudyComplete}
                    videoId={videoId}
                    studySetId={studySetId}
                />
            </div>
        );
    }

    // Default view - study set overview
    return (
        <div className="space-y-6">
            {/* Title and channel */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-3 mt-2">
                    {title}
                </h1>
                {channelName && (
                    <p className="text-lg text-muted-foreground">
                        by {channelName}
                    </p>
                )}
            </div>

            {/* Video Player - Full width at top */}
            {isVideoSourced && youtubeVideoId && (
                <div className="bg-black rounded-xl overflow-hidden aspect-video shadow-lg max-w-4xl">
                    <VideoPlayer videoId={youtubeVideoId} title={title} />
                </div>
            )}

            {/* Summary - Collapsible */}
            {summary && <CollapsibleSummary content={summary.content} />}

            {/* Terms List */}
            <TermsList
                terms={terms}
                onStudy={handleStudy}
                progress={currentProgress}
                onEditFlashcard={handleEditFlashcard}
                onEditQuestion={handleEditQuestion}
                onDeleteFlashcard={handleDeleteFlashcard}
                onDeleteQuestion={handleDeleteQuestion}
                editingTermId={editingTermId}
                editedContent={editedContent}
                isSaving={isSaving}
                editError={editError}
                onEditedContentChange={handleEditedContentChange}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
            />

            {/* Add More Terms */}
            <div className="border border-border rounded-lg bg-card p-6">
                <h3 className="text-sm font-medium text-foreground mb-4">
                    Add more terms
                </h3>
                <div className="flex flex-wrap gap-3">
                    {/* Manual Add Item - always available */}
                    <Button
                        variant="outline"
                        onClick={() => setIsAddItemModalOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Add Item
                    </Button>

                    {/* Generate with AI - available for all study sets */}
                    <Button
                        variant="outline"
                        onClick={() => setIsAIGenerateModalOpen(true)}
                    >
                        <Sparkles className="h-4 w-4" />
                        Generate with AI
                    </Button>
                </div>
            </div>

            {/* Add Item Modal */}
            <AddItemModal
                isOpen={isAddItemModalOpen}
                onClose={() => setIsAddItemModalOpen(false)}
                onFlashcardAdded={handleFlashcardAdded}
                onQuestionAdded={handleQuestionAdded}
                studySetPublicId={studySetPublicId}
            />

            {/* AI Generate Modal */}
            <AIGenerateModal
                isOpen={isAIGenerateModalOpen}
                onClose={() => setIsAIGenerateModalOpen(false)}
                onFlashcardAdded={handleFlashcardAdded}
                onQuestionAdded={handleQuestionAdded}
                studySetPublicId={studySetPublicId}
                isVideoSourced={isVideoSourced}
            />
        </div>
    );
}
