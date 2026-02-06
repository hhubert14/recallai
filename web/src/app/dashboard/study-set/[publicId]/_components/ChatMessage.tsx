"use client";

import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import { AIContent } from "@/components/ui/ai-content";

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Extract text content from parts array
  const content = (message.parts ?? [])
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text"
    )
    .map((part) => part.text)
    .join("");

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-4 py-2 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {content ? (
          isUser ? (
            <p className="whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <AIContent content={content} />
          )
        ) : (
          <p className="text-muted-foreground italic">Thinking...</p>
        )}
      </div>
    </div>
  );
}
