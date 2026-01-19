"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { updates, UpdateCategory } from "@/app/updates/updates-data";

const categoryColors: Record<UpdateCategory, string> = {
  "New Feature":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Improvement:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Fix: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function WhatsNewSection() {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.1 });

  // Show 3 most recent updates
  const recentUpdates = updates.slice(0, 3);

  return (
    <section id="whats-new" className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto">
        {/* Section header */}
        <div ref={ref} className="text-center space-y-4 mb-12">
          <div
            className={`flex items-center justify-center gap-2 opacity-0 ${
              isInView ? "animate-fade-up" : ""
            }`}
            style={{ animationFillMode: "forwards" }}
          >
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              What&apos;s New
            </span>
          </div>
          <h2
            className={`text-3xl md:text-4xl font-bold opacity-0 ${
              isInView ? "animate-fade-up" : ""
            }`}
            style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
          >
            Latest Updates
          </h2>
          <p
            className={`text-muted-foreground max-w-lg mx-auto opacity-0 ${
              isInView ? "animate-fade-up" : ""
            }`}
            style={{ animationDelay: "150ms", animationFillMode: "forwards" }}
          >
            We&apos;re constantly improving RecallAI to help you learn better
          </p>
        </div>

        {/* Updates grid - compact cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {recentUpdates.map((update, index) => (
            <Link
              key={update.id}
              href="/updates"
              className={`group rounded-xl border border-border bg-card p-5 hover:bg-muted/50 dark:hover:bg-white/[0.02] hover:border-foreground/20 transition-all duration-300 opacity-0 ${
                isInView ? "animate-fade-up" : ""
              }`}
              style={{
                animationDelay: `${200 + index * 100}ms`,
                animationFillMode: "forwards",
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(update.date)}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[update.category]}`}
                  >
                    {update.category}
                  </span>
                </div>
                <h3 className="font-semibold group-hover:text-foreground transition-colors">
                  {update.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* View all link */}
        <div
          className={`text-center opacity-0 ${isInView ? "animate-fade-up" : ""}`}
          style={{ animationDelay: "500ms", animationFillMode: "forwards" }}
        >
          <Link
            href="/updates"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            View all updates
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
