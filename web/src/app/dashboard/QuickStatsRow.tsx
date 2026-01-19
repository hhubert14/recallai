"use client";

import { Video, Trophy, Target } from "lucide-react";
import { useInView } from "@/hooks/useInView";

interface QuickStatsRowProps {
  totalVideos: number;
  questionsMastered: number;
  quizAccuracy: number;
}

export function QuickStatsRow({
  totalVideos,
  questionsMastered,
  quizAccuracy,
}: QuickStatsRowProps) {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.1 });

  const stats = [
    {
      label: "Videos Watched",
      value: totalVideos.toString(),
      icon: Video,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      delay: 0,
    },
    {
      label: "Questions Mastered",
      value: questionsMastered.toString(),
      icon: Trophy,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      delay: 100,
    },
    {
      label: "Quiz Accuracy",
      value: !Number.isNaN(quizAccuracy) ? `${quizAccuracy}%` : "—",
      icon: Target,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      delay: 200,
    },
  ];

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`group rounded-xl border border-border bg-card p-4 flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 dark:hover:shadow-none dark:hover:border-foreground/20 opacity-0 ${isInView ? "animate-fade-up" : ""}`}
          style={{ animationDelay: `${stat.delay}ms`, animationFillMode: "forwards" }}
        >
          <div className={`p-2.5 rounded-lg ${stat.bgColor} transition-transform duration-300 group-hover:scale-110`}>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
