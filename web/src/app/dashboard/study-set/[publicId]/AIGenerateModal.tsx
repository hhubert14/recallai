"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Suggestion, SuggestionItemType } from "@/clean-architecture/domain/services/suggestion-generator.interface";

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

interface AIGenerateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuggestionsGenerated: (suggestions: Suggestion[]) => void;
    studySetPublicId: string;
    isVideoSourced: boolean;
}

export function AIGenerateModal({
    isOpen,
    onClose,
    onSuggestionsGenerated,
    studySetPublicId,
    isVideoSourced,
}: AIGenerateModalProps) {
    const [prompt, setPrompt] = useState("");
    const [count, setCount] = useState(DEFAULT_COUNT);
    const [itemType, setItemType] = useState<SuggestionItemType>("mix");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setPrompt("");
            setCount(DEFAULT_COUNT);
            setItemType("mix");
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen]);

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

            onSuggestionsGenerated(data.data.suggestions);
            onClose();
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

    const canSubmit = prompt.trim().length > 0 && count >= MIN_COUNT && count <= MAX_COUNT;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
        </Dialog>
    );
}
