"use client";

import { useState, useMemo } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "./VideoPlayer";
import { CollapsibleSummary } from "./CollapsibleSummary";
import { TermsList } from "./TermsList";
import { StudySession } from "./StudySession";
import { AddItemModal } from "./AddItemModal";
import { EditFlashcardModal } from "./EditFlashcardModal";
import { EditQuestionModal } from "./EditQuestionModal";
import { AIGenerateModal } from "./AIGenerateModal";
import type { TermWithMastery, StudyMode, TermFlashcard, TermQuestion, QuestionOption } from "./types";
import type { Suggestion } from "@/clean-architecture/domain/services/suggestion-generator.interface";

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
    const [pendingSuggestions, setPendingSuggestions] = useState<Suggestion[]>([]);
    const [editingFlashcard, setEditingFlashcard] = useState<TermFlashcard | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<TermQuestion | null>(null);

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

    const handleEditFlashcard = (flashcard: TermFlashcard) => {
        setEditingFlashcard(flashcard);
    };

    const handleFlashcardUpdated = (updated: { id: number; front: string; back: string }) => {
        setTerms((prev) =>
            prev.map((term) => {
                if (term.itemType === "flashcard" && term.flashcard?.id === updated.id) {
                    return {
                        ...term,
                        flashcard: {
                            ...term.flashcard,
                            front: updated.front,
                            back: updated.back,
                        },
                    };
                }
                return term;
            })
        );
    };

    const handleEditQuestion = (question: TermQuestion) => {
        setEditingQuestion(question);
    };

    const handleQuestionUpdated = (updated: {
        id: number;
        questionText: string;
        options: Array<{
            id: number;
            optionText: string;
            isCorrect: boolean;
            explanation: string | null;
        }>;
    }) => {
        setTerms((prev) =>
            prev.map((term) => {
                if (term.itemType === "question" && term.question?.id === updated.id) {
                    return {
                        ...term,
                        question: {
                            ...term.question,
                            questionText: updated.questionText,
                            options: updated.options as QuestionOption[],
                        },
                    };
                }
                return term;
            })
        );
    };

    const handleSuggestionsGenerated = (suggestions: Suggestion[]) => {
        setPendingSuggestions(suggestions);
        // TODO: Issue #140 will implement the review UI for these suggestions
        // For now, just store them in state
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
                onSuggestionsGenerated={handleSuggestionsGenerated}
                studySetPublicId={studySetPublicId}
                isVideoSourced={isVideoSourced}
            />

            {/* Edit Flashcard Modal */}
            {editingFlashcard && (
                <EditFlashcardModal
                    onClose={() => setEditingFlashcard(null)}
                    onFlashcardUpdated={handleFlashcardUpdated}
                    flashcard={editingFlashcard}
                />
            )}

            {/* Edit Question Modal */}
            {editingQuestion && (
                <EditQuestionModal
                    onClose={() => setEditingQuestion(null)}
                    onQuestionUpdated={handleQuestionUpdated}
                    question={editingQuestion}
                />
            )}
        </div>
    );
}
