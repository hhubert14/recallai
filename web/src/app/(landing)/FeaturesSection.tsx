"use client";

import { Chrome, Library, FileQuestion } from "lucide-react";
import { FeatureCard } from "./components/FeatureCard";
import { FeatureCalloutCard } from "./components/FeatureCalloutCard";
import { LeitnerBoxesSVG } from "./illustrations/LeitnerBoxesSVG";
import { AISummaryIllustration } from "./illustrations/AISummaryIllustration";
import { useInView } from "@/hooks/useInView";

const minimalFeatures = [
  {
    title: "Chrome Extension",
    description:
      "Seamlessly integrates with YouTube. Just watch videos as you normally would.",
    icon: Chrome,
  },
  {
    title: "Personal Library",
    description:
      "All your processed videos organized in one place. Never lose a learning insight.",
    icon: Library,
  },
  {
    title: "Active Recall Quizzes",
    description:
      "AI-generated quizzes with direct links to video timestamps. Jump back to any concept instantly.",
    icon: FileQuestion,
  },
];

export function FeaturesSection() {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section id="features" className="w-full py-20 md:py-32 bg-muted/30 dark:bg-white/[0.01]">
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
            Features
          </span>
          <h2
            className={`text-3xl md:text-4xl font-bold opacity-0 ${
              isInView ? "animate-fade-up" : ""
            }`}
            style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
          >
            Everything You Need to Learn Better
          </h2>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Callout card: AI Summaries */}
          <FeatureCalloutCard
            title="AI-Powered Summaries"
            description="Instantly get concise, well-structured summaries highlighting key concepts from any educational video. No more rewatching."
            illustration={<AISummaryIllustration className="w-full h-full" />}
            delay={200}
          />

          {/* Callout card: Spaced Repetition */}
          <FeatureCalloutCard
            title="Spaced Repetition System"
            description="Our Leitner box system schedules reviews at optimal intervals. Studies show 200% better long-term retention."
            illustration={<LeitnerBoxesSVG className="w-full h-full" />}
            delay={300}
          />

          {/* Minimal feature cards */}
          {minimalFeatures.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              delay={400 + index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
