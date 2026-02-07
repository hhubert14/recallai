import { BattleGameAnswerEntity } from "@/clean-architecture/domain/entities/battle-game-answer.entity";

export function calculateAnswerScore(
  isCorrect: boolean,
  questionStartedAt: Date,
  answeredAt: Date,
  timeLimitSeconds: number
): number {
  if (!isCorrect) return 0;

  const timeLimitMs = timeLimitSeconds * 1000;
  const elapsedMs = answeredAt.getTime() - questionStartedAt.getTime();

  if (elapsedMs < 0 || elapsedMs >= timeLimitMs) return 0;

  return Math.round(((timeLimitMs - elapsedMs) / timeLimitMs) * 1000);
}

export interface RankedResult {
  slotId: number;
  rank: number;
  totalScore: number;
  correctCount: number;
  totalQuestions: number;
}

export function rankGameResults(
  answers: BattleGameAnswerEntity[],
  questionStartedAts: Map<number, string>
): RankedResult[] {
  if (answers.length === 0) return [];

  // Group answers by slotId
  const bySlot = new Map<
    number,
    { totalScore: number; totalElapsedMs: number; correctCount: number; totalQuestions: number }
  >();

  for (const answer of answers) {
    if (!bySlot.has(answer.slotId)) {
      bySlot.set(answer.slotId, {
        totalScore: 0,
        totalElapsedMs: 0,
        correctCount: 0,
        totalQuestions: 0,
      });
    }
    const slot = bySlot.get(answer.slotId)!;
    slot.totalScore += answer.score;
    slot.totalQuestions += 1;
    if (answer.isCorrect) slot.correctCount += 1;

    const startedAt = questionStartedAts.get(answer.questionIndex);
    if (startedAt) {
      const elapsed =
        new Date(answer.answeredAt).getTime() - new Date(startedAt).getTime();
      slot.totalElapsedMs += Math.max(0, elapsed);
    } else {
      // Fallback: use raw answeredAt timestamp for relative ordering
      slot.totalElapsedMs += new Date(answer.answeredAt).getTime();
    }
  }

  // Sort: total score DESC, total elapsed time ASC (tie-break)
  const sorted = [...bySlot.entries()].sort(([, a], [, b]) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return a.totalElapsedMs - b.totalElapsedMs;
  });

  return sorted.map(([slotId, data], index) => ({
    slotId,
    rank: index + 1,
    totalScore: data.totalScore,
    correctCount: data.correctCount,
    totalQuestions: data.totalQuestions,
  }));
}
