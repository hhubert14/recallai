import { describe, it, expect } from "vitest";
import { ReviewableItemEntity, ReviewableItemType } from "./reviewable-item.entity";

describe("ReviewableItemEntity", () => {
  describe("constructor", () => {
    it("creates a question reviewable item with all fields", () => {
      const entity = new ReviewableItemEntity(
        1,
        "user-123",
        "question" as ReviewableItemType,
        42,
        null,
        100,
        "2025-01-20T10:00:00Z"
      );

      expect(entity.id).toBe(1);
      expect(entity.userId).toBe("user-123");
      expect(entity.itemType).toBe("question");
      expect(entity.questionId).toBe(42);
      expect(entity.flashcardId).toBeNull();
      expect(entity.videoId).toBe(100);
      expect(entity.createdAt).toBe("2025-01-20T10:00:00Z");
    });

    it("creates a flashcard reviewable item with all fields", () => {
      const entity = new ReviewableItemEntity(
        2,
        "user-456",
        "flashcard" as ReviewableItemType,
        null,
        99,
        200,
        "2025-01-21T14:30:00Z"
      );

      expect(entity.id).toBe(2);
      expect(entity.userId).toBe("user-456");
      expect(entity.itemType).toBe("flashcard");
      expect(entity.questionId).toBeNull();
      expect(entity.flashcardId).toBe(99);
      expect(entity.videoId).toBe(200);
      expect(entity.createdAt).toBe("2025-01-21T14:30:00Z");
    });
  });

  describe("isQuestion", () => {
    it("returns true for question type", () => {
      const entity = new ReviewableItemEntity(
        1,
        "user-123",
        "question" as ReviewableItemType,
        42,
        null,
        100,
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isQuestion()).toBe(true);
    });

    it("returns false for flashcard type", () => {
      const entity = new ReviewableItemEntity(
        1,
        "user-123",
        "flashcard" as ReviewableItemType,
        null,
        42,
        100,
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isQuestion()).toBe(false);
    });
  });

  describe("isFlashcard", () => {
    it("returns true for flashcard type", () => {
      const entity = new ReviewableItemEntity(
        1,
        "user-123",
        "flashcard" as ReviewableItemType,
        null,
        42,
        100,
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isFlashcard()).toBe(true);
    });

    it("returns false for question type", () => {
      const entity = new ReviewableItemEntity(
        1,
        "user-123",
        "question" as ReviewableItemType,
        42,
        null,
        100,
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isFlashcard()).toBe(false);
    });
  });
});
