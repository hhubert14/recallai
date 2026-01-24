"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import {
  updates,
  categoryColors,
  formatUpdateDate,
} from "@/app/updates/updates-data";
import { useInView } from "@/hooks/useInView";
import { TOUR_TARGETS } from "@/components/tour/tour-constants";

export function WhatsNewCard() {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.1 });
  // Show the 2 most recent updates
  const recentUpdates = updates.slice(0, 2);

  return (
    <div
      ref={ref}
      data-tour-id={TOUR_TARGETS.whatsNew}
      className={`rounded-xl border border-border bg-card p-6 h-full flex flex-col opacity-0 transition-all duration-300 hover:shadow-md dark:hover:shadow-none dark:hover:border-foreground/20 ${isInView ? "animate-fade-up" : ""}`}
      style={{ animationDelay: "400ms", animationFillMode: "forwards" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-muted-foreground transition-transform duration-300 hover:scale-110 hover:rotate-12" />
        <h2 className="font-semibold">What&apos;s New</h2>
      </div>

      <div className="space-y-4 flex-1">
        {recentUpdates.map((update) => (
          <div key={update.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-transform duration-200 hover:scale-105 ${categoryColors[update.category]}`}
              >
                {update.category}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatUpdateDate(update.date)}
              </span>
            </div>
            <h3 className="font-medium text-sm">{update.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {update.description}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="/updates"
        className="mt-4 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
      >
        View all updates
        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
