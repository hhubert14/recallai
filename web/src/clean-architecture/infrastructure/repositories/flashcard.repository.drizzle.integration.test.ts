import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { users, videos, flashcards } from "@/drizzle/schema";
import { DrizzleFlashcardRepository } from "./flashcard.repository.drizzle";
import {
  createTestContext,
  IntegrationTestContext,
} from "@/test-utils/integration-test-context";

/**
 * Integration tests for DrizzleFlashcardRepository
 *
 * Requires test database to be running:
 *   npm run db:migrate:test
 *
 * Run with:
 *   npm run test:integration
 */

describe("DrizzleFlashcardRepository (integration)", () => {
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
  let repository: DrizzleFlashcardRepository;

  // Test data IDs
  let testUserId: string;
  let testVideoId: number;

  beforeEach(async () => {
    ctx = await createTestContext();
    repository = new DrizzleFlashcardRepository(ctx.db);

    // Create test user (must insert into auth.users first due to FK constraint)
    testUserId = crypto.randomUUID();
    await ctx.sql`INSERT INTO auth.users (id, email) VALUES (${testUserId}, 'test@example.com')`;
    await ctx.db.insert(users).values({
      id: testUserId,
      email: "test@example.com",
    });

    // Create test video
    const [video] = await ctx.db
      .insert(videos)
      .values({
        userId: testUserId,
        title: "Test Video",
        channelName: "Test Channel",
        url: "https://youtube.com/watch?v=test123",
      })
      .returning();
    testVideoId = video.id;
  });

  afterEach(async () => {
    await ctx.cleanup();
  });

  describe("createFlashcards", () => {
    it("creates flashcards and returns entities", async () => {
      const flashcardsData = [
        { videoId: testVideoId, userId: testUserId, front: "Front 1", back: "Back 1" },
        { videoId: testVideoId, userId: testUserId, front: "Front 2", back: "Back 2" },
      ];

      const result = await repository.createFlashcards(flashcardsData);

      expect(result).toHaveLength(2);
      expect(result[0].front).toBe("Front 1");
      expect(result[0].back).toBe("Back 1");
      expect(result[0].videoId).toBe(testVideoId);
      expect(result[0].userId).toBe(testUserId);
      expect(result[1].front).toBe("Front 2");
    });

    it("returns empty array for empty input", async () => {
      const result = await repository.createFlashcards([]);
      expect(result).toHaveLength(0);
    });
  });

  describe("findFlashcardsByIds", () => {
    it("finds multiple flashcards by their IDs", async () => {
      // Create test flashcards
      const created = await repository.createFlashcards([
        { videoId: testVideoId, userId: testUserId, front: "Front 1", back: "Back 1" },
        { videoId: testVideoId, userId: testUserId, front: "Front 2", back: "Back 2" },
        { videoId: testVideoId, userId: testUserId, front: "Front 3", back: "Back 3" },
      ]);

      // Find only the first two
      const idsToFind = [created[0].id, created[1].id];
      const result = await repository.findFlashcardsByIds(idsToFind);

      expect(result).toHaveLength(2);
      const foundIds = result.map((f) => f.id);
      expect(foundIds).toContain(created[0].id);
      expect(foundIds).toContain(created[1].id);
      expect(foundIds).not.toContain(created[2].id);
    });

    it("returns empty array for empty input", async () => {
      const result = await repository.findFlashcardsByIds([]);
      expect(result).toHaveLength(0);
    });

    it("returns empty array when no flashcards match the IDs", async () => {
      const result = await repository.findFlashcardsByIds([99999, 99998]);
      expect(result).toHaveLength(0);
    });

    it("returns only existing flashcards when some IDs do not exist", async () => {
      const created = await repository.createFlashcards([
        { videoId: testVideoId, userId: testUserId, front: "Front 1", back: "Back 1" },
      ]);

      const result = await repository.findFlashcardsByIds([created[0].id, 99999]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(created[0].id);
    });

    it("returns flashcards with correct entity structure", async () => {
      const created = await repository.createFlashcards([
        { videoId: testVideoId, userId: testUserId, front: "Test Front", back: "Test Back" },
      ]);

      const result = await repository.findFlashcardsByIds([created[0].id]);

      expect(result).toHaveLength(1);
      const flashcard = result[0];
      expect(flashcard.id).toBe(created[0].id);
      expect(flashcard.videoId).toBe(testVideoId);
      expect(flashcard.userId).toBe(testUserId);
      expect(flashcard.front).toBe("Test Front");
      expect(flashcard.back).toBe("Test Back");
      expect(flashcard.createdAt).toBeDefined();
    });
  });

  describe("findFlashcardsByVideoId", () => {
    it("finds all flashcards for a video", async () => {
      await repository.createFlashcards([
        { videoId: testVideoId, userId: testUserId, front: "Front 1", back: "Back 1" },
        { videoId: testVideoId, userId: testUserId, front: "Front 2", back: "Back 2" },
      ]);

      const result = await repository.findFlashcardsByVideoId(testVideoId);

      expect(result).toHaveLength(2);
      expect(result.every((f) => f.videoId === testVideoId)).toBe(true);
    });

    it("returns empty array for video with no flashcards", async () => {
      const result = await repository.findFlashcardsByVideoId(99999);
      expect(result).toHaveLength(0);
    });
  });

  describe("countFlashcardsByVideoIds", () => {
    it("counts flashcards grouped by video ID", async () => {
      // Create another video
      const [video2] = await ctx.db
        .insert(videos)
        .values({
          userId: testUserId,
          title: "Video 2",
          channelName: "Channel",
          url: "https://youtube.com/watch?v=other",
        })
        .returning();

      // Create flashcards for both videos
      await repository.createFlashcards([
        { videoId: testVideoId, userId: testUserId, front: "F1", back: "B1" },
        { videoId: testVideoId, userId: testUserId, front: "F2", back: "B2" },
        { videoId: video2.id, userId: testUserId, front: "F3", back: "B3" },
      ]);

      const result = await repository.countFlashcardsByVideoIds([testVideoId, video2.id]);

      expect(result[testVideoId]).toBe(2);
      expect(result[video2.id]).toBe(1);
    });

    it("returns empty object for empty input", async () => {
      const result = await repository.countFlashcardsByVideoIds([]);
      expect(result).toEqual({});
    });

    it("excludes videos with no flashcards from result", async () => {
      await repository.createFlashcards([
        { videoId: testVideoId, userId: testUserId, front: "F1", back: "B1" },
      ]);

      const result = await repository.countFlashcardsByVideoIds([testVideoId, 99999]);

      expect(result[testVideoId]).toBe(1);
      expect(result[99999]).toBeUndefined();
    });
  });
});
