"use client";

import { useInView } from "@/hooks/useInView";

interface AnimatedHeadlineProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function AnimatedHeadline({
  children,
  className = "",
  as: Component = "h1",
}: AnimatedHeadlineProps) {
  const { ref, isInView } = useInView<HTMLHeadingElement>({ threshold: 0.2 });

  const words = children.split(" ");

  return (
    <Component
      ref={ref}
      className={className}
    >
      {words.map((word, index) => (
        <span
          key={index}
          className={`inline-block opacity-0 ${
            isInView ? "animate-fade-up" : ""
          }`}
          style={{
            animationDelay: `${index * 80}ms`,
            animationFillMode: "forwards",
          }}
        >
          {word}
          {index < words.length - 1 && "\u00A0"}
        </span>
      ))}
    </Component>
  );
}
