"use client";

import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface AIContentProps {
    content: string;
    className?: string;
}

export function AIContent({ content, className }: AIContentProps) {
    return (
        <div
            className={cn(
                // Base prose styling with dark mode support
                "prose prose-sm dark:prose-invert max-w-none break-words",
                // Compact spacing for lists and paragraphs
                "prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0",
                // Inherit text color and size from parent so className overrides work
                "[&>*]:text-inherit [&>*]:text-[length:inherit]",
                className
            )}
        >
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
}
