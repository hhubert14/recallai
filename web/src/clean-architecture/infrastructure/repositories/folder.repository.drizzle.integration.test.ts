import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { users, studySets } from "@/drizzle/schema";
import { DrizzleFolderRepository } from "./folder.repository.drizzle";
import {
  createTestContext,
  IntegrationTestContext,
} from "@/test-utils/integration-test-context";

/**
 * Integration tests for DrizzleFolderRepository
 *
 * Requires test database to be running:
 *   npm run db:migrate:test
 *
 * Run with:
 *   npm run test:integration
 */

describe("DrizzleFolderRepository (integration)", () => {
  const TEST_DATABASE_URL = process.env.DATABASE_URL;

  if (!TEST_DATABASE_URL?.includes("testdb")) {
    it("fails when test database is not configured", () => {
      throw new Error(
        "Integration tests require DATABASE_URL pointing to testdb. " +
          "Ensure .env.test.local is configured and run: npm run test:integration"
      );
    });
    return;
  }

  let ctx: IntegrationTestContext;
  let repository: DrizzleFolderRepository;

  // Test data IDs
  let testUserId: string;
  let testStudySetId: number;
  let testStudySetId2: number;

  beforeEach(async () => {
    ctx = await createTestContext();
    repository = new DrizzleFolderRepository(ctx.db);

    // Create test user (must insert into auth.users first due to FK constraint)
    testUserId = crypto.randomUUID();
    await ctx.sql`INSERT INTO auth.users (id, email) VALUES (${testUserId}, 'test@example.com')`;
    await ctx.db.insert(users).values({
      id: testUserId,
      email: "test@example.com",
    });

    // Create test study sets
    const [studySet1] = await ctx.db
      .insert(studySets)
      .values({
        userId: testUserId,
        name: "Test Study Set 1",
        description: "A test study set",
        sourceType: "manual",
        videoId: null,
      })
      .returning();
    testStudySetId = studySet1.id;

    const [studySet2] = await ctx.db
      .insert(studySets)
      .values({
        userId: testUserId,
        name: "Test Study Set 2",
        description: "Another test study set",
        sourceType: "manual",
        videoId: null,
      })
      .returning();
    testStudySetId2 = studySet2.id;
  });

  afterEach(async () => {
    await ctx.cleanup();
  });

  describe("createFolder", () => {
    it("creates a folder with name and description", async () => {
      const result = await repository.createFolder(
        testUserId,
        "My Folder",
        "A test folder description"
      );

      expect(result.id).toBeDefined();
      expect(result.userId).toBe(testUserId);
      expect(result.name).toBe("My Folder");
      expect(result.description).toBe("A test folder description");
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it("creates a folder with null description", async () => {
      const result = await repository.createFolder(testUserId, "No Description", null);

      expect(result.name).toBe("No Description");
      expect(result.description).toBeNull();
    });

    it("creates a folder with undefined description (defaults to null)", async () => {
      const result = await repository.createFolder(testUserId, "No Description");

      expect(result.name).toBe("No Description");
      expect(result.description).toBeNull();
    });
  });

  describe("findFolderById", () => {
    it("finds a folder by its ID", async () => {
      const created = await repository.createFolder(
        testUserId,
        "Test Folder",
        "Test description"
      );

      const result = await repository.findFolderById(created.id);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(created.id);
      expect(result!.name).toBe("Test Folder");
      expect(result!.description).toBe("Test description");
    });

    it("returns null for non-existent ID", async () => {
      const result = await repository.findFolderById(99999);
      expect(result).toBeNull();
    });
  });

  describe("findFoldersByUserId", () => {
    it("finds all folders for a user", async () => {
      await repository.createFolder(testUserId, "Folder 1", null);
      await repository.createFolder(testUserId, "Folder 2", null);
      await repository.createFolder(testUserId, "Folder 3", null);

      const result = await repository.findFoldersByUserId(testUserId);

      expect(result).toHaveLength(3);
      expect(result.every((f) => f.userId === testUserId)).toBe(true);
    });

    it("returns empty array for user with no folders", async () => {
      const result = await repository.findFoldersByUserId(testUserId);
      expect(result).toHaveLength(0);
    });

    it("returns folders ordered by creation date descending", async () => {
      await repository.createFolder(testUserId, "First", null);
      await repository.createFolder(testUserId, "Second", null);

      const result = await repository.findFoldersByUserId(testUserId);

      // Newer folders should come first (higher ID = newer)
      expect(result[0].name).toBe("Second");
      expect(result[1].name).toBe("First");
    });

    it("does not return folders from other users", async () => {
      // Create another user
      const otherUserId = crypto.randomUUID();
      await ctx.sql`INSERT INTO auth.users (id, email) VALUES (${otherUserId}, 'other@example.com')`;
      await ctx.db.insert(users).values({
        id: otherUserId,
        email: "other@example.com",
      });

      // Create folders for both users
      await repository.createFolder(testUserId, "My Folder", null);
      await repository.createFolder(otherUserId, "Other Folder", null);

      const result = await repository.findFoldersByUserId(testUserId);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("My Folder");
    });
  });

  describe("updateFolder", () => {
    it("updates name and description", async () => {
      const created = await repository.createFolder(
        testUserId,
        "Original Name",
        "Original description"
      );

      const result = await repository.updateFolder(created.id, {
        name: "Updated Name",
        description: "Updated description",
      });

      expect(result).not.toBeNull();
      expect(result!.name).toBe("Updated Name");
      expect(result!.description).toBe("Updated description");
    });

    it("updates only name when description not provided", async () => {
      const created = await repository.createFolder(
        testUserId,
        "Original Name",
        "Original description"
      );

      const result = await repository.updateFolder(created.id, {
        name: "Updated Name",
      });

      expect(result).not.toBeNull();
      expect(result!.name).toBe("Updated Name");
      expect(result!.description).toBe("Original description");
    });

    it("sets description to null when explicitly provided", async () => {
      const created = await repository.createFolder(
        testUserId,
        "Original Name",
        "Original description"
      );

      const result = await repository.updateFolder(created.id, {
        description: null,
      });

      expect(result).not.toBeNull();
      expect(result!.description).toBeNull();
    });

    it("returns the existing folder when no updates provided", async () => {
      const created = await repository.createFolder(
        testUserId,
        "Original Name",
        "Original description"
      );

      const result = await repository.updateFolder(created.id, {});

      expect(result).not.toBeNull();
      expect(result!.name).toBe("Original Name");
      expect(result!.description).toBe("Original description");
    });

    it("returns null for non-existent ID", async () => {
      const result = await repository.updateFolder(99999, {
        name: "New Name",
      });
      expect(result).toBeNull();
    });

    it("updates the updatedAt timestamp", async () => {
      const created = await repository.createFolder(testUserId, "Test", null);

      const result = await repository.updateFolder(created.id, {
        name: "Updated",
      });

      // Verify updatedAt is a valid date
      expect(result!.updatedAt).toBeDefined();
      expect(new Date(result!.updatedAt).getTime()).toBeGreaterThan(0);
    });
  });

  describe("deleteFolder", () => {
    it("deletes a folder", async () => {
      const created = await repository.createFolder(testUserId, "To Delete", null);

      await repository.deleteFolder(created.id);

      const result = await repository.findFolderById(created.id);
      expect(result).toBeNull();
    });

    it("does not throw for non-existent ID", async () => {
      await expect(repository.deleteFolder(99999)).resolves.not.toThrow();
    });

    it("cascades to folder_study_sets but not study sets", async () => {
      // Create folder and add study set to it
      const folder = await repository.createFolder(testUserId, "Test Folder", null);
      await repository.addStudySetToFolder(folder.id, testStudySetId);

      // Verify study set is in folder
      const studySetIds = await repository.findStudySetIdsByFolderId(folder.id);
      expect(studySetIds).toContain(testStudySetId);

      // Delete the folder
      await repository.deleteFolder(folder.id);

      // Verify folder is deleted
      const folderResult = await repository.findFolderById(folder.id);
      expect(folderResult).toBeNull();

      // Verify study set still exists (just query the study_sets table)
      const [studySetStillExists] = await ctx.db
        .select()
        .from(studySets)
        .where(eq(studySets.id, testStudySetId));
      expect(studySetStillExists).toBeDefined();
    });
  });

  describe("addStudySetToFolder", () => {
    it("adds a study set to a folder", async () => {
      const folder = await repository.createFolder(testUserId, "Test Folder", null);

      await repository.addStudySetToFolder(folder.id, testStudySetId);

      const studySetIds = await repository.findStudySetIdsByFolderId(folder.id);
      expect(studySetIds).toContain(testStudySetId);
    });

    it("allows adding multiple study sets to one folder", async () => {
      const folder = await repository.createFolder(testUserId, "Test Folder", null);

      await repository.addStudySetToFolder(folder.id, testStudySetId);
      await repository.addStudySetToFolder(folder.id, testStudySetId2);

      const studySetIds = await repository.findStudySetIdsByFolderId(folder.id);
      expect(studySetIds).toHaveLength(2);
      expect(studySetIds).toContain(testStudySetId);
      expect(studySetIds).toContain(testStudySetId2);
    });

    it("allows adding same study set to multiple folders", async () => {
      const folder1 = await repository.createFolder(testUserId, "Folder 1", null);
      const folder2 = await repository.createFolder(testUserId, "Folder 2", null);

      await repository.addStudySetToFolder(folder1.id, testStudySetId);
      await repository.addStudySetToFolder(folder2.id, testStudySetId);

      const folderIds = await repository.findFolderIdsByStudySetId(testStudySetId);
      expect(folderIds).toHaveLength(2);
      expect(folderIds).toContain(folder1.id);
      expect(folderIds).toContain(folder2.id);
    });

    it("throws when adding duplicate study set to same folder", async () => {
      const folder = await repository.createFolder(testUserId, "Test Folder", null);

      await repository.addStudySetToFolder(folder.id, testStudySetId);

      await expect(
        repository.addStudySetToFolder(folder.id, testStudySetId)
      ).rejects.toThrow();
    });
  });

  describe("removeStudySetFromFolder", () => {
    it("removes a study set from a folder", async () => {
      const folder = await repository.createFolder(testUserId, "Test Folder", null);
      await repository.addStudySetToFolder(folder.id, testStudySetId);

      await repository.removeStudySetFromFolder(folder.id, testStudySetId);

      const studySetIds = await repository.findStudySetIdsByFolderId(folder.id);
      expect(studySetIds).not.toContain(testStudySetId);
    });

    it("does not throw when removing non-existent association", async () => {
      const folder = await repository.createFolder(testUserId, "Test Folder", null);

      await expect(
        repository.removeStudySetFromFolder(folder.id, testStudySetId)
      ).resolves.not.toThrow();
    });

    it("does not remove study set from other folders", async () => {
      const folder1 = await repository.createFolder(testUserId, "Folder 1", null);
      const folder2 = await repository.createFolder(testUserId, "Folder 2", null);
      await repository.addStudySetToFolder(folder1.id, testStudySetId);
      await repository.addStudySetToFolder(folder2.id, testStudySetId);

      await repository.removeStudySetFromFolder(folder1.id, testStudySetId);

      const folder1StudySets = await repository.findStudySetIdsByFolderId(folder1.id);
      const folder2StudySets = await repository.findStudySetIdsByFolderId(folder2.id);
      expect(folder1StudySets).not.toContain(testStudySetId);
      expect(folder2StudySets).toContain(testStudySetId);
    });
  });

  describe("findStudySetIdsByFolderId", () => {
    it("returns all study set IDs in a folder", async () => {
      const folder = await repository.createFolder(testUserId, "Test Folder", null);
      await repository.addStudySetToFolder(folder.id, testStudySetId);
      await repository.addStudySetToFolder(folder.id, testStudySetId2);

      const result = await repository.findStudySetIdsByFolderId(folder.id);

      expect(result).toHaveLength(2);
      expect(result).toContain(testStudySetId);
      expect(result).toContain(testStudySetId2);
    });

    it("returns empty array for folder with no study sets", async () => {
      const folder = await repository.createFolder(testUserId, "Empty Folder", null);

      const result = await repository.findStudySetIdsByFolderId(folder.id);

      expect(result).toHaveLength(0);
    });

    it("returns empty array for non-existent folder", async () => {
      const result = await repository.findStudySetIdsByFolderId(99999);
      expect(result).toHaveLength(0);
    });
  });

  describe("findFolderIdsByStudySetId", () => {
    it("returns all folder IDs containing a study set", async () => {
      const folder1 = await repository.createFolder(testUserId, "Folder 1", null);
      const folder2 = await repository.createFolder(testUserId, "Folder 2", null);
      await repository.addStudySetToFolder(folder1.id, testStudySetId);
      await repository.addStudySetToFolder(folder2.id, testStudySetId);

      const result = await repository.findFolderIdsByStudySetId(testStudySetId);

      expect(result).toHaveLength(2);
      expect(result).toContain(folder1.id);
      expect(result).toContain(folder2.id);
    });

    it("returns empty array for study set not in any folder", async () => {
      const result = await repository.findFolderIdsByStudySetId(testStudySetId);
      expect(result).toHaveLength(0);
    });

    it("returns empty array for non-existent study set", async () => {
      const result = await repository.findFolderIdsByStudySetId(99999);
      expect(result).toHaveLength(0);
    });
  });
});
