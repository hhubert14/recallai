import { Video, Trophy, Target } from "lucide-react";

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
  const stats = [
    {
      label: "Videos Watched",
      value: totalVideos.toString(),
      icon: Video,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Questions Mastered",
      value: questionsMastered.toString(),
      icon: Trophy,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Quiz Accuracy",
      value: !Number.isNaN(quizAccuracy) ? `${quizAccuracy}%` : "—",
      icon: Target,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-4 flex items-center gap-4"
        >
          <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
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
