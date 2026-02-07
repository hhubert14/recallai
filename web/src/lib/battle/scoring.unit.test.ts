import { describe, it, expect } from "vitest";
import { calculateAnswerScore, rankGameResults } from "./scoring";
import { BattleGameAnswerEntity } from "@/clean-architecture/domain/entities/battle-game-answer.entity";

describe("calculateAnswerScore", () => {
  const timeLimitSeconds = 10;

  it("returns 1000 for instant correct answer", () => {
    const started = new Date("2025-01-01T00:00:00.000Z");
    const answered = new Date("2025-01-01T00:00:00.000Z");

    const score = calculateAnswerScore(true, started, answered, timeLimitSeconds);
    expect(score).toBe(1000);
  });

  it("returns proportional score based on remaining time", () => {
    const started = new Date("2025-01-01T00:00:00.000Z");
    const answered = new Date("2025-01-01T00:00:05.000Z"); // 5s of 10s

    const score = calculateAnswerScore(true, started, answered, timeLimitSeconds);
    expect(score).toBe(500);
  });

  it("returns score for 75% time remaining", () => {
    const started = new Date("2025-01-01T00:00:00.000Z");
    const answered = new Date("2025-01-01T00:00:02.500Z"); // 2.5s of 10s

    const score = calculateAnswerScore(true, started, answered, timeLimitSeconds);
    expect(score).toBe(750);
  });

  it("returns 0 for wrong answer regardless of speed", () => {
    const started = new Date("2025-01-01T00:00:00.000Z");
    const answered = new Date("2025-01-01T00:00:00.000Z");

    const score = calculateAnswerScore(false, started, answered, timeLimitSeconds);
    expect(score).toBe(0);
  });

  it("returns 0 when timed out (answered at exactly time limit)", () => {
    const started = new Date("2025-01-01T00:00:00.000Z");
    const answered = new Date("2025-01-01T00:00:10.000Z"); // exactly 10s

    const score = calculateAnswerScore(true, started, answered, timeLimitSeconds);
    expect(score).toBe(0);
  });

  it("returns 0 when answered after time limit", () => {
    const started = new Date("2025-01-01T00:00:00.000Z");
    const answered = new Date("2025-01-01T00:00:15.000Z"); // 15s > 10s

    const score = calculateAnswerScore(true, started, answered, timeLimitSeconds);
    expect(score).toBe(0);
  });

  it("returns 0 for negative elapsed time", () => {
    const started = new Date("2025-01-01T00:00:05.000Z");
    const answered = new Date("2025-01-01T00:00:00.000Z"); // before start

    const score = calculateAnswerScore(true, started, answered, timeLimitSeconds);
    expect(score).toBe(0);
  });

  it("rounds score to nearest integer", () => {
    const started = new Date("2025-01-01T00:00:00.000Z");
    const answered = new Date("2025-01-01T00:00:03.333Z"); // 3.333s of 10s

    const score = calculateAnswerScore(true, started, answered, timeLimitSeconds);
    // (10000 - 3333) / 10000 * 1000 = 666.7 → 667
    expect(score).toBe(667);
  });
});

describe("rankGameResults", () => {
  function makeAnswer(
    slotId: number,
    questionIndex: number,
    isCorrect: boolean,
    score: number,
    answeredAt: string
  ): BattleGameAnswerEntity {
    return new BattleGameAnswerEntity(
      questionIndex * 100 + slotId, // id
      1, // roomId
      slotId,
      questionIndex + 1, // questionId
      questionIndex,
      isCorrect ? 1 : 2, // selectedOptionId
      isCorrect,
      answeredAt,
      score
    );
  }

  it("ranks players by total score descending", () => {
    const answers = [
      makeAnswer(1, 0, true, 800, "2025-01-01T00:00:02.000Z"),
      makeAnswer(1, 1, true, 600, "2025-01-01T00:00:04.000Z"),
      makeAnswer(2, 0, true, 500, "2025-01-01T00:00:05.000Z"),
      makeAnswer(2, 1, true, 400, "2025-01-01T00:00:06.000Z"),
    ];

    const results = rankGameResults(answers);

    expect(results).toEqual([
      { slotId: 1, rank: 1, totalScore: 1400, correctCount: 2, totalQuestions: 2 },
      { slotId: 2, rank: 2, totalScore: 900, correctCount: 2, totalQuestions: 2 },
    ]);
  });

  it("assigns same rank order for tied scores", () => {
    const answers = [
      makeAnswer(1, 0, true, 500, "2025-01-01T00:00:05.000Z"),
      makeAnswer(2, 0, true, 500, "2025-01-01T00:00:03.000Z"),
    ];

    const results = rankGameResults(answers);

    expect(results).toHaveLength(2);
    // Both have score 500 — order is stable but both get sequential ranks
    expect(results[0].totalScore).toBe(500);
    expect(results[1].totalScore).toBe(500);
  });

  it("handles single player", () => {
    const answers = [makeAnswer(1, 0, true, 700, "2025-01-01T00:00:03.000Z")];

    const results = rankGameResults(answers);

    expect(results).toEqual([
      { slotId: 1, rank: 1, totalScore: 700, correctCount: 1, totalQuestions: 1 },
    ]);
  });

  it("handles all zero scores", () => {
    const answers = [
      makeAnswer(1, 0, false, 0, "2025-01-01T00:00:05.000Z"),
      makeAnswer(2, 0, false, 0, "2025-01-01T00:00:03.000Z"),
    ];

    const results = rankGameResults(answers);

    expect(results).toHaveLength(2);
    expect(results[0].totalScore).toBe(0);
    expect(results[1].totalScore).toBe(0);
  });

  it("counts correct answers accurately", () => {
    const answers = [
      makeAnswer(1, 0, true, 800, "2025-01-01T00:00:02.000Z"),
      makeAnswer(1, 1, false, 0, "2025-01-01T00:00:05.000Z"),
      makeAnswer(1, 2, true, 600, "2025-01-01T00:00:04.000Z"),
    ];

    const results = rankGameResults(answers);

    expect(results[0]).toEqual(
      expect.objectContaining({ correctCount: 2, totalQuestions: 3 })
    );
  });

  it("returns empty array for no answers", () => {
    const results = rankGameResults([]);
    expect(results).toEqual([]);
  });
});
