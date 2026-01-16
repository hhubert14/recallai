"use client";

import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";

interface ChatMessageProps {
    message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === "user";

    // Extract text content from parts array
    const content = (message.parts ?? [])
        .filter((part): part is { type: "text"; text: string } => part.type === "text")
        .map((part) => part.text)
        .join("");

    return (
        <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "max-w-[85%] rounded-lg px-4 py-2 text-sm",
                    isUser
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                )}
            >
                <p className="whitespace-pre-wrap break-words">
                    {content || (
                        <span className="text-gray-400 dark:text-gray-500 italic">
                            Thinking...
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
}
