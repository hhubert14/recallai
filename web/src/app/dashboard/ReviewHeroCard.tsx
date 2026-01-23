"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, CheckCircle2, ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";

interface ReviewHeroCardProps {
  itemsDue: number;
}

export function ReviewHeroCard({ itemsDue }: ReviewHeroCardProps) {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.1 });
  const hasItemsDue = itemsDue > 0;

  return (
    <div
      ref={ref}
      className={`rounded-xl border border-border bg-card p-6 md:p-8 opacity-0 transition-all duration-300 hover:shadow-md dark:hover:shadow-none dark:hover:border-foreground/20 ${isInView ? "animate-fade-up" : ""}`}
      style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl transition-transform duration-300 hover:scale-105 ${
              hasItemsDue
                ? "bg-blue-100 dark:bg-blue-900/30"
                : "bg-green-100 dark:bg-green-900/30"
            }`}
          >
            {hasItemsDue ? (
              <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-1">
              {hasItemsDue
                ? `${itemsDue} item${itemsDue === 1 ? "" : "s"} ready for review`
                : "All caught up!"}
            </h2>
            <p className="text-muted-foreground">
              {hasItemsDue
                ? "Strengthen your memory with spaced repetition"
                : "Great job! Check back later for more items"}
            </p>
          </div>
        </div>

        <Button
          asChild
          size="lg"
          className={`font-medium group ${
            hasItemsDue
              ? ""
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          variant={hasItemsDue ? "default" : "secondary"}
        >
          <Link href="/dashboard/review">
            {hasItemsDue ? "Start Review" : "View Review"}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
