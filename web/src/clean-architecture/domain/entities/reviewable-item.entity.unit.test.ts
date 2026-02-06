import { describe, it, expect } from "vitest";
import {
  ReviewableItemEntity,
  ReviewableItemType,
} from "./reviewable-item.entity";

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
        50,
        "2025-01-20T10:00:00Z"
      );

      expect(entity.id).toBe(1);
      expect(entity.userId).toBe("user-123");
      expect(entity.itemType).toBe("question");
      expect(entity.questionId).toBe(42);
      expect(entity.flashcardId).toBeNull();
      expect(entity.videoId).toBe(100);
      expect(entity.studySetId).toBe(50);
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
        60,
        "2025-01-21T14:30:00Z"
      );

      expect(entity.id).toBe(2);
      expect(entity.userId).toBe("user-456");
      expect(entity.itemType).toBe("flashcard");
      expect(entity.questionId).toBeNull();
      expect(entity.flashcardId).toBe(99);
      expect(entity.videoId).toBe(200);
      expect(entity.studySetId).toBe(60);
      expect(entity.createdAt).toBe("2025-01-21T14:30:00Z");
    });

    it("creates a reviewable item with nullable videoId for manual study sets", () => {
      const entity = new ReviewableItemEntity(
        3,
        "user-789",
        "flashcard" as ReviewableItemType,
        null,
        101,
        null, // videoId can be null for manual study sets
        70, // studySetId is always required
        "2025-01-22T09:00:00Z"
      );

      expect(entity.videoId).toBeNull();
      expect(entity.studySetId).toBe(70);
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
        50,
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
        50,
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
        50,
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
        50,
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isFlashcard()).toBe(false);
    });
  });
});
