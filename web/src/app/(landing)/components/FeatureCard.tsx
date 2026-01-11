"use client";

import { LucideIcon } from "lucide-react";
import { useInView } from "@/hooks/useInView";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  delay?: number;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  delay = 0,
}: FeatureCardProps) {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`group p-6 rounded-xl border border-border bg-card hover:bg-muted/50 dark:hover:bg-white/[0.02] transition-all duration-300 hover:border-foreground/20 opacity-0 ${
        isInView ? "animate-fade-up" : ""
      }`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-muted dark:bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5 text-foreground/70" />
      </div>

      {/* Content */}
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
