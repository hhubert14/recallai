"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Chrome } from "lucide-react";
import { AnimatedHeadline } from "./components/AnimatedHeadline";
import { HeroIllustration } from "./illustrations/HeroIllustration";
import { useInView } from "@/hooks/useInView";

export function HeroSection() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent dark:from-white/[0.02] dark:to-transparent" />

      {/* Decorative grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container relative px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Content */}
          <div
            ref={ref as React.RefObject<HTMLDivElement>}
            className="flex flex-col justify-center space-y-8"
          >
            <AnimatedHeadline
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Remember What You Watch
            </AnimatedHeadline>

            <p
              className={`max-w-[540px] text-lg md:text-xl text-muted-foreground opacity-0 ${
                isInView ? "animate-fade-up" : ""
              }`}
              style={{ animationDelay: "400ms", animationFillMode: "forwards" }}
            >
              AI summaries and spaced repetition quizzes for YouTube videos.
              Turn passive watching into lasting knowledge.
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 opacity-0 ${
                isInView ? "animate-fade-up" : ""
              }`}
              style={{ animationDelay: "500ms", animationFillMode: "forwards" }}
            >
              <Button asChild size="lg" className="font-medium group">
                <Link href="/auth/sign-up">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-medium">
                <Link
                  href="https://chromewebstore.google.com/detail/recallai/dciecdpjkhhagindacahojeiaeecblaa"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  Chrome Extension
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div
              className={`flex flex-wrap gap-6 text-sm text-muted-foreground opacity-0 ${
                isInView ? "animate-fade-up" : ""
              }`}
              style={{ animationDelay: "600ms", animationFillMode: "forwards" }}
            >
              <Link
                href="https://github.com/hhubert14/recallai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Open Source
              </Link>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                100% free
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                No credit card
              </span>
            </div>
          </div>

          {/* Illustration */}
          <div
            className={`flex items-center justify-center lg:justify-end opacity-0 ${
              isInView ? "animate-fade-in" : ""
            }`}
            style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
          >
            <HeroIllustration className="w-full max-w-[400px] h-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
