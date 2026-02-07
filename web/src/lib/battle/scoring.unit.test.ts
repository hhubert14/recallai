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
  const startedAt = "2025-01-01T00:00:00.000Z";

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
    const questionStartedAts = new Map([
      [0, startedAt],
      [1, startedAt],
    ]);

    const answers = [
      makeAnswer(1, 0, true, 800, "2025-01-01T00:00:02.000Z"),
      makeAnswer(1, 1, true, 600, "2025-01-01T00:00:04.000Z"),
      makeAnswer(2, 0, true, 500, "2025-01-01T00:00:05.000Z"),
      makeAnswer(2, 1, true, 400, "2025-01-01T00:00:06.000Z"),
    ];

    const results = rankGameResults(answers, questionStartedAts);

    expect(results).toEqual([
      { slotId: 1, rank: 1, totalScore: 1400, correctCount: 2, totalQuestions: 2 },
      { slotId: 2, rank: 2, totalScore: 900, correctCount: 2, totalQuestions: 2 },
    ]);
  });

  it("breaks ties by total elapsed time (faster wins)", () => {
    const questionStartedAts = new Map([
      [0, "2025-01-01T00:00:00.000Z"],
    ]);

    const answers = [
      // Same score but slot 2 answered faster
      makeAnswer(1, 0, true, 500, "2025-01-01T00:00:05.000Z"), // 5s elapsed
      makeAnswer(2, 0, true, 500, "2025-01-01T00:00:03.000Z"), // 3s elapsed
    ];

    const results = rankGameResults(answers, questionStartedAts);

    expect(results[0].slotId).toBe(2); // faster player ranks higher
    expect(results[0].rank).toBe(1);
    expect(results[1].slotId).toBe(1);
    expect(results[1].rank).toBe(2);
  });

  it("handles single player", () => {
    const questionStartedAts = new Map([[0, startedAt]]);
    const answers = [makeAnswer(1, 0, true, 700, "2025-01-01T00:00:03.000Z")];

    const results = rankGameResults(answers, questionStartedAts);

    expect(results).toEqual([
      { slotId: 1, rank: 1, totalScore: 700, correctCount: 1, totalQuestions: 1 },
    ]);
  });

  it("handles all zero scores", () => {
    const questionStartedAts = new Map([[0, startedAt]]);
    const answers = [
      makeAnswer(1, 0, false, 0, "2025-01-01T00:00:05.000Z"),
      makeAnswer(2, 0, false, 0, "2025-01-01T00:00:03.000Z"),
    ];

    const results = rankGameResults(answers, questionStartedAts);

    // Both have 0 score; slot 2 answered faster so ranks higher
    expect(results[0].slotId).toBe(2);
    expect(results[0].rank).toBe(1);
    expect(results[1].slotId).toBe(1);
    expect(results[1].rank).toBe(2);
  });

  it("counts correct answers accurately", () => {
    const questionStartedAts = new Map([
      [0, startedAt],
      [1, startedAt],
      [2, startedAt],
    ]);

    const answers = [
      makeAnswer(1, 0, true, 800, "2025-01-01T00:00:02.000Z"),
      makeAnswer(1, 1, false, 0, "2025-01-01T00:00:05.000Z"),
      makeAnswer(1, 2, true, 600, "2025-01-01T00:00:04.000Z"),
    ];

    const results = rankGameResults(answers, questionStartedAts);

    expect(results[0]).toEqual(
      expect.objectContaining({ correctCount: 2, totalQuestions: 3 })
    );
  });

  it("returns empty array for no answers", () => {
    const results = rankGameResults([], new Map());
    expect(results).toEqual([]);
  });
});
