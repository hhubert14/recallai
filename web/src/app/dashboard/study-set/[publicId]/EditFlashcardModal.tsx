"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TermFlashcard } from "./types";

interface EditFlashcardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFlashcardUpdated: (flashcard: { id: number; front: string; back: string }) => void;
    flashcard: TermFlashcard;
}

export function EditFlashcardModal({
    isOpen,
    onClose,
    onFlashcardUpdated,
    flashcard,
}: EditFlashcardModalProps) {
    const [front, setFront] = useState(flashcard.front);
    const [back, setBack] = useState(flashcard.back);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when flashcard changes
    useEffect(() => {
        setFront(flashcard.front);
        setBack(flashcard.back);
        setError(null);
        setIsLoading(false);
    }, [flashcard]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/v1/flashcards/${flashcard.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    front,
                    back,
                }),
            });

            const data = await response.json();

            if (!response.ok || data.status === "fail") {
                setError(data.data?.error || "Failed to update flashcard");
                setIsLoading(false);
                return;
            }

            onFlashcardUpdated({
                id: flashcard.id,
                front,
                back,
            });
            onClose();
        } catch {
            setError("An error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    const canSubmit = front.trim().length > 0 && back.trim().length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Flashcard</DialogTitle>
                    <DialogDescription>
                        Update the front and back text of this flashcard.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-flashcard-front">Front</Label>
                            <Input
                                id="edit-flashcard-front"
                                value={front}
                                onChange={(e) => setFront(e.target.value)}
                                placeholder="Question or term"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-flashcard-back">Back</Label>
                            <Input
                                id="edit-flashcard-back"
                                value={back}
                                onChange={(e) => setBack(e.target.value)}
                                placeholder="Answer or definition"
                                disabled={isLoading}
                            />
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
                            {isLoading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
