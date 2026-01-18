"use client";

import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";

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
                {content ? (
                    isUser ? (
                        <p className="whitespace-pre-wrap break-words">{content}</p>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none break-words prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                    )
                ) : (
                    <p className="text-gray-400 dark:text-gray-500 italic">
                        Thinking...
                    </p>
                )}
            </div>
        </div>
    );
}
