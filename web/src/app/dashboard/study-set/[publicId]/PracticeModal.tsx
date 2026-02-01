"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AIContent } from "@/components/ui/ai-content";
import { usePracticeChat } from "@/hooks/usePracticeChat";
import { ChatMessage } from "./ChatMessage";
import type { ConceptGroup } from "@/clean-architecture/domain/services/concept-grouper.interface";
import type { ConceptInput } from "@/clean-architecture/use-cases/practice/build-practice-context.use-case";
import type { ConversationMessage } from "@/clean-architecture/domain/services/feedback-generator.interface";

type Phase = "grouping" | "concept-selection" | "chat" | "feedback";

// Hidden prompt to initiate AI conversation - filtered from display
const INIT_PROMPT = "[START]";

interface PracticeModalProps {
    isOpen: boolean;
    onClose: () => void;
    studySetPublicId: string;
}

export function PracticeModal({
    isOpen,
    onClose,
    studySetPublicId,
}: PracticeModalProps) {
    const [phase, setPhase] = useState<Phase>("grouping");
    const [concepts, setConcepts] = useState<ConceptGroup[]>([]);
    const [selectedConceptIndex, setSelectedConceptIndex] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

    const selectedConcept = selectedConceptIndex !== null ? concepts[selectedConceptIndex] : null;

    const conceptInput: ConceptInput | null = selectedConcept
        ? {
              conceptName: selectedConcept.conceptName,
              description: selectedConcept.description,
              itemIds: selectedConcept.itemIds,
          }
        : null;

    const chat = usePracticeChat({
        studySetPublicId,
        concept: conceptInput,
    });

    // Fetch concepts when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchConcepts();
        } else {
            // Reset state when modal closes
            setPhase("grouping");
            setConcepts([]);
            setSelectedConceptIndex(null);
            setFeedback("");
            setError(null);
            setInputMessage("");
        }
    }, [isOpen, studySetPublicId]);

    async function fetchConcepts() {
        try {
            setPhase("grouping");
            setError(null);

            const response = await fetch(
                `/api/v1/study-sets/${studySetPublicId}/practice/group-concepts`,
                {
                    method: "POST",
                }
            );

            const data = await response.json();

            if (data.status === "success") {
                setConcepts(data.data.concepts);
                setPhase("concept-selection");
            } else {
                setError(data.data?.error || "Failed to analyze study set");
            }
        } catch {
            setError("Failed to analyze study set. Please try again.");
        }
    }

    async function handleStartPractice() {
        if (selectedConceptIndex === null) return;
        chat.clearMessages();
        setPhase("chat");
        setInputMessage("");

        // Auto-send hidden init prompt to trigger AI to start the conversation
        chat.sendMessage(INIT_PROMPT);
    }

    async function handleEndSession() {
        if (!selectedConcept) return;

        try {
            setIsLoadingFeedback(true);

            // Convert messages to conversation history (filter out hidden init prompt)
            const conversationHistory: ConversationMessage[] = chat.messages
                .map((msg) => ({
                    role: msg.role as "user" | "assistant",
                    content:
                        msg.parts
                            ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
                            .map((p) => p.text)
                            .join("") || "",
                }))
                .filter((msg) => msg.content !== INIT_PROMPT);

            const response = await fetch(
                `/api/v1/study-sets/${studySetPublicId}/practice/generate-feedback`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        conceptName: selectedConcept.conceptName,
                        conversationHistory,
                    }),
                }
            );

            const data = await response.json();

            if (data.status === "success") {
                setFeedback(data.data.feedback);
                setPhase("feedback");
            } else {
                // Fallback feedback if generation fails
                setFeedback(
                    "Great practice session! Keep explaining concepts to deepen understanding."
                );
                setPhase("feedback");
            }
        } catch {
            // Fallback feedback on error
            setFeedback(
                "Great practice session! Keep explaining concepts to deepen understanding."
            );
            setPhase("feedback");
        } finally {
            setIsLoadingFeedback(false);
        }
    }

    function handlePracticeAnother() {
        setPhase("concept-selection");
        setSelectedConceptIndex(null);
        setFeedback("");
        chat.clearMessages();
        setInputMessage("");
    }

    function handleSendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!inputMessage.trim() || chat.isSending) return;
        chat.sendMessage(inputMessage);
        setInputMessage("");
    }

    const isAnyLoading = phase === "grouping" || chat.isSending || isLoadingFeedback;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open && isAnyLoading) return;
                if (!open) onClose();
            }}
        >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Practice Mode
                    </DialogTitle>
                </DialogHeader>

                {/* Phase 1: Grouping */}
                {phase === "grouping" && !error && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-lg text-muted-foreground">
                            Analyzing your study set...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-lg text-destructive mb-4">{error}</p>
                        <Button onClick={fetchConcepts}>Retry</Button>
                    </div>
                )}

                {/* Phase 2: Concept Selection */}
                {phase === "concept-selection" && (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Choose a Concept
                        </p>
                        <RadioGroup
                            value={
                                selectedConceptIndex !== null
                                    ? String(selectedConceptIndex)
                                    : undefined
                            }
                            onValueChange={(value) =>
                                setSelectedConceptIndex(parseInt(value))
                            }
                        >
                            {concepts.map((concept, index) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer"
                                >
                                    <RadioGroupItem
                                        value={String(index)}
                                        id={`concept-${index}`}
                                    />
                                    <Label
                                        htmlFor={`concept-${index}`}
                                        className="flex-1 cursor-pointer"
                                    >
                                        <div className="font-medium">
                                            {concept.conceptName}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {concept.description}
                                        </div>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleStartPractice}
                                disabled={selectedConceptIndex === null}
                            >
                                Start Practice
                            </Button>
                        </div>
                    </div>
                )}

                {/* Phase 3: Chat */}
                {phase === "chat" && selectedConcept && (
                    <div className="space-y-4">
                        <div className="rounded-lg bg-muted p-4">
                            <h3 className="font-medium mb-1">
                                {selectedConcept.conceptName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {selectedConcept.description}
                            </p>
                        </div>

                        {/* Messages */}
                        <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                            {/* Filter out the hidden init prompt from display */}
                            {(() => {
                                const visibleMessages = chat.messages.filter((m) => {
                                    const text = m.parts?.filter((p): p is { type: "text"; text: string } => p.type === "text").map((p) => p.text).join("") || "";
                                    return text !== INIT_PROMPT;
                                });

                                if (visibleMessages.length === 0) {
                                    return (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            {chat.isSending ? "AI is thinking..." : "Starting practice session..."}
                                        </p>
                                    );
                                }

                                return visibleMessages.map((message) => (
                                    <ChatMessage key={message.id} message={message} />
                                ));
                            })()}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="space-y-2">
                            <Input
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Explain the concept in your own words..."
                                disabled={chat.isSending}
                            />
                            <div className="flex justify-between gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleEndSession}
                                    disabled={isLoadingFeedback}
                                >
                                    End Session
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!inputMessage.trim() || chat.isSending}
                                >
                                    Send
                                </Button>
                            </div>
                        </form>

                        {chat.error && (
                            <p className="text-sm text-destructive">{chat.error}</p>
                        )}
                    </div>
                )}

                {/* Phase 4: Feedback */}
                {phase === "feedback" && (
                    <div className="space-y-4">
                        <div className="rounded-lg bg-muted p-6">
                            <h3 className="font-medium mb-2">Session Feedback</h3>
                            <AIContent
                                content={feedback}
                                className="text-sm text-muted-foreground"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handlePracticeAnother}>
                                Practice Another
                            </Button>
                            <Button onClick={onClose}>Done</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
