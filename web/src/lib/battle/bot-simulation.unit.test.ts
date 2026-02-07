import { describe, it, expect, vi, beforeEach } from "vitest";
import { simulateBotAnswer } from "./bot-simulation";

describe("simulateBotAnswer", () => {
  const options = [
    { id: 1, isCorrect: false },
    { id: 2, isCorrect: true },
    { id: 3, isCorrect: false },
    { id: 4, isCorrect: false },
  ];

  const timeLimitSeconds = 10;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a valid option ID from provided options", () => {
    const result = simulateBotAnswer(options, timeLimitSeconds);
    const optionIds = options.map((o) => o.id);
    expect(optionIds).toContain(result.selectedOptionId);
  });

  it("sets isCorrect to true when correct option is selected", () => {
    // Force Math.random to return low value (picks correct)
    vi.spyOn(Math, "random").mockReturnValue(0.1);

    const result = simulateBotAnswer(options, timeLimitSeconds);
    expect(result.selectedOptionId).toBe(2);
    expect(result.isCorrect).toBe(true);
  });

  it("sets isCorrect to false when incorrect option is selected", () => {
    // Force Math.random to pick wrong answer
    // First call: accuracy check (0.9 > 0.78 → wrong)
    // Second call: pick from wrong options (index)
    // Third call: delay
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.9) // accuracy → wrong
      .mockReturnValueOnce(0.0) // pick first wrong option
      .mockReturnValueOnce(0.5); // delay

    const result = simulateBotAnswer(options, timeLimitSeconds);
    expect(result.isCorrect).toBe(false);
  });

  it("returns delay within 1500-4000ms range", () => {
    for (let i = 0; i < 20; i++) {
      const result = simulateBotAnswer(options, timeLimitSeconds);
      expect(result.delayMs).toBeGreaterThanOrEqual(1500);
      expect(result.delayMs).toBeLessThanOrEqual(4000);
    }
  });

  it("caps delay at timeLimitSeconds * 1000 - 500 for short time limits", () => {
    const shortTimeLimit = 2; // 2 seconds → cap at 1500ms

    for (let i = 0; i < 20; i++) {
      const result = simulateBotAnswer(options, shortTimeLimit);
      expect(result.delayMs).toBeLessThanOrEqual(shortTimeLimit * 1000 - 500);
    }
  });

  it("has approximately 78% accuracy over many runs", () => {
    let correctCount = 0;
    const runs = 1000;

    for (let i = 0; i < runs; i++) {
      const result = simulateBotAnswer(options, timeLimitSeconds);
      if (result.isCorrect) correctCount++;
    }

    const accuracy = correctCount / runs;
    // Allow tolerance: 78% ± 6%
    expect(accuracy).toBeGreaterThan(0.65);
    expect(accuracy).toBeLessThan(0.90);
  });
});
