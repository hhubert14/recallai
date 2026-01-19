"use client";

import { useInView } from "@/hooks/useInView";
import { UpdateEntry, formatUpdateDate } from "./updates-data";
import { CategoryBadge } from "./CategoryBadge";

interface UpdateCardProps {
  update: UpdateEntry;
  delay?: number;
}

export function UpdateCard({ update, delay = 0 }: UpdateCardProps) {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`p-6 rounded-xl border border-border bg-card hover:bg-muted/50 dark:hover:bg-white/[0.02] transition-all duration-300 opacity-0 ${
        isInView ? "animate-fade-up" : ""
      }`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-center justify-between mb-3">
        <time className="text-sm text-muted-foreground">
          {formatUpdateDate(update.date, { includeYear: true })}
        </time>
        <CategoryBadge category={update.category} />
      </div>

      <h3 className="text-lg font-semibold mb-2">{update.title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {update.description}
      </p>
    </div>
  );
}
