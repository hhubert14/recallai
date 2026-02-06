"use client";

import { LucideIcon } from "lucide-react";
import { useInView } from "@/hooks/useInView";

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
  delay?: number;
}

export function StepCard({
  step,
  title,
  description,
  icon: Icon,
  delay = 0,
}: StepCardProps) {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center text-center space-y-4 opacity-0 ${
        isInView ? "animate-fade-up" : ""
      }`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      {/* Step number circle */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-muted/50 dark:bg-white/5 flex items-center justify-center border border-border">
          <span className="text-2xl font-bold text-foreground">{step}</span>
        </div>
        {/* Icon badge */}
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm max-w-[250px]">
          {description}
        </p>
      </div>
    </div>
  );
}
