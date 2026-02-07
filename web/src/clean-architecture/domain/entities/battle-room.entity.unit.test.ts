import { describe, it, expect } from "vitest";
import {
  BattleRoomEntity,
  BattleRoomVisibility,
  BattleRoomStatus,
} from "./battle-room.entity";

describe("BattleRoomEntity", () => {
  describe("constructor", () => {
    it("creates a battle room entity with all fields", () => {
      const entity = new BattleRoomEntity(
        1,
        "550e8400-e29b-41d4-a716-446655440000",
        "user-123",
        42,
        "My Battle Room",
        "public" as BattleRoomVisibility,
        null,
        "waiting" as BattleRoomStatus,
        30,
        10,
        null,
        null,
        null,
        "2025-01-20T10:00:00Z",
        "2025-01-20T10:00:00Z"
      );

      expect(entity.id).toBe(1);
      expect(entity.publicId).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(entity.hostUserId).toBe("user-123");
      expect(entity.studySetId).toBe(42);
      expect(entity.name).toBe("My Battle Room");
      expect(entity.visibility).toBe("public");
      expect(entity.passwordHash).toBeNull();
      expect(entity.status).toBe("waiting");
      expect(entity.timeLimitSeconds).toBe(30);
      expect(entity.questionCount).toBe(10);
      expect(entity.currentQuestionIndex).toBeNull();
      expect(entity.currentQuestionStartedAt).toBeNull();
      expect(entity.questionIds).toBeNull();
      expect(entity.createdAt).toBe("2025-01-20T10:00:00Z");
      expect(entity.updatedAt).toBe("2025-01-20T10:00:00Z");
    });

    it("creates a private battle room with password and game state", () => {
      const entity = new BattleRoomEntity(
        2,
        "660e8400-e29b-41d4-a716-446655440001",
        "user-456",
        99,
        "Private Room",
        "private" as BattleRoomVisibility,
        "hashed_password_123",
        "in_game" as BattleRoomStatus,
        20,
        5,
        2,
        "2025-01-20T10:05:00Z",
        [101, 102, 103, 104, 105],
        "2025-01-20T10:00:00Z",
        "2025-01-20T10:05:00Z"
      );

      expect(entity.id).toBe(2);
      expect(entity.visibility).toBe("private");
      expect(entity.passwordHash).toBe("hashed_password_123");
      expect(entity.status).toBe("in_game");
      expect(entity.currentQuestionIndex).toBe(2);
      expect(entity.currentQuestionStartedAt).toBe("2025-01-20T10:05:00Z");
      expect(entity.questionIds).toEqual([101, 102, 103, 104, 105]);
    });
  });

  describe("isWaiting", () => {
    it("returns true when status is waiting", () => {
      const entity = new BattleRoomEntity(
        1,
        "id",
        "user-123",
        1,
        "Room",
        "public",
        null,
        "waiting",
        30,
        10,
        null,
        null,
        null,
        "2025-01-20T10:00:00Z",
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isWaiting()).toBe(true);
    });

    it("returns false when status is not waiting", () => {
      const entity = new BattleRoomEntity(
        1,
        "id",
        "user-123",
        1,
        "Room",
        "public",
        null,
        "in_game",
        30,
        10,
        null,
        null,
        null,
        "2025-01-20T10:00:00Z",
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isWaiting()).toBe(false);
    });
  });

  describe("isInGame", () => {
    it("returns true when status is in_game", () => {
      const entity = new BattleRoomEntity(
        1,
        "id",
        "user-123",
        1,
        "Room",
        "public",
        null,
        "in_game",
        30,
        10,
        0,
        "2025-01-20T10:00:00Z",
        [1, 2, 3],
        "2025-01-20T10:00:00Z",
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isInGame()).toBe(true);
    });

    it("returns false when status is not in_game", () => {
      const entity = new BattleRoomEntity(
        1,
        "id",
        "user-123",
        1,
        "Room",
        "public",
        null,
        "finished",
        30,
        10,
        null,
        null,
        null,
        "2025-01-20T10:00:00Z",
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isInGame()).toBe(false);
    });
  });

  describe("isFinished", () => {
    it("returns true when status is finished", () => {
      const entity = new BattleRoomEntity(
        1,
        "id",
        "user-123",
        1,
        "Room",
        "public",
        null,
        "finished",
        30,
        10,
        null,
        null,
        null,
        "2025-01-20T10:00:00Z",
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isFinished()).toBe(true);
    });

    it("returns false when status is not finished", () => {
      const entity = new BattleRoomEntity(
        1,
        "id",
        "user-123",
        1,
        "Room",
        "public",
        null,
        "waiting",
        30,
        10,
        null,
        null,
        null,
        "2025-01-20T10:00:00Z",
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isFinished()).toBe(false);
    });
  });

  describe("isHost", () => {
    it("returns true when userId matches hostUserId", () => {
      const entity = new BattleRoomEntity(
        1,
        "id",
        "user-123",
        1,
        "Room",
        "public",
        null,
        "waiting",
        30,
        10,
        null,
        null,
        null,
        "2025-01-20T10:00:00Z",
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isHost("user-123")).toBe(true);
    });

    it("returns false when userId does not match hostUserId", () => {
      const entity = new BattleRoomEntity(
        1,
        "id",
        "user-123",
        1,
        "Room",
        "public",
        null,
        "waiting",
        30,
        10,
        null,
        null,
        null,
        "2025-01-20T10:00:00Z",
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isHost("user-456")).toBe(false);
    });
  });
});
