"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Chrome } from "lucide-react";
import { AnimatedHeadline } from "./components/AnimatedHeadline";
import { HeroIllustration } from "./illustrations/HeroIllustration";
import { useInView } from "@/hooks/useInView";

export function HeroSection() {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="relative w-full pt-8 pb-20 md:pt-12 md:pb-32 lg:pt-16 lg:pb-40 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent dark:from-white/[0.02] dark:to-transparent" />

      {/* Decorative grid lines */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
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
            ref={ref}
            className="flex flex-col justify-center space-y-8"
          >
            <AnimatedHeadline
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Learn Anything, Remember Everything
            </AnimatedHeadline>

            <p
              className={`max-w-[540px] text-lg md:text-xl text-muted-foreground opacity-0 ${
                isInView ? "animate-fade-up" : ""
              }`}
              style={{ animationDelay: "400ms", animationFillMode: "forwards" }}
            >
              Create flashcards, practice with an AI tutor, and master any
              subject with spaced repetition. From YouTube videos or your own
              notes.
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
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                100% free
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                No credit card
              </span>
            </div>

            {/* Featured badge */}
            <div
              className={`opacity-0 ${isInView ? "animate-fade-up" : ""}`}
              style={{ animationDelay: "700ms", animationFillMode: "forwards" }}
            >
              <a
                href="https://saasgrow.app?ref=retenio.ai"
                target="_blank"
                rel="noopener"
                className="inline-block transition-opacity hover:opacity-80"
              >
                <img
                  src="https://saasgrow.app/api/badge?type=featured&style=dark"
                  alt="Retenio on SaaSGrow"
                  width={240}
                  height={54}
                  className="dark:block hidden"
                />
                <img
                  src="https://saasgrow.app/api/badge?type=featured&style=light"
                  alt="Retenio on SaaSGrow"
                  width={240}
                  height={54}
                  className="dark:hidden block"
                />
              </a>
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
