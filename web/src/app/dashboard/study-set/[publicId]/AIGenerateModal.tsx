"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Check, X, Pencil, RefreshCw } from "lucide-react";
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { LoadingAwareDialog } from "@/components/ui/loading-aware-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CharacterCount } from "@/components/ui/character-count";
import { AIContent } from "@/components/ui/ai-content";
import type {
    Suggestion,
    SuggestionItemType,
    FlashcardSuggestion,
    QuestionSuggestion,
    QuestionOptionSuggestion,
} from "@/clean-architecture/domain/services/suggestion-generator.interface";
import { CHARACTER_LIMITS, STUDY_SET_ITEM_LIMIT } from "./types";

// Type for edited suggestion content - either flashcard or question fields
type EditedSuggestionContent = {
    front?: string;
    back?: string;
    questionText?: string;
    options?: QuestionOptionSuggestion[];
};

const DEFAULT_COUNT = 5;
const MIN_COUNT = 1;
const MAX_COUNT = 100;

const ITEM_TYPE_OPTIONS: { value: SuggestionItemType; label: string }[] = [
    { value: "mix", label: "Mix (AI decides)" },
    { value: "flashcards", label: "Flashcards only" },
    { value: "questions", label: "Questions only" },
];

const PROMPT_SUGGESTIONS = [
    { label: "Key terms", prompt: "Key terms and definitions from this video" },
    { label: "Main ideas", prompt: "Main ideas and takeaways from this video" },
    { label: "Test my understanding", prompt: "Test my understanding of the key concepts" },
    { label: "Important facts", prompt: "Important facts to remember from this video" },
];

type ModalPhase = "generate" | "review";

interface FlashcardResponse {
    id: number;
    videoId: number | null;
    userId: string;
    front: string;
    back: string;
    createdAt: string;
}

interface QuestionResponse {
    id: number;
    videoId: number | null;
    questionText: string;
    options: { id: number; optionText: string; isCorrect: boolean; explanation: string | null }[];
}

interface AIGenerateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFlashcardAdded: (flashcard: FlashcardResponse) => void;
    onQuestionAdded: (question: QuestionResponse) => void;
    studySetPublicId: string;
    isVideoSourced: boolean;
}

