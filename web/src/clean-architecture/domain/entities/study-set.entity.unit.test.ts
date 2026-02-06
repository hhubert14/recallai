import { describe, it, expect } from "vitest";
import { StudySetEntity, StudySetSourceType } from "./study-set.entity";

describe("StudySetEntity", () => {
  describe("constructor", () => {
    it("creates a video-sourced study set with all fields", () => {
      const entity = new StudySetEntity(
        1,
        "550e8400-e29b-41d4-a716-446655440000",
        "user-123",
        "Introduction to TypeScript",
        "A comprehensive guide to TypeScript basics",
        "video" as StudySetSourceType,
        42,
        "2025-01-20T10:00:00Z",
        "2025-01-20T10:00:00Z"
      );

      expect(entity.id).toBe(1);
      expect(entity.publicId).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(entity.userId).toBe("user-123");
      expect(entity.name).toBe("Introduction to TypeScript");
      expect(entity.description).toBe(
        "A comprehensive guide to TypeScript basics"
      );
      expect(entity.sourceType).toBe("video");
      expect(entity.videoId).toBe(42);
      expect(entity.createdAt).toBe("2025-01-20T10:00:00Z");
      expect(entity.updatedAt).toBe("2025-01-20T10:00:00Z");
    });

    it("creates a manual study set without video", () => {
      const entity = new StudySetEntity(
        2,
        "660e8400-e29b-41d4-a716-446655440001",
        "user-456",
        "My Custom Flashcards",
        null,
        "manual" as StudySetSourceType,
        null,
        "2025-01-21T14:30:00Z",
        "2025-01-21T14:30:00Z"
      );

      expect(entity.id).toBe(2);
      expect(entity.publicId).toBe("660e8400-e29b-41d4-a716-446655440001");
      expect(entity.userId).toBe("user-456");
      expect(entity.name).toBe("My Custom Flashcards");
      expect(entity.description).toBeNull();
      expect(entity.sourceType).toBe("manual");
      expect(entity.videoId).toBeNull();
      expect(entity.createdAt).toBe("2025-01-21T14:30:00Z");
      expect(entity.updatedAt).toBe("2025-01-21T14:30:00Z");
    });

    it("creates a pdf-sourced study set", () => {
      const entity = new StudySetEntity(
        3,
        "770e8400-e29b-41d4-a716-446655440002",
        "user-789",
        "Biology Notes",
        "Notes from biology textbook",
        "pdf" as StudySetSourceType,
        null,
        "2025-01-22T09:00:00Z",
        "2025-01-22T09:00:00Z"
      );

      expect(entity.sourceType).toBe("pdf");
      expect(entity.videoId).toBeNull();
    });
  });

  describe("isVideoSourced", () => {
    it("returns true for video-sourced study sets", () => {
      const entity = new StudySetEntity(
        1,
        "550e8400-e29b-41d4-a716-446655440000",
        "user-123",
        "Video Study Set",
        null,
        "video" as StudySetSourceType,
        42,
        "2025-01-20T10:00:00Z",
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isVideoSourced()).toBe(true);
    });

    it("returns false for manual study sets", () => {
      const entity = new StudySetEntity(
        1,
        "550e8400-e29b-41d4-a716-446655440000",
        "user-123",
        "Manual Study Set",
        null,
        "manual" as StudySetSourceType,
        null,
        "2025-01-20T10:00:00Z",
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isVideoSourced()).toBe(false);
    });

    it("returns false for pdf study sets", () => {
      const entity = new StudySetEntity(
        1,
        "550e8400-e29b-41d4-a716-446655440000",
        "user-123",
        "PDF Study Set",
        null,
        "pdf" as StudySetSourceType,
        null,
        "2025-01-20T10:00:00Z",
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isVideoSourced()).toBe(false);
    });
  });

  describe("isManual", () => {
    it("returns true for manual study sets", () => {
      const entity = new StudySetEntity(
        1,
        "550e8400-e29b-41d4-a716-446655440000",
        "user-123",
        "Manual Study Set",
        null,
        "manual" as StudySetSourceType,
        null,
        "2025-01-20T10:00:00Z",
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isManual()).toBe(true);
    });

    it("returns false for video study sets", () => {
      const entity = new StudySetEntity(
        1,
        "550e8400-e29b-41d4-a716-446655440000",
        "user-123",
        "Video Study Set",
        null,
        "video" as StudySetSourceType,
        42,
        "2025-01-20T10:00:00Z",
        "2025-01-20T10:00:00Z"
      );

      expect(entity.isManual()).toBe(false);
    });
  });
});
