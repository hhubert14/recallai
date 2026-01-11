"use client";

import { Youtube, Zap, Brain } from "lucide-react";
import { StepCard } from "./components/StepCard";
import { useInView } from "@/hooks/useInView";

const steps = [
  {
    step: 1,
    title: "Watch",
    description:
      "Install the Chrome extension and watch educational YouTube videos as normal.",
    icon: Youtube,
  },
  {
    step: 2,
    title: "Learn",
    description:
      "AI automatically generates summaries and recall questions in the background.",
    icon: Zap,
  },
  {
    step: 3,
    title: "Retain",
    description:
      "Review with spaced repetition to ensure knowledge stays with you long-term.",
    icon: Brain,
  },
];

export function HowItWorksSection() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section id="how-it-works" className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        {/* Section header */}
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className="text-center space-y-4 mb-16"
        >
          <span
            className={`inline-block text-sm font-medium text-muted-foreground uppercase tracking-wider opacity-0 ${
              isInView ? "animate-fade-up" : ""
            }`}
            style={{ animationFillMode: "forwards" }}
          >
            How It Works
          </span>
          <h2
            className={`text-3xl md:text-4xl font-bold opacity-0 ${
              isInView ? "animate-fade-up" : ""
            }`}
            style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
          >
            Simple 3-Step Process
          </h2>
          <p
            className={`text-muted-foreground max-w-[600px] mx-auto opacity-0 ${
              isInView ? "animate-fade-up" : ""
            }`}
            style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
          >
            RecallAI seamlessly integrates with your learning routine.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connection lines (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+40px)] right-[calc(16.67%+40px)] h-px">
            <div className="w-full h-full border-t-2 border-dashed border-border" />
          </div>

          {steps.map((step, index) => (
            <StepCard key={step.step} {...step} delay={300 + index * 150} />
          ))}
        </div>
      </div>
    </section>
  );
}
