"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Chrome } from "lucide-react";
import { useInView } from "@/hooks/useInView";

export function CTASection() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className="relative text-center"
        >
          {/* Accent glow behind headline */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-white/25 dark:bg-white/15 rounded-full blur-[150px] pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <h2
              className={`text-3xl md:text-4xl lg:text-5xl font-bold opacity-0 ${
                isInView ? "animate-fade-up" : ""
              }`}
              style={{ animationFillMode: "forwards" }}
            >
              Start Learning Smarter Today
            </h2>

            <p
              className={`text-lg text-muted-foreground max-w-[500px] mx-auto opacity-0 ${
                isInView ? "animate-fade-up" : ""
              }`}
              style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
            >
              Start remembering what you watch.
              Free to use. No credit card required.
            </p>

            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center opacity-0 ${
                isInView ? "animate-fade-up" : ""
              }`}
              style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
            >
              <Button
                asChild
                size="lg"
                className="font-medium group"
              >
                <Link href="/auth/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="font-medium"
              >
                <Link
                  href="https://chromewebstore.google.com/detail/recallai/dciecdpjkhhagindacahojeiaeecblaa"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  Install Extension
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
