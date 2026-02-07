import { describe, it, expect } from "vitest";
import {
  BattleRoomSlotEntity,
  BattleRoomSlotType,
} from "./battle-room-slot.entity";

describe("BattleRoomSlotEntity", () => {
  describe("constructor", () => {
    it("creates a player slot with all fields", () => {
      const entity = new BattleRoomSlotEntity(
        1,
        100,
        0,
        "player" as BattleRoomSlotType,
        "user-123",
        null,
        "2025-01-20T10:00:00Z"
      );

      expect(entity.id).toBe(1);
      expect(entity.roomId).toBe(100);
      expect(entity.slotIndex).toBe(0);
      expect(entity.slotType).toBe("player");
      expect(entity.userId).toBe("user-123");
      expect(entity.botName).toBeNull();
      expect(entity.createdAt).toBe("2025-01-20T10:00:00Z");
    });

    it("creates a bot slot with botName", () => {
      const entity = new BattleRoomSlotEntity(
        2,
        100,
        1,
        "bot" as BattleRoomSlotType,
        null,
        "QuizBot",
        "2025-01-20T10:00:00Z"
      );

      expect(entity.id).toBe(2);
      expect(entity.slotType).toBe("bot");
      expect(entity.userId).toBeNull();
      expect(entity.botName).toBe("QuizBot");
    });

    it("creates an empty slot with null optional fields", () => {
      const entity = new BattleRoomSlotEntity(
        3,
        100,
        2,
        "empty" as BattleRoomSlotType,
        null,
        null,
        "2025-01-20T10:00:00Z"
      );

      expect(entity.slotType).toBe("empty");
      expect(entity.userId).toBeNull();
      expect(entity.botName).toBeNull();
    });
  });

  describe("isEmpty", () => {
    it("returns true when slotType is empty", () => {
      const entity = new BattleRoomSlotEntity(
        1, 100, 0, "empty", null, null, "2025-01-20T10:00:00Z"
      );
      expect(entity.isEmpty()).toBe(true);
    });

    it("returns false when slotType is not empty", () => {
      const entity = new BattleRoomSlotEntity(
        1, 100, 0, "player", "user-123", null, "2025-01-20T10:00:00Z"
      );
      expect(entity.isEmpty()).toBe(false);
    });
  });

  describe("isPlayer", () => {
    it("returns true when slotType is player", () => {
      const entity = new BattleRoomSlotEntity(
        1, 100, 0, "player", "user-123", null, "2025-01-20T10:00:00Z"
      );
      expect(entity.isPlayer()).toBe(true);
    });

    it("returns false when slotType is not player", () => {
      const entity = new BattleRoomSlotEntity(
        1, 100, 0, "bot", null, "BotName", "2025-01-20T10:00:00Z"
      );
      expect(entity.isPlayer()).toBe(false);
    });
  });

  describe("isBot", () => {
    it("returns true when slotType is bot", () => {
      const entity = new BattleRoomSlotEntity(
        1, 100, 0, "bot", null, "QuizBot", "2025-01-20T10:00:00Z"
      );
      expect(entity.isBot()).toBe(true);
    });

    it("returns false when slotType is not bot", () => {
      const entity = new BattleRoomSlotEntity(
        1, 100, 0, "empty", null, null, "2025-01-20T10:00:00Z"
      );
      expect(entity.isBot()).toBe(false);
    });
  });

  describe("isLocked", () => {
    it("returns true when slotType is locked", () => {
      const entity = new BattleRoomSlotEntity(
        1, 100, 0, "locked", null, null, "2025-01-20T10:00:00Z"
      );
      expect(entity.isLocked()).toBe(true);
    });

    it("returns false when slotType is not locked", () => {
      const entity = new BattleRoomSlotEntity(
        1, 100, 0, "player", "user-123", null, "2025-01-20T10:00:00Z"
      );
      expect(entity.isLocked()).toBe(false);
    });
  });
});
