"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { ConceptInput } from "@/clean-architecture/use-cases/practice/build-practice-context.use-case";

interface UsePracticeChatProps {
    studySetPublicId: string;
    concept: ConceptInput | null;
}

interface UsePracticeChatReturn {
    messages: UIMessage[];
    sendMessage: (message: string) => void;
    clearMessages: () => void;
    isSending: boolean;
    error: string | null;
}

// Default concept used when no concept is selected (hook must always be called)
const DEFAULT_CONCEPT: ConceptInput = {
    conceptName: "",
    description: "",
    itemIds: [],
};

export function usePracticeChat({
    studySetPublicId,
    concept,
}: UsePracticeChatProps): UsePracticeChatReturn {
    // Always call useChat unconditionally to follow Rules of Hooks
    const {
        messages,
        sendMessage: aiSendMessage,
        setMessages,
        status,
        error: chatError,
    } = useChat({
        transport: new DefaultChatTransport({
            api: `/api/v1/study-sets/${studySetPublicId}/practice/chat`,
        }),
    });

    function sendMessage(message: string) {
        // Don't send if no concept selected or already sending
        if (!concept || status === "streaming" || status === "submitted" || !message.trim()) return;
        aiSendMessage({ text: message.trim() }, { body: { concept } });
    }

    function clearMessages() {
        setMessages([]);
    }

    const isSending = status === "streaming" || status === "submitted";
    const error = chatError ? chatError.message : null;

    return {
        messages,
        sendMessage,
        clearMessages,
        isSending,
        error,
    };
}
