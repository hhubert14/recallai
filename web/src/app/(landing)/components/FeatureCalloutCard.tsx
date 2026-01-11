"use client";

import { ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

interface FeatureCalloutCardProps {
  title: string;
  description: string;
  illustration?: ReactNode;
  delay?: number;
}

export function FeatureCalloutCard({
  title,
  description,
  illustration,
  delay = 0,
}: FeatureCalloutCardProps) {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`relative col-span-1 md:col-span-2 p-8 rounded-2xl border border-border bg-muted/30 dark:bg-white/[0.02] overflow-hidden opacity-0 ${
        isInView ? "animate-fade-up" : ""
      }`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      {/* Background illustration */}
      {illustration && (
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-50 dark:opacity-30 pointer-events-none">
          {illustration}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-md">
        <h3 className="text-xl md:text-2xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
