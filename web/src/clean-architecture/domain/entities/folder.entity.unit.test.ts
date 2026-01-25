import { describe, it, expect } from "vitest";
import { FolderEntity } from "./folder.entity";

describe("FolderEntity", () => {
  const validFolderData = {
    id: 1,
    userId: "user-123",
    name: "My Folder",
    description: "A test folder",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  };

  describe("constructor", () => {
    it("creates entity with all properties", () => {
      const folder = new FolderEntity(
        validFolderData.id,
        validFolderData.userId,
        validFolderData.name,
        validFolderData.description,
        validFolderData.createdAt,
        validFolderData.updatedAt
      );

      expect(folder.id).toBe(1);
      expect(folder.userId).toBe("user-123");
      expect(folder.name).toBe("My Folder");
      expect(folder.description).toBe("A test folder");
      expect(folder.createdAt).toBe("2026-01-15T10:00:00Z");
      expect(folder.updatedAt).toBe("2026-01-15T10:00:00Z");
    });

    it("creates entity with null description", () => {
      const folder = new FolderEntity(
        validFolderData.id,
        validFolderData.userId,
        validFolderData.name,
        null,
        validFolderData.createdAt,
        validFolderData.updatedAt
      );

      expect(folder.description).toBeNull();
    });
  });

  describe("readonly properties", () => {
    it("returns correct values via properties", () => {
      const folder = new FolderEntity(
        42,
        "user-abc",
        "Study Materials",
        "Important study materials",
        "2026-01-20T15:30:00Z",
        "2026-01-21T09:00:00Z"
      );

      expect(folder.id).toBe(42);
      expect(folder.userId).toBe("user-abc");
      expect(folder.name).toBe("Study Materials");
      expect(folder.description).toBe("Important study materials");
      expect(folder.createdAt).toBe("2026-01-20T15:30:00Z");
      expect(folder.updatedAt).toBe("2026-01-21T09:00:00Z");
    });
  });
});
