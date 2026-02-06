"use client";

import { PlusCircle, Sparkles, Brain } from "lucide-react";
import { StepCard } from "./components/StepCard";
import { useInView } from "@/hooks/useInView";

const steps = [
  {
    step: 1,
    title: "Create Your Study Set",
    description:
      "Add a YouTube video, paste your notes, or start from scratch. AI generates flashcards and quiz questions instantly.",
    icon: PlusCircle,
  },
  {
    step: 2,
    title: "Learn with AI",
    description:
      "Practice with an AI tutor that gives personalized feedback. Ask questions and get instant answers.",
    icon: Sparkles,
  },
  {
    step: 3,
    title: "Remember Everything",
    description:
      "Spaced repetition schedules your reviews at the perfect time. Build streaks and track your progress.",
    icon: Brain,
  },
];

export function HowItWorksSection() {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section id="how-it-works" className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        {/* Section header */}
        <div
          ref={ref}
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
            Retenio seamlessly integrates with your learning routine.
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
