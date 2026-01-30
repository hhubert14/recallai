import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StreakEntity } from "./streak.entity";

describe("StreakEntity", () => {
  describe("constructor", () => {
    it("creates a streak entity with all fields", () => {
      const entity = new StreakEntity(
        1,
        "user-123",
        5,
        10,
        "2025-01-28",
        "2025-01-01T08:00:00Z",
        "2025-01-28T10:00:00Z"
      );

      expect(entity.id).toBe(1);
      expect(entity.userId).toBe("user-123");
      expect(entity.currentStreak).toBe(5);
      expect(entity.longestStreak).toBe(10);
      expect(entity.lastActivityDate).toBe("2025-01-28");
      expect(entity.createdAt).toBe("2025-01-01T08:00:00Z");
      expect(entity.updatedAt).toBe("2025-01-28T10:00:00Z");
    });

    it("creates a streak entity with null lastActivityDate", () => {
      const entity = new StreakEntity(
        2,
        "user-456",
        0,
        0,
        null,
        "2025-01-22T12:00:00Z",
        "2025-01-22T12:00:00Z"
      );

      expect(entity.id).toBe(2);
      expect(entity.userId).toBe("user-456");
      expect(entity.currentStreak).toBe(0);
      expect(entity.longestStreak).toBe(0);
      expect(entity.lastActivityDate).toBeNull();
    });
  });

  describe("hasActivityToday", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns true when lastActivityDate is today", () => {
      vi.setSystemTime(new Date("2025-01-28T14:30:00Z"));

      const entity = new StreakEntity(
        1,
        "user-123",
        5,
        10,
        "2025-01-28",
        "2025-01-01T08:00:00Z",
        "2025-01-28T10:00:00Z"
      );

      expect(entity.hasActivityToday()).toBe(true);
    });

    it("returns false when lastActivityDate is yesterday", () => {
      vi.setSystemTime(new Date("2025-01-28T14:30:00Z"));

      const entity = new StreakEntity(
        1,
        "user-123",
        5,
        10,
        "2025-01-27",
        "2025-01-01T08:00:00Z",
        "2025-01-27T10:00:00Z"
      );

      expect(entity.hasActivityToday()).toBe(false);
    });

    it("returns false when lastActivityDate is null", () => {
      vi.setSystemTime(new Date("2025-01-28T14:30:00Z"));

      const entity = new StreakEntity(
        1,
        "user-123",
        0,
        0,
        null,
        "2025-01-01T08:00:00Z",
        "2025-01-01T08:00:00Z"
      );

      expect(entity.hasActivityToday()).toBe(false);
    });
  });

  describe("isActive", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns true when lastActivityDate is today", () => {
      vi.setSystemTime(new Date("2025-01-28T14:30:00Z"));

      const entity = new StreakEntity(
        1,
        "user-123",
        5,
        10,
        "2025-01-28",
        "2025-01-01T08:00:00Z",
        "2025-01-28T10:00:00Z"
      );

      expect(entity.isActive()).toBe(true);
    });

    it("returns true when lastActivityDate is yesterday", () => {
      vi.setSystemTime(new Date("2025-01-28T14:30:00Z"));

      const entity = new StreakEntity(
        1,
        "user-123",
        5,
        10,
        "2025-01-27",
        "2025-01-01T08:00:00Z",
        "2025-01-27T10:00:00Z"
      );

      expect(entity.isActive()).toBe(true);
    });

    it("returns false when lastActivityDate is two days ago", () => {
      vi.setSystemTime(new Date("2025-01-28T14:30:00Z"));

      const entity = new StreakEntity(
        1,
        "user-123",
        5,
        10,
        "2025-01-26",
        "2025-01-01T08:00:00Z",
        "2025-01-26T10:00:00Z"
      );

      expect(entity.isActive()).toBe(false);
    });

    it("returns false when lastActivityDate is null", () => {
      vi.setSystemTime(new Date("2025-01-28T14:30:00Z"));

      const entity = new StreakEntity(
        1,
        "user-123",
        0,
        0,
        null,
        "2025-01-01T08:00:00Z",
        "2025-01-01T08:00:00Z"
      );

      expect(entity.isActive()).toBe(false);
    });

    it("returns false when lastActivityDate is far in the past", () => {
      vi.setSystemTime(new Date("2025-01-28T14:30:00Z"));

      const entity = new StreakEntity(
        1,
        "user-123",
        0,
        5,
        "2024-06-15",
        "2024-06-01T08:00:00Z",
        "2024-06-15T10:00:00Z"
      );

      expect(entity.isActive()).toBe(false);
    });
  });
});
