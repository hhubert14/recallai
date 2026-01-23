import { describe, it, expect } from "vitest";
import { ReviewProgressEntity } from "./review-progress.entity";

describe("ReviewProgressEntity", () => {
  describe("constructor", () => {
    it("creates a review progress entity with all fields", () => {
      const entity = new ReviewProgressEntity(
        1,
        "user-123",
        42,
        3,
        "2025-01-25",
        5,
        2,
        "2025-01-20T10:00:00Z",
        "2025-01-15T08:00:00Z"
      );

      expect(entity.id).toBe(1);
      expect(entity.userId).toBe("user-123");
      expect(entity.reviewableItemId).toBe(42);
      expect(entity.boxLevel).toBe(3);
      expect(entity.nextReviewDate).toBe("2025-01-25");
      expect(entity.timesCorrect).toBe(5);
      expect(entity.timesIncorrect).toBe(2);
      expect(entity.lastReviewedAt).toBe("2025-01-20T10:00:00Z");
      expect(entity.createdAt).toBe("2025-01-15T08:00:00Z");
    });

    it("creates a review progress entity with null optional fields", () => {
      const entity = new ReviewProgressEntity(
        2,
        "user-456",
        99,
        1,
        null,
        0,
        0,
        null,
        "2025-01-22T12:00:00Z"
      );

      expect(entity.id).toBe(2);
      expect(entity.userId).toBe("user-456");
      expect(entity.reviewableItemId).toBe(99);
      expect(entity.boxLevel).toBe(1);
      expect(entity.nextReviewDate).toBeNull();
      expect(entity.timesCorrect).toBe(0);
      expect(entity.timesIncorrect).toBe(0);
      expect(entity.lastReviewedAt).toBeNull();
      expect(entity.createdAt).toBe("2025-01-22T12:00:00Z");
    });
  });

  describe("isDue", () => {
    it("returns true when nextReviewDate is in the past", () => {
      const pastDate = "2020-01-01";
      const entity = new ReviewProgressEntity(
        1,
        "user-123",
        42,
        3,
        pastDate,
        5,
        2,
        "2025-01-20T10:00:00Z",
        "2025-01-15T08:00:00Z"
      );

      expect(entity.isDue()).toBe(true);
    });

    it("returns true when nextReviewDate is today", () => {
      const today = new Date().toISOString().split("T")[0];
      const entity = new ReviewProgressEntity(
        1,
        "user-123",
        42,
        3,
        today,
        5,
        2,
        "2025-01-20T10:00:00Z",
        "2025-01-15T08:00:00Z"
      );

      expect(entity.isDue()).toBe(true);
    });

    it("returns false when nextReviewDate is in the future", () => {
      const futureDate = "2099-12-31";
      const entity = new ReviewProgressEntity(
        1,
        "user-123",
        42,
        3,
        futureDate,
        5,
        2,
        "2025-01-20T10:00:00Z",
        "2025-01-15T08:00:00Z"
      );

      expect(entity.isDue()).toBe(false);
    });

    it("returns false when nextReviewDate is null", () => {
      const entity = new ReviewProgressEntity(
        1,
        "user-123",
        42,
        3,
        null,
        5,
        2,
        "2025-01-20T10:00:00Z",
        "2025-01-15T08:00:00Z"
      );

      expect(entity.isDue()).toBe(false);
    });
  });

  describe("isNew", () => {
    it("returns true when lastReviewedAt is null (never reviewed)", () => {
      const entity = new ReviewProgressEntity(
        1,
        "user-123",
        42,
        1,
        null,
        0,
        0,
        null,
        "2025-01-15T08:00:00Z"
      );

      expect(entity.isNew()).toBe(true);
    });

    it("returns false when lastReviewedAt has a value", () => {
      const entity = new ReviewProgressEntity(
        1,
        "user-123",
        42,
        3,
        "2025-01-25",
        5,
        2,
        "2025-01-20T10:00:00Z",
        "2025-01-15T08:00:00Z"
      );

      expect(entity.isNew()).toBe(false);
    });
  });

  describe("totalAttempts", () => {
    it("returns sum of correct and incorrect attempts", () => {
      const entity = new ReviewProgressEntity(
        1,
        "user-123",
        42,
        3,
        "2025-01-25",
        5,
        2,
        "2025-01-20T10:00:00Z",
        "2025-01-15T08:00:00Z"
      );

      expect(entity.totalAttempts()).toBe(7);
    });

    it("returns 0 when no attempts", () => {
      const entity = new ReviewProgressEntity(
        1,
        "user-123",
        42,
        1,
        null,
        0,
        0,
        null,
        "2025-01-15T08:00:00Z"
      );

      expect(entity.totalAttempts()).toBe(0);
    });
  });

  describe("accuracy", () => {
    it("returns correct percentage", () => {
      const entity = new ReviewProgressEntity(
        1,
        "user-123",
        42,
        3,
        "2025-01-25",
        7,
        3,
        "2025-01-20T10:00:00Z",
        "2025-01-15T08:00:00Z"
      );

      expect(entity.accuracy()).toBe(70);
    });

    it("returns 0 when no attempts", () => {
      const entity = new ReviewProgressEntity(
        1,
        "user-123",
        42,
        1,
        null,
        0,
        0,
        null,
        "2025-01-15T08:00:00Z"
      );

      expect(entity.accuracy()).toBe(0);
    });

    it("returns 100 when all correct", () => {
      const entity = new ReviewProgressEntity(
        1,
        "user-123",
        42,
        5,
        "2025-01-25",
        10,
        0,
        "2025-01-20T10:00:00Z",
        "2025-01-15T08:00:00Z"
      );

      expect(entity.accuracy()).toBe(100);
    });
  });
});
