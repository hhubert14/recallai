"use client";

import { ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

interface FeatureCalloutCardProps {
  title: string;
  description: string;
  illustration?: ReactNode;
  delay?: number;
  variant?: "default" | "large";
  className?: string;
}

export function FeatureCalloutCard({
  title,
  description,
  illustration,
  delay = 0,
  variant = "default",
  className,
}: FeatureCalloutCardProps) {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  const isLarge = variant === "large";

  return (
    <div
      ref={ref}
      className={cn(
        "relative p-8 rounded-2xl border border-border bg-muted/30 dark:bg-white/[0.02] overflow-hidden opacity-0",
        isLarge && "flex flex-col",
        isInView && "animate-fade-up",
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      {/* Background illustration */}
      {illustration && (
        <div
          className={cn(
            "absolute opacity-50 dark:opacity-30 pointer-events-none",
            isLarge
              ? "right-0 bottom-0 w-3/4 h-2/3"
              : "right-0 top-0 w-1/2 h-full"
          )}
        >
          {illustration}
        </div>
      )}

      {/* Content */}
      <div className={cn("relative z-10", isLarge ? "max-w-sm" : "max-w-md")}>
        <h3
          className={cn(
            "font-bold mb-3",
            isLarge ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
          )}
        >
          {title}
        </h3>
        <p className={cn("text-muted-foreground", isLarge && "text-lg")}>
          {description}
        </p>
      </div>
    </div>
  );
}
