import { describe, it, expect } from "vitest";
import { BattleGameAnswerEntity } from "./battle-game-answer.entity";

describe("BattleGameAnswerEntity", () => {
  describe("constructor", () => {
    it("creates an answer entity with a selected option", () => {
      const entity = new BattleGameAnswerEntity(
        1,
        100,
        10,
        42,
        0,
        55,
        true,
        "2025-01-20T10:00:05Z",
        950
      );

      expect(entity.id).toBe(1);
      expect(entity.roomId).toBe(100);
      expect(entity.slotId).toBe(10);
      expect(entity.questionId).toBe(42);
      expect(entity.questionIndex).toBe(0);
      expect(entity.selectedOptionId).toBe(55);
      expect(entity.isCorrect).toBe(true);
      expect(entity.answeredAt).toBe("2025-01-20T10:00:05Z");
      expect(entity.score).toBe(950);
    });

    it("creates an answer entity with null selectedOptionId (timeout)", () => {
      const entity = new BattleGameAnswerEntity(
        2,
        100,
        10,
        43,
        1,
        null,
        false,
        "2025-01-20T10:00:35Z",
        0
      );

      expect(entity.id).toBe(2);
      expect(entity.selectedOptionId).toBeNull();
      expect(entity.isCorrect).toBe(false);
      expect(entity.score).toBe(0);
    });
  });
});
