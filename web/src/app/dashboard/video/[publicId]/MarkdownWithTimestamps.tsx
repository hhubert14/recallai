"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { useVideoPlayer } from "./VideoPlayerContext";
import { parseTimestamp } from "@/lib/format-timestamp";

interface MarkdownWithTimestampsProps {
    children: string;
    className?: string;
}

// Regex to match individual timestamps anywhere in text
// Matches: 1:15, 01:15, 1:02:30, 01:02:30, 00:00, etc.
const TIMESTAMP_REGEX = /\b(\d{1,2}:\d{2}(?::\d{2})?)\b/g;

function TimestampLink({
    timestamp,
    formattedTime,
}: {
    timestamp: number;
    formattedTime: string;
}) {
    const { seekTo } = useVideoPlayer();

    return (
        <button
            onClick={() => seekTo(timestamp)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
            title={`Jump to ${formattedTime}`}
        >
            {formattedTime}
        </button>
    );
}

function processTextWithTimestamps(text: string): (string | React.ReactElement)[] {
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;

    // Reset regex lastIndex
    TIMESTAMP_REGEX.lastIndex = 0;

    while ((match = TIMESTAMP_REGEX.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        const formattedTime = match[1]; // e.g., "00:00" or "1:02:30"
        const seconds = parseTimestamp(formattedTime);

        if (seconds !== null) {
            // Add clickable timestamp
            parts.push(
                <TimestampLink
                    key={`${match.index}-${formattedTime}`}
                    timestamp={seconds}
                    formattedTime={formattedTime}
                />
            );
        } else {
            // If parsing fails, keep original text
            parts.push(match[0]);
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}

export function MarkdownWithTimestamps({
    children,
    className,
}: MarkdownWithTimestampsProps) {
    return (
        <div className={className}>
            <ReactMarkdown
                components={{
                    p: ({ children }) => <p>{processChildren(children)}</p>,
                    li: ({ children }) => <li>{processChildren(children)}</li>,
                    strong: ({ children }) => <strong>{processChildren(children)}</strong>,
                    em: ({ children }) => <em>{processChildren(children)}</em>,
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}

// Helper to process children and replace timestamp strings
function processChildren(children: React.ReactNode): React.ReactNode {
    if (!children) return children;

    if (typeof children === "string") {
        const processed = processTextWithTimestamps(children);
        return processed.length === 1 ? processed[0] : <>{processed}</>;
    }

    if (Array.isArray(children)) {
        return children.map((child, index) => {
            if (typeof child === "string") {
                const processed = processTextWithTimestamps(child);
                return processed.length === 1 ? (
                    processed[0]
                ) : (
                    <span key={index}>{processed}</span>
                );
            }
            return child;
        });
    }

    return children;
}
