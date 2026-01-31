"use client";

import { Youtube, Library, MessageSquare, Flame } from "lucide-react";
import { FeatureCard } from "./components/FeatureCard";
import { FeatureCalloutCard } from "./components/FeatureCalloutCard";
import { LeitnerBoxesSVG } from "./illustrations/LeitnerBoxesSVG";
import { AISummaryIllustration } from "./illustrations/AISummaryIllustration";
import { AITutorIllustration } from "./illustrations/AITutorIllustration";
import { useInView } from "@/hooks/useInView";

const minimalFeatures = [
  {
    title: "Learning Streaks",
    description:
      "Track your daily learning consistency. Build habits that stick.",
    icon: Flame,
  },
  {
    title: "Personal Library",
    description:
      "All your study sets organized in one place. Never lose a learning insight.",
    icon: Library,
  },
  {
    title: "YouTube Integration",
    description:
      "Paste any YouTube URL and get instant summaries, flashcards, and quiz questions. Learn from videos effortlessly.",
    icon: Youtube,
  },
  {
    title: "Video Chatbot",
    description:
      "Ask questions about any video and get instant AI-powered answers with timestamp references.",
    icon: MessageSquare,
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

        {/* Feature grid - Bento layout */}
        <div className="space-y-6">
          {/* Bento grid: AI Tutor large on left, two stacked on right */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* AI Tutor - Large card spanning 2 rows */}
            <FeatureCalloutCard
              title="AI Tutor"
              description="Practice explaining concepts using the Feynman Technique. Get personalized feedback on your understanding from an AI tutor."
              illustration={<AITutorIllustration className="w-full h-full" />}
              variant="large"
              className="md:row-span-2"
              delay={200}
            />

            {/* Spaced Repetition - Top right */}
            <FeatureCalloutCard
              title="Spaced Repetition System"
              description="Our Leitner box system schedules reviews at optimal intervals. Studies show 200% better long-term retention."
              illustration={<LeitnerBoxesSVG className="w-full h-full" />}
              delay={300}
            />

            {/* AI-Powered Generation - Bottom right */}
            <FeatureCalloutCard
              title="AI-Powered Generation"
              description="Instantly generate flashcards and quiz questions from any content. Paste notes, URLs, or describe what you want to learn."
              illustration={<AISummaryIllustration className="w-full h-full" />}
              delay={400}
            />
          </div>

          {/* Feature cards row */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {minimalFeatures.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={500 + index * 100}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