export function AIGenerateModal({
    isOpen,
    onClose,
    onFlashcardAdded,
    onQuestionAdded,
    studySetPublicId,
    isVideoSourced,
}: AIGenerateModalProps) {
    // Generation phase state
    const [prompt, setPrompt] = useState("");
    const [count, setCount] = useState(DEFAULT_COUNT);
    const [itemType, setItemType] = useState<SuggestionItemType>("mix");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Review phase state
    const [phase, setPhase] = useState<ModalPhase>("generate");
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [initialSuggestionCount, setInitialSuggestionCount] = useState(0);
    const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState<EditedSuggestionContent>({});
    const [acceptingIds, setAcceptingIds] = useState<Set<string>>(new Set());
    const [acceptError, setAcceptError] = useState<string | null>(null);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setPrompt("");
            setCount(DEFAULT_COUNT);
            setItemType("mix");
            setError(null);
            setIsLoading(false);
            setPhase("generate");
            setSuggestions([]);
            setInitialSuggestionCount(0);
            setEditingSuggestionId(null);
            setEditedContent({});
            setAcceptingIds(new Set());
            setAcceptError(null);
        }
    }, [isOpen]);

    // Auto-close when all suggestions have been reviewed in review phase
    useEffect(() => {
        if (phase === "review" && suggestions.length === 0 && initialSuggestionCount > 0) {
            onClose();
        }
    }, [phase, suggestions.length, initialSuggestionCount, onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/v1/study-sets/${studySetPublicId}/ai/generate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        prompt,
                        count,
                        itemType,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || data.status === "fail") {
                setError(data.data?.error || "Failed to generate suggestions");
                setIsLoading(false);
                return;
            }

            const generatedSuggestions = data.data.suggestions as Suggestion[];
            setSuggestions(generatedSuggestions);
            setInitialSuggestionCount(generatedSuggestions.length);
            setPhase("review");
            setIsLoading(false);
        } catch {
            setError("An error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    const handlePromptSuggestionClick = (suggestionPrompt: string) => {
        setPrompt(suggestionPrompt);
    };

    const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
            setCount(Math.max(MIN_COUNT, Math.min(MAX_COUNT, value)));
        }
    };

    const handleAccept = useCallback(async (suggestion: Suggestion) => {
        setAcceptingIds((prev) => new Set([...prev, suggestion.tempId]));
        setAcceptError(null);

        try {
            if (suggestion.itemType === "flashcard") {
                const response = await fetch(
                    `/api/v1/study-sets/${studySetPublicId}/flashcards`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            front: suggestion.front,
                            back: suggestion.back,
                        }),
                    }
                );

                const data = await response.json();
                if (response.ok && data.status === "success") {
                    onFlashcardAdded(data.data.flashcard);
                    setSuggestions((prev) => prev.filter((s) => s.tempId !== suggestion.tempId));
                } else {
                    setAcceptError(data.data?.error || "Failed to add flashcard. Please try again.");
                }
            } else {
                const response = await fetch(
                    `/api/v1/study-sets/${studySetPublicId}/questions`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            questionText: suggestion.questionText,
                            options: suggestion.options,
                        }),
                    }
                );

                const data = await response.json();
                if (response.ok && data.status === "success") {
                    onQuestionAdded(data.data.question);
                    setSuggestions((prev) => prev.filter((s) => s.tempId !== suggestion.tempId));
                } else {
                    setAcceptError(data.data?.error || "Failed to add question. Please try again.");
                }
            }
        } catch {
            setAcceptError("An error occurred. Please try again.");
        } finally {
            setAcceptingIds((prev) => {
                const next = new Set(prev);
                next.delete(suggestion.tempId);
                return next;
            });
        }
    }, [studySetPublicId, onFlashcardAdded, onQuestionAdded]);

    const handleReject = (tempId: string) => {
        setSuggestions((prev) => prev.filter((s) => s.tempId !== tempId));
    };

    const handleEdit = (suggestion: Suggestion) => {
        setEditingSuggestionId(suggestion.tempId);
        if (suggestion.itemType === "flashcard") {
            setEditedContent({
                front: suggestion.front,
                back: suggestion.back,
            });
        } else {
            setEditedContent({
                questionText: suggestion.questionText,
                options: suggestion.options,
            });
        }
    };

    const handleSaveEdit = () => {
        if (!editingSuggestionId) return;

        setSuggestions((prev) =>
            prev.map((s) => {
                if (s.tempId !== editingSuggestionId) return s;

                if (s.itemType === "flashcard") {
                    return {
                        ...s,
                        front: editedContent.front || s.front,
                        back: editedContent.back || s.back,
                    };
                } else {
                    return {
                        ...s,
                        questionText: editedContent.questionText || s.questionText,
                        options: editedContent.options || s.options,
                    };
                }
            })
        );

        setEditingSuggestionId(null);
        setEditedContent({});
    };

    const handleCancelEdit = () => {
        setEditingSuggestionId(null);
        setEditedContent({});
    };

    const handleAcceptAll = async () => {
        // Filter out suggestions that are already being processed
        const suggestionsToAccept = suggestions.filter(
            (s) => !acceptingIds.has(s.tempId)
        );

        if (suggestionsToAccept.length === 0) return;

        setAcceptError(null);

        try {
            // Pre-check capacity by fetching current count
            const countResponse = await fetch(`/api/v1/study-sets/${studySetPublicId}/count`);
            const countData = await countResponse.json();

            if (!countResponse.ok || countData.status !== "success") {
                setAcceptError("Failed to check study set capacity. Please try again.");
                return;
            }

            const currentCount = countData.data.count;
            const remaining = STUDY_SET_ITEM_LIMIT - currentCount;

            if (remaining <= 0) {
                setAcceptError(`Study set has reached the maximum limit of ${STUDY_SET_ITEM_LIMIT} items. Remove some items to add more.`);
                return;
            }

            // Only accept up to remaining capacity
            const toAccept = suggestionsToAccept.slice(0, remaining);
            const cannotAccept = suggestionsToAccept.length - toAccept.length;

            // Accept in parallel (safe - we know we're under limit)
            await Promise.all(toAccept.map((suggestion) => handleAccept(suggestion)));

            if (cannotAccept > 0) {
                setAcceptError(`Added ${toAccept.length} items. ${cannotAccept} could not be added (limit of ${STUDY_SET_ITEM_LIMIT} reached).`);
            }
        } catch {
            setAcceptError("An error occurred while checking capacity. Please try again.");
        }
    };

    const handleRejectAll = () => {
        setSuggestions([]);
        onClose();
    };

    const handleRegenerate = () => {
        setSuggestions([]);
        setInitialSuggestionCount(0);
        setPhase("generate");
    };

    const canSubmit = prompt.trim().length > 0 && count >= MIN_COUNT && count <= MAX_COUNT;
    const reviewedCount = initialSuggestionCount - suggestions.length;

    // Render generation phase
    if (phase === "generate") {
        return (
            <LoadingAwareDialog
                open={isOpen}
                isLoading={isLoading}
                onOpenChange={(open) => !open && onClose()}
            >
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Generate with AI</DialogTitle>
                        <DialogDescription>
                            Describe what you want to learn and AI will generate flashcards and questions for you.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="ai-prompt">What would you like to learn?</Label>
                                <Textarea
                                    id="ai-prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={
                                        isVideoSourced
                                            ? "e.g., Key concepts from the video, Important definitions..."
                                            : "e.g., JavaScript fundamentals, React hooks basics..."
                                    }
                                    disabled={isLoading}
                                    rows={3}
                                />
                            </div>

                            {/* Prompt suggestion chips - only for video-sourced study sets */}
                            {isVideoSourced && (
                                <div className="flex flex-wrap gap-2">
                                    {PROMPT_SUGGESTIONS.map((suggestion) => (
                                        <button
                                            key={suggestion.label}
                                            type="button"
                                            onClick={() => handlePromptSuggestionClick(suggestion.prompt)}
                                            disabled={isLoading}
                                            className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/50 hover:bg-muted text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {suggestion.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Item type selector */}
                            <div className="space-y-2">
                                <Label htmlFor="ai-item-type">Item type</Label>
                                <div className="flex gap-2" role="radiogroup" aria-label="Item type">
                                    {ITEM_TYPE_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={itemType === option.value}
                                            onClick={() => setItemType(option.value)}
                                            disabled={isLoading}
                                            className={`text-sm px-3 py-1.5 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                itemType === option.value
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border bg-background hover:bg-muted text-foreground"
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ai-count">Number of items to generate</Label>
                                <Input
                                    id="ai-count"
                                    type="number"
                                    value={count}
                                    onChange={handleCountChange}
                                    min={MIN_COUNT}
                                    max={MAX_COUNT}
                                    disabled={isLoading}
                                    className="w-24"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {itemType === "mix"
                                        ? "AI will generate a mix of flashcards and questions based on the content."
                                        : itemType === "flashcards"
                                          ? "AI will generate flashcards with front/back format."
                                          : "AI will generate multiple choice questions with 4 options each."}
                                </p>
                            </div>

                            {error && (
                                <p className="text-sm text-destructive" role="alert">
                                    {error}
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!canSubmit || isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    "Generate"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </LoadingAwareDialog>
        );
    }

    // Render review phase
    return (
        <LoadingAwareDialog
            open={isOpen}
            isLoading={acceptingIds.size > 0}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Review Suggestions</DialogTitle>
                    <DialogDescription>
                        {reviewedCount} of {initialSuggestionCount} reviewed
                    </DialogDescription>
                </DialogHeader>

                {acceptError && (
                    <p className="text-sm text-destructive px-1" role="alert">
                        {acceptError}
                    </p>
                )}

                <div className="flex-1 overflow-y-auto space-y-4 py-4">
                    {suggestions.map((suggestion) => (
                        <SuggestionCard
                            key={suggestion.tempId}
                            suggestion={suggestion}
                            isEditing={editingSuggestionId === suggestion.tempId}
                            isAccepting={acceptingIds.has(suggestion.tempId)}
                            editedContent={editingSuggestionId === suggestion.tempId ? editedContent : {}}
                            onAccept={() => handleAccept(suggestion)}
                            onReject={() => handleReject(suggestion.tempId)}
                            onEdit={() => handleEdit(suggestion)}
                            onSaveEdit={handleSaveEdit}
                            onCancelEdit={handleCancelEdit}
                            onEditedContentChange={setEditedContent}
                        />
                    ))}
                </div>

                <DialogFooter className="flex-shrink-0 border-t pt-4">
                    <div className="flex w-full justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleRegenerate}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Regenerate
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleRejectAll}
                            >
                                Reject All
                            </Button>
                            <Button
                                type="button"
                                onClick={handleAcceptAll}
                            >
                                Accept All
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </LoadingAwareDialog>
    );
}

// Suggestion Card Component
interface SuggestionCardProps {
    suggestion: Suggestion;
    isEditing: boolean;
    isAccepting: boolean;
    editedContent: EditedSuggestionContent;
    onAccept: () => void;
    onReject: () => void;
    onEdit: () => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onEditedContentChange: (content: EditedSuggestionContent) => void;
}

function SuggestionCard({
    suggestion,
    isEditing,
    isAccepting,
    editedContent,
    onAccept,
    onReject,
    onEdit,
    onSaveEdit,
    onCancelEdit,
    onEditedContentChange,
}: SuggestionCardProps) {
    if (suggestion.itemType === "flashcard") {
        return (
            <FlashcardSuggestionCard
                suggestion={suggestion}
                isEditing={isEditing}
                isAccepting={isAccepting}
                editedContent={editedContent}
                onAccept={onAccept}
                onReject={onReject}
                onEdit={onEdit}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                onEditedContentChange={onEditedContentChange}
            />
        );
    }

    return (
        <QuestionSuggestionCard
            suggestion={suggestion}
            isEditing={isEditing}
            isAccepting={isAccepting}
            editedContent={editedContent}
            onAccept={onAccept}
            onReject={onReject}
            onEdit={onEdit}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
            onEditedContentChange={onEditedContentChange}
        />
    );
}

interface FlashcardCardProps {
    suggestion: FlashcardSuggestion;
    isEditing: boolean;
    isAccepting: boolean;
    editedContent: EditedSuggestionContent;
    onAccept: () => void;
    onReject: () => void;
    onEdit: () => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onEditedContentChange: (content: EditedSuggestionContent) => void;
}

function FlashcardSuggestionCard({
    suggestion,
    isEditing,
    isAccepting,
    editedContent,
    onAccept,
    onReject,
    onEdit,
    onSaveEdit,
    onCancelEdit,
    onEditedContentChange,
}: FlashcardCardProps) {
    if (isEditing) {
        return (
            <div
                data-testid="suggestion-card"
                className="border border-border rounded-lg p-4 space-y-3"
            >
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Flashcard
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="edit-front">Front</Label>
                        <CharacterCount current={(editedContent.front || "").length} max={CHARACTER_LIMITS.flashcardFront} />
                    </div>
                    <Textarea
                        id="edit-front"
                        value={editedContent.front || ""}
                        onChange={(e) =>
                            onEditedContentChange({ ...editedContent, front: e.target.value })
                        }
                        rows={2}
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="edit-back">Back</Label>
                        <CharacterCount current={(editedContent.back || "").length} max={CHARACTER_LIMITS.flashcardBack} />
                    </div>
                    <Textarea
                        id="edit-back"
                        value={editedContent.back || ""}
                        onChange={(e) =>
                            onEditedContentChange({ ...editedContent, back: e.target.value })
                        }
                        rows={2}
                    />
                </div>
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={onCancelEdit}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={onSaveEdit}>
                        Save
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            data-testid="suggestion-card"
            className="border border-border rounded-lg p-4 space-y-3"
        >
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Flashcard
            </div>
            <div>
                <AIContent content={suggestion.front} className="text-sm font-medium" />
            </div>
            <div>
                <AIContent content={suggestion.back} className="text-sm text-muted-foreground" />
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onAccept}
                    disabled={isAccepting}
                >
                    {isAccepting ? (
                        <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Accepting...
                        </>
                    ) : (
                        <>
                            <Check className="h-3 w-3" />
                            Accept
                        </>
                    )}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onReject}
                    disabled={isAccepting}
                >
                    <X className="h-3 w-3" />
                    Reject
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    disabled={isAccepting}
                >
                    <Pencil className="h-3 w-3" />
                    Edit
                </Button>
            </div>
        </div>
    );
}

interface QuestionCardProps {
    suggestion: QuestionSuggestion;
    isEditing: boolean;
    isAccepting: boolean;
    editedContent: EditedSuggestionContent;
    onAccept: () => void;
    onReject: () => void;
    onEdit: () => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onEditedContentChange: (content: EditedSuggestionContent) => void;
}

function QuestionSuggestionCard({
    suggestion,
    isEditing,
    isAccepting,
    editedContent,
    onAccept,
    onReject,
    onEdit,
    onSaveEdit,
    onCancelEdit,
    onEditedContentChange,
}: QuestionCardProps) {
    if (isEditing) {
        return (
            <div
                data-testid="suggestion-card"
                className="border border-border rounded-lg p-4 space-y-3"
            >
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Question
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="edit-question">Question</Label>
                        <CharacterCount current={(editedContent.questionText || "").length} max={CHARACTER_LIMITS.questionText} />
                    </div>
                    <Textarea
                        id="edit-question"
                        value={editedContent.questionText || ""}
                        onChange={(e) =>
                            onEditedContentChange({ ...editedContent, questionText: e.target.value })
                        }
                        rows={2}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Options (click badge to change correct answer)</Label>
                    {(editedContent.options || suggestion.options).map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const currentOptions = editedContent.options || suggestion.options;
                                    const newOptions = currentOptions.map((opt, i) => ({
                                        ...opt,
                                        isCorrect: i === index,
                                    }));
                                    onEditedContentChange({ ...editedContent, options: newOptions });
                                }}
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
                                    const newOptions = [...(editedContent.options || suggestion.options)];
                                    newOptions[index] = { ...newOptions[index], optionText: e.target.value };
                                    onEditedContentChange({ ...editedContent, options: newOptions });
                                }}
                                className="flex-1"
                            />
                            <CharacterCount current={option.optionText.length} max={CHARACTER_LIMITS.optionText} />
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={onCancelEdit}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={onSaveEdit}>
                        Save
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            data-testid="suggestion-card"
            className="border border-border rounded-lg p-4 space-y-3"
        >
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Question
            </div>
            <div>
                <AIContent content={suggestion.questionText} className="text-sm font-medium" />
            </div>
            <ul className="space-y-1">
                {suggestion.options.map((option, index) => (
                    <li
                        key={index}
                        className={`text-sm flex items-start gap-1.5 ${
                            option.isCorrect
                                ? "text-green-600 dark:text-green-400 font-medium"
                                : "text-muted-foreground"
                        }`}
                    >
                        {option.isCorrect && <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                        <span>{option.optionText}</span>
                    </li>
                ))}
            </ul>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onAccept}
                    disabled={isAccepting}
                >
                    {isAccepting ? (
                        <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Accepting...
                        </>
                    ) : (
                        <>
                            <Check className="h-3 w-3" />
                            Accept
                        </>
                    )}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onReject}
                    disabled={isAccepting}
                >
                    <X className="h-3 w-3" />
                    Reject
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    disabled={isAccepting}
                >
                    <Pencil className="h-3 w-3" />
                    Edit
                </Button>
            </div>
        </div>
    );
}
