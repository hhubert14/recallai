import { ReviewStatsDto } from "@/clean-architecture/use-cases/progress/get-progress-stats.use-case";

interface ReviewStatsProps {
  stats: ReviewStatsDto;
}

export function ReviewStats({ stats }: ReviewStatsProps) {
  const inProgressQuestions =
    stats.questionsInBox1 +
    stats.questionsInBox2 +
    stats.questionsInBox3 +
    stats.questionsInBox4;
  const masteredQuestions = stats.questionsInBox5;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
          {stats.questionsDueToday}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Due Today</p>
      </div>
      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
          {stats.totalQuestionsInSystem}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Questions</p>
      </div>
      <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
          {inProgressQuestions}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
      </div>
      <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
          {masteredQuestions}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Mastered</p>
      </div>
    </div>
  );
}
