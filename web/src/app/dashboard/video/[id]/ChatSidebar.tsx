"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatMessages } from "@/hooks/useChatMessages";
import { ChatMessage } from "./ChatMessage";

interface ChatSidebarProps {
    videoId: number;
    isOpen: boolean;
    onClose: () => void;
}

export function ChatSidebar({ videoId, isOpen, onClose }: ChatSidebarProps) {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { messages, isLoading, error, sendMessage, clearHistory, isSending } =
        useChatMessages(videoId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || isSending) return;

        const message = input.trim();
        setInput("");
        await sendMessage(message);
    }

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 lg:hidden"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Ask about this video
                    </h2>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={clearHistory}
                            title="Clear chat history"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose} title="Close">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            <p className="mb-2">Ask me anything about this video!</p>
                            <p className="text-sm">
                                I can help explain concepts, answer questions, and more.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <ChatMessage key={msg.id} message={msg} />
                        ))
                    )}
                    {error && (
                        <div className="text-center text-red-500 text-sm py-2">{error}</div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form
                    onSubmit={handleSubmit}
                    className="p-4 border-t border-gray-200 dark:border-gray-700"
                >
                    <div className="flex gap-2">
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            disabled={isSending}
                            className="flex-1"
                        />
                        <Button
                            type="submit"
                            disabled={isSending || !input.trim()}
                            size="icon"
                        >
                            {isSending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
