"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Sparkles, Wrench, Bug, ArrowRight } from "lucide-react";
import {
  updates,
  UpdateCategory,
} from "@/app/updates/_components/updates-data";

const categoryIcons: Record<UpdateCategory, typeof Sparkles> = {
  "New Feature": Sparkles,
  Improvement: Wrench,
  Fix: Bug,
};

const categoryColors: Record<UpdateCategory, string> = {
  "New Feature": "text-blue-500 dark:text-blue-400",
  Improvement: "text-green-500 dark:text-green-400",
  Fix: "text-amber-500 dark:text-amber-400",
};

const categoryBgColors: Record<UpdateCategory, string> = {
  "New Feature": "bg-blue-500/10 dark:bg-blue-400/10",
  Improvement: "bg-green-500/10 dark:bg-green-400/10",
  Fix: "bg-amber-500/10 dark:bg-amber-400/10",
};

export function AnnouncementBanner() {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to avoid flash
  const [isLoaded, setIsLoaded] = useState(false);

  const latestUpdate = updates[0];

  useEffect(() => {
    if (!latestUpdate) return;

    try {
      const dismissedKey = `announcement-dismissed-${latestUpdate.id}`;
      const wasDismissed = localStorage.getItem(dismissedKey) === "true";
      setIsDismissed(wasDismissed);
    } catch {
      // localStorage may be unavailable (e.g., private browsing)
      setIsDismissed(false);
    }
    setIsLoaded(true);
  }, [latestUpdate]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!latestUpdate) return;

    try {
      const dismissedKey = `announcement-dismissed-${latestUpdate.id}`;
      localStorage.setItem(dismissedKey, "true");
    } catch {
      // localStorage may be unavailable
    }
    setIsDismissed(true);
  };

  // Don't render if no updates, dismissed, or not yet loaded
  if (!latestUpdate || isDismissed || !isLoaded) {
    return null;
  }

  const Icon = categoryIcons[latestUpdate.category];
  const iconColor = categoryColors[latestUpdate.category];
  const bgColor = categoryBgColors[latestUpdate.category];

  return (
    <div
      className="fixed top-20 right-4 z-50 animate-fade-up"
      style={{ animationFillMode: "forwards" }}
    >
      <div className="relative group w-72 rounded-xl border border-border bg-background/95 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-foreground/20 transition-all duration-300">
        <Link href="/updates" className="flex flex-col gap-2 p-4">
          {/* Header with icon */}
          <div className="flex items-center">
            <div
              className={`flex items-center gap-2 px-2 py-1 rounded-full ${bgColor}`}
            >
              <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
              <span className={`text-xs font-medium ${iconColor}`}>
                {latestUpdate.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">{latestUpdate.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {latestUpdate.description}
            </p>
          </div>

          {/* Learn more link */}
          <div className="flex items-center text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Learn more
            <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        {/* Dismiss button - positioned outside Link to avoid nested interactive elements */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
