import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { users, videos } from "@/drizzle/schema";
import { DrizzleStudySetRepository } from "./study-set.repository.drizzle";
import {
  createTestContext,
  IntegrationTestContext,
} from "@/test-utils/integration-test-context";

/**
 * Integration tests for DrizzleStudySetRepository
 *
 * Requires test database to be running:
 *   npm run db:migrate:test
 *
 * Run with:
 *   npm run test:integration
 */

describe("DrizzleStudySetRepository (integration)", () => {
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
  let repository: DrizzleStudySetRepository;

  // Test data IDs
  let testUserId: string;
  let testVideoId: number;

  beforeEach(async () => {
    ctx = await createTestContext();
    repository = new DrizzleStudySetRepository(ctx.db);

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

  describe("createStudySet", () => {
    it("creates a video-sourced study set and returns entity", async () => {
      const result = await repository.createStudySet({
        userId: testUserId,
        name: "My Study Set",
        description: "A test study set",
        sourceType: "video",
        videoId: testVideoId,
      });

      expect(result.id).toBeDefined();
      expect(result.publicId).toBeDefined();
      expect(result.userId).toBe(testUserId);
      expect(result.name).toBe("My Study Set");
      expect(result.description).toBe("A test study set");
      expect(result.sourceType).toBe("video");
      expect(result.videoId).toBe(testVideoId);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it("creates a manual study set without video", async () => {
      const result = await repository.createStudySet({
        userId: testUserId,
        name: "Manual Study Set",
        description: null,
        sourceType: "manual",
        videoId: null,
      });

      expect(result.sourceType).toBe("manual");
      expect(result.videoId).toBeNull();
      expect(result.description).toBeNull();
    });

    it("creates a pdf-sourced study set", async () => {
      const result = await repository.createStudySet({
        userId: testUserId,
        name: "PDF Notes",
        description: "Notes from a PDF",
        sourceType: "pdf",
        videoId: null,
      });

      expect(result.sourceType).toBe("pdf");
      expect(result.videoId).toBeNull();
    });
  });

  describe("findStudySetById", () => {
    it("finds a study set by internal ID", async () => {
      const created = await repository.createStudySet({
        userId: testUserId,
        name: "Test Study Set",
        description: "Test description",
        sourceType: "video",
        videoId: testVideoId,
      });

      const result = await repository.findStudySetById(created.id);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(created.id);
      expect(result!.name).toBe("Test Study Set");
    });

    it("returns null for non-existent ID", async () => {
      const result = await repository.findStudySetById(99999);
      expect(result).toBeNull();
    });
  });

  describe("findStudySetByPublicId", () => {
    it("finds a study set by public UUID", async () => {
      const created = await repository.createStudySet({
        userId: testUserId,
        name: "Test Study Set",
        description: null,
        sourceType: "manual",
        videoId: null,
      });

      const result = await repository.findStudySetByPublicId(created.publicId);

      expect(result).not.toBeNull();
      expect(result!.publicId).toBe(created.publicId);
      expect(result!.name).toBe("Test Study Set");
    });

    it("returns null for non-existent public ID", async () => {
      const result = await repository.findStudySetByPublicId(
        "00000000-0000-0000-0000-000000000000"
      );
      expect(result).toBeNull();
    });
  });

  describe("findStudySetsByUserId", () => {
    it("finds all study sets for a user", async () => {
      await repository.createStudySet({
        userId: testUserId,
        name: "Study Set 1",
        description: null,
        sourceType: "video",
        videoId: testVideoId,
      });
      await repository.createStudySet({
        userId: testUserId,
        name: "Study Set 2",
        description: null,
        sourceType: "manual",
        videoId: null,
      });

      const result = await repository.findStudySetsByUserId(testUserId);

      expect(result).toHaveLength(2);
      expect(result.every((s) => s.userId === testUserId)).toBe(true);
    });

    it("returns empty array for user with no study sets", async () => {
      const nonExistentUserId = "00000000-0000-0000-0000-000000000000";
      const result = await repository.findStudySetsByUserId(nonExistentUserId);
      expect(result).toHaveLength(0);
    });

    it("returns study sets ordered by creation date descending", async () => {
      // Create two study sets
      await repository.createStudySet({
        userId: testUserId,
        name: "First",
        description: null,
        sourceType: "manual",
        videoId: null,
      });
      await repository.createStudySet({
        userId: testUserId,
        name: "Second",
        description: null,
        sourceType: "manual",
        videoId: null,
      });

      const result = await repository.findStudySetsByUserId(testUserId);

      // Verify the ordering is by createdAt descending (or by id descending as a proxy)
      // IDs are auto-incrementing, so higher ID = newer record
      expect(result[0].id).toBeGreaterThan(result[1].id);
    });
  });

  describe("findStudySetByVideoId", () => {
    it("finds a study set by video ID", async () => {
      await repository.createStudySet({
        userId: testUserId,
        name: "Video Study Set",
        description: null,
        sourceType: "video",
        videoId: testVideoId,
      });

      const result = await repository.findStudySetByVideoId(testVideoId);

      expect(result).not.toBeNull();
      expect(result!.videoId).toBe(testVideoId);
      expect(result!.name).toBe("Video Study Set");
    });

    it("returns null for video with no study set", async () => {
      const result = await repository.findStudySetByVideoId(99999);
      expect(result).toBeNull();
    });
  });

  describe("updateStudySet", () => {
    it("updates name and description", async () => {
      const created = await repository.createStudySet({
        userId: testUserId,
        name: "Original Name",
        description: "Original description",
        sourceType: "manual",
        videoId: null,
      });

      const result = await repository.updateStudySet(created.id, {
        name: "Updated Name",
        description: "Updated description",
      });

      expect(result).not.toBeNull();
      expect(result!.name).toBe("Updated Name");
      expect(result!.description).toBe("Updated description");
    });

    it("updates only name when description not provided", async () => {
      const created = await repository.createStudySet({
        userId: testUserId,
        name: "Original Name",
        description: "Original description",
        sourceType: "manual",
        videoId: null,
      });

      const result = await repository.updateStudySet(created.id, {
        name: "Updated Name",
      });

      expect(result).not.toBeNull();
      expect(result!.name).toBe("Updated Name");
      expect(result!.description).toBe("Original description");
    });

    it("sets description to null when explicitly provided", async () => {
      const created = await repository.createStudySet({
        userId: testUserId,
        name: "Original Name",
        description: "Original description",
        sourceType: "manual",
        videoId: null,
      });

      const result = await repository.updateStudySet(created.id, {
        description: null,
      });

      expect(result).not.toBeNull();
      expect(result!.description).toBeNull();
    });

    it("returns null for non-existent ID", async () => {
      const result = await repository.updateStudySet(99999, {
        name: "New Name",
      });
      expect(result).toBeNull();
    });
  });

  describe("unique constraint on video_id", () => {
    it("prevents creating duplicate study sets for the same video", async () => {
      // Create first study set for the video
      await repository.createStudySet({
        userId: testUserId,
        name: "First Study Set",
        description: null,
        sourceType: "video",
        videoId: testVideoId,
      });

      // Attempt to create second study set for the same video should fail
      await expect(
        repository.createStudySet({
          userId: testUserId,
          name: "Second Study Set",
          description: null,
          sourceType: "video",
          videoId: testVideoId,
        })
      ).rejects.toThrow();
    });

    it("allows multiple study sets with null video_id (manual study sets)", async () => {
      // Create two manual study sets (no video)
      const first = await repository.createStudySet({
        userId: testUserId,
        name: "Manual Set 1",
        description: null,
        sourceType: "manual",
        videoId: null,
      });

      const second = await repository.createStudySet({
        userId: testUserId,
        name: "Manual Set 2",
        description: null,
        sourceType: "manual",
        videoId: null,
      });

      // Both should succeed since null video_id is allowed to have duplicates
      expect(first.id).toBeDefined();
      expect(second.id).toBeDefined();
      expect(first.id).not.toBe(second.id);
    });

    it("allows different videos to each have one study set", async () => {
      // Create second video
      const [video2] = await ctx.db
        .insert(videos)
        .values({
          userId: testUserId,
          title: "Second Video",
          channelName: "Channel",
          url: "https://youtube.com/watch?v=second",
        })
        .returning();

      // Create study sets for different videos
      const first = await repository.createStudySet({
        userId: testUserId,
        name: "Study Set for Video 1",
        description: null,
        sourceType: "video",
        videoId: testVideoId,
      });

      const second = await repository.createStudySet({
        userId: testUserId,
        name: "Study Set for Video 2",
        description: null,
        sourceType: "video",
        videoId: video2.id,
      });

      expect(first.videoId).toBe(testVideoId);
      expect(second.videoId).toBe(video2.id);
    });
  });
});
