"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MarkdownWithTimestamps } from "./MarkdownWithTimestamps";

interface CollapsibleSummaryProps {
  content: string;
  defaultExpanded?: boolean;
}

export function CollapsibleSummary({
  content,
  defaultExpanded = false,
}: CollapsibleSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className="border border-border rounded-lg bg-card overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        aria-expanded={isExpanded}
      >
        <h2 className="text-lg font-semibold text-foreground">Summary</h2>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4">
          <MarkdownWithTimestamps className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:mt-4 prose-headings:mb-2 prose-headings:text-foreground">
            {content}
          </MarkdownWithTimestamps>
        </div>
      )}
    </section>
  );
}
