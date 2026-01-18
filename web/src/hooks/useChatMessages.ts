"use client";

import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";

interface UseChatMessagesReturn {
    messages: UIMessage[];
    isLoading: boolean;
    error: string | null;
    sendMessage: (message: string) => void;
    clearHistory: () => Promise<void>;
    isSending: boolean;
}

export function useChatMessages(videoId: number): UseChatMessagesReturn {
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [historyError, setHistoryError] = useState<string | null>(null);

    const {
        messages,
        sendMessage: aiSendMessage,
        setMessages,
        status,
        error: chatError,
    } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/v1/chat",
        }),
    });

    // Fetch initial messages from database
    useEffect(() => {
        async function fetchMessages() {
            try {
                setIsLoadingHistory(true);
                setHistoryError(null);

                const response = await fetch(`/api/v1/chat/messages?videoId=${videoId}`);
                const data = await response.json();

                if (data.status === "success") {
                    // Convert DB messages to UIMessage format
                    const uiMessages: UIMessage[] = data.data.messages.map(
                        (msg: { id: number; role: string; content: string }) => ({
                            id: String(msg.id),
                            role: msg.role as "user" | "assistant",
                            parts: [{ type: "text" as const, text: msg.content }],
                        })
                    );
                    setMessages(uiMessages);
                } else {
                    setHistoryError(data.data?.error || "Failed to load messages");
                }
            } catch {
                setHistoryError("Failed to load messages");
            } finally {
                setIsLoadingHistory(false);
            }
        }

        fetchMessages();
    }, [videoId, setMessages]);

    function sendMessage(message: string) {
        if (status === "streaming" || status === "submitted" || !message.trim()) return;
        aiSendMessage({ text: message.trim() }, { body: { videoId } });
    }

    async function clearHistory() {
        try {
            const response = await fetch(`/api/v1/chat/messages?videoId=${videoId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setMessages([]);
            } else {
                setHistoryError("Failed to clear history");
            }
        } catch {
            setHistoryError("Failed to clear history");
        }
    }

    const isSending = status === "streaming" || status === "submitted";
    const error = historyError || (chatError ? chatError.message : null);

    return {
        messages,
        isLoading: isLoadingHistory,
        error,
        sendMessage,
        clearHistory,
        isSending,
    };
}
