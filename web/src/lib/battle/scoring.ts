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
  answers: BattleGameAnswerEntity[]
): RankedResult[] {
  if (answers.length === 0) return [];

  // Group answers by slotId
  const bySlot = new Map<
    number,
    { totalScore: number; correctCount: number; totalQuestions: number }
  >();

  for (const answer of answers) {
    let slot = bySlot.get(answer.slotId);
    if (!slot) {
      slot = { totalScore: 0, correctCount: 0, totalQuestions: 0 };
      bySlot.set(answer.slotId, slot);
    }
    slot.totalScore += answer.score;
    slot.totalQuestions += 1;
    if (answer.isCorrect) slot.correctCount += 1;
  }

  // Sort: total score DESC
  const sorted = [...bySlot.entries()].sort(([, a], [, b]) => {
    return b.totalScore - a.totalScore;
  });

  return sorted.map(([slotId, data], index) => ({
    slotId,
    rank: index + 1,
    totalScore: data.totalScore,
    correctCount: data.correctCount,
    totalQuestions: data.totalQuestions,
  }));
}
