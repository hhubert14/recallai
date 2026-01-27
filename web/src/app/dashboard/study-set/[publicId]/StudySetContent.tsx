"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "./VideoPlayer";
import { CollapsibleSummary } from "./CollapsibleSummary";
import { TermsList } from "./TermsList";
import { StudySession } from "./StudySession";
import type { TermWithMastery, StudyMode, StudySetProgress } from "./types";

const MAX_QUESTIONS = 20;
const MAX_FLASHCARDS = 20;

interface StudySetContentProps {
    title: string;
    channelName: string | null;
    youtubeVideoId: string | null;
    isVideoSourced: boolean;
    summary: { id: number; videoId: number; content: string } | null;
    terms: TermWithMastery[];
    videoId: number | null;
    studySetId: number;
    progress: StudySetProgress;
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
    progress,
}: StudySetContentProps) {
    const [terms, setTerms] = useState<TermWithMastery[]>(initialTerms);
    const [activeMode, setActiveMode] = useState<StudyMode | null>(null);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
    const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const questionCount = terms.filter((t) => t.itemType === "question").length;
    const flashcardCount = terms.filter((t) => t.itemType === "flashcard").length;
    const canGenerateQuestions = questionCount < MAX_QUESTIONS && videoId;
    const canGenerateFlashcards = flashcardCount < MAX_FLASHCARDS && videoId;

    async function handleGenerateQuestions() {
        if (!videoId) return;
        setIsGeneratingQuestions(true);
        setError(null);

        try {
            const response = await fetch("/api/v1/questions/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoId, studySetId, count: 5 }),
            });

            const data = await response.json();

            if (data.status === "success") {
                const newTerms: TermWithMastery[] = data.data.questions.map((q: {
                    id: number;
                    questionText: string;
                    sourceTimestamp: number | null;
                    options: { id: number; optionText: string; isCorrect: boolean; explanation: string | null }[];
                }) => ({
                    id: q.id,
                    itemType: "question" as const,
                    question: {
                        id: q.id,
                        questionText: q.questionText,
                        options: q.options,
                        sourceTimestamp: q.sourceTimestamp,
                    },
                    masteryStatus: "not_started" as const,
                }));
                setTerms((prev) => [...prev, ...newTerms]);
            } else {
                setError(data.data?.error || "Failed to generate questions");
            }
        } catch (err) {
            console.error("Failed to generate questions:", err);
            setError("Failed to generate questions. Please try again.");
        } finally {
            setIsGeneratingQuestions(false);
        }
    }

    async function handleGenerateFlashcards() {
        if (!videoId) return;
        setIsGeneratingFlashcards(true);
        setError(null);

        try {
            const response = await fetch("/api/v1/flashcards/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoId, studySetId, count: 5 }),
            });

            const data = await response.json();

            if (data.status === "success") {
                const newTerms: TermWithMastery[] = data.data.flashcards.map((f: {
                    id: number;
                    front: string;
                    back: string;
                }) => ({
                    id: f.id,
                    itemType: "flashcard" as const,
                    flashcard: { id: f.id, front: f.front, back: f.back },
                    masteryStatus: "not_started" as const,
                }));
                setTerms((prev) => [...prev, ...newTerms]);
            } else {
                setError(data.data?.error || "Failed to generate flashcards");
            }
        } catch (err) {
            console.error("Failed to generate flashcards:", err);
            setError("Failed to generate flashcards. Please try again.");
        } finally {
            setIsGeneratingFlashcards(false);
        }
    }

    const handleStudy = (mode: StudyMode) => {
        setActiveMode(mode);
    };

    const handleStudyComplete = () => {
        setActiveMode(null);
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
            <TermsList terms={terms} onStudy={handleStudy} progress={progress} />

            {/* Generate More Terms */}
            {isVideoSourced && (canGenerateQuestions || canGenerateFlashcards) && (
                <div className="border border-border rounded-lg bg-card p-6">
                    <h3 className="text-sm font-medium text-foreground mb-4">
                        Add more terms
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {canGenerateFlashcards && (
                            <Button
                                variant="outline"
                                onClick={handleGenerateFlashcards}
                                disabled={isGeneratingFlashcards || isGeneratingQuestions}
                            >
                                {isGeneratingFlashcards ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Generate 5 Flashcards
                                    </>
                                )}
                            </Button>
                        )}
                        {canGenerateQuestions && (
                            <Button
                                variant="outline"
                                onClick={handleGenerateQuestions}
                                disabled={isGeneratingQuestions || isGeneratingFlashcards}
                            >
                                {isGeneratingQuestions ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Generate 5 Questions
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                    {error && (
                        <p className="text-sm text-destructive mt-3">{error}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                        {flashcardCount}/{MAX_FLASHCARDS} flashcards · {questionCount}/{MAX_QUESTIONS} questions
                    </p>
                </div>
            )}
        </div>
    );
}
