import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { users, videos, questions, studySets } from "@/drizzle/schema";
import { DrizzleReviewProgressRepository } from "./review-progress.repository.drizzle";
import { DrizzleReviewableItemRepository } from "./reviewable-item.repository.drizzle";
import {
  createTestContext,
  IntegrationTestContext,
} from "@/test-utils/integration-test-context";

/**
 * Integration tests for DrizzleReviewProgressRepository
 *
 * Requires test database to be running:
 *   npm run db:migrate:test
 *
 * Run with:
 *   npm run test:integration
 */

describe("DrizzleReviewProgressRepository (integration)", () => {
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
  let progressRepo: DrizzleReviewProgressRepository;
  let reviewableItemRepo: DrizzleReviewableItemRepository;

  // Test data
  let testUserId: string;
  let testVideoId: number;
  let testStudySetId: number;
  let testQuestionIds: number[] = [];
  let testReviewableItemIds: number[] = [];

  beforeEach(async () => {
    ctx = await createTestContext();
    progressRepo = new DrizzleReviewProgressRepository(ctx.db);
    reviewableItemRepo = new DrizzleReviewableItemRepository(ctx.db);

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

    // Create test study set
    const [studySet] = await ctx.db
      .insert(studySets)
      .values({
        userId: testUserId,
        name: "Test Study Set",
        sourceType: "video",
        videoId: testVideoId,
      })
      .returning();
    testStudySetId = studySet.id;

    // Create test questions
    const questionResults = await ctx.db
      .insert(questions)
      .values([
        {
          videoId: testVideoId,
          questionText: "Q1?",
          questionType: "multiple_choice",
        },
        {
          videoId: testVideoId,
          questionText: "Q2?",
          questionType: "multiple_choice",
        },
        {
          videoId: testVideoId,
          questionText: "Q3?",
          questionType: "multiple_choice",
        },
      ])
      .returning();
    testQuestionIds = questionResults.map((q) => q.id);

    // Create reviewable items
    const reviewableItemResults =
      await reviewableItemRepo.createReviewableItemsForQuestionsBatch(
        testQuestionIds.map((questionId) => ({
          userId: testUserId,
          questionId,
          videoId: testVideoId,
          studySetId: testStudySetId,
        }))
      );
    testReviewableItemIds = reviewableItemResults.map((r) => r.id);
  });

  afterEach(async () => {
    await ctx.cleanup();
  });

  describe("createReviewProgressBatch", () => {
    it("creates progress records for reviewable items", async () => {
      const today = new Date().toISOString().split("T")[0];

      const result = await progressRepo.createReviewProgressBatch([
        {
          userId: testUserId,
          reviewableItemId: testReviewableItemIds[0],
          boxLevel: 1,
          nextReviewDate: today,
          timesCorrect: 0,
          timesIncorrect: 0,
          lastReviewedAt: null,
        },
        {
          userId: testUserId,
          reviewableItemId: testReviewableItemIds[1],
          boxLevel: 2,
          nextReviewDate: today,
          timesCorrect: 1,
          timesIncorrect: 0,
          lastReviewedAt: new Date().toISOString(),
        },
      ]);

      expect(result).toHaveLength(2);
      expect(result[0].boxLevel).toBe(1);
      expect(result[1].boxLevel).toBe(2);
    });

    it("returns empty array for empty input", async () => {
      const result = await progressRepo.createReviewProgressBatch([]);
      expect(result).toHaveLength(0);
    });
  });

  describe("findReviewProgressByUserIdAndReviewableItemId", () => {
    it("finds progress by user and reviewable item", async () => {
      await progressRepo.createReviewProgressBatch([
        {
          userId: testUserId,
          reviewableItemId: testReviewableItemIds[0],
          boxLevel: 3,
          nextReviewDate: "2025-01-25",
          timesCorrect: 5,
          timesIncorrect: 2,
          lastReviewedAt: new Date().toISOString(),
        },
      ]);

      const result =
        await progressRepo.findReviewProgressByUserIdAndReviewableItemId(
          testUserId,
          testReviewableItemIds[0]
        );

      expect(result).not.toBeNull();
      expect(result!.boxLevel).toBe(3);
      expect(result!.timesCorrect).toBe(5);
    });

    it("returns null for non-existent progress", async () => {
      const result =
        await progressRepo.findReviewProgressByUserIdAndReviewableItemId(
          testUserId,
          99999
        );
      expect(result).toBeNull();
    });
  });

  describe("findReviewProgressDueForReview", () => {
    it("finds items due for review (past date)", async () => {
      const pastDate = "2020-01-01";
      const futureDate = "2099-12-31";

      await progressRepo.createReviewProgressBatch([
        {
          userId: testUserId,
          reviewableItemId: testReviewableItemIds[0],
          boxLevel: 1,
          nextReviewDate: pastDate,
          timesCorrect: 0,
          timesIncorrect: 0,
          lastReviewedAt: null,
        },
        {
          userId: testUserId,
          reviewableItemId: testReviewableItemIds[1],
          boxLevel: 1,
          nextReviewDate: futureDate,
          timesCorrect: 0,
          timesIncorrect: 0,
          lastReviewedAt: null,
        },
      ]);

      const result =
        await progressRepo.findReviewProgressDueForReview(testUserId);

      expect(result).toHaveLength(1);
      expect(result[0].reviewableItemId).toBe(testReviewableItemIds[0]);
    });

    it("includes items due today", async () => {
      const today = new Date().toISOString().split("T")[0];

      await progressRepo.createReviewProgressBatch([
        {
          userId: testUserId,
          reviewableItemId: testReviewableItemIds[0],
          boxLevel: 1,
          nextReviewDate: today,
          timesCorrect: 0,
          timesIncorrect: 0,
          lastReviewedAt: null,
        },
      ]);

      const result =
        await progressRepo.findReviewProgressDueForReview(testUserId);

      expect(result).toHaveLength(1);
    });
  });

  describe("findReviewableItemIdsWithoutProgress", () => {
    it("finds items that have no progress record", async () => {
      // Create progress for only the first item
      await progressRepo.createReviewProgressBatch([
        {
          userId: testUserId,
          reviewableItemId: testReviewableItemIds[0],
          boxLevel: 1,
          nextReviewDate: "2025-01-25",
          timesCorrect: 0,
          timesIncorrect: 0,
          lastReviewedAt: null,
        },
      ]);

      const result = await progressRepo.findReviewableItemIdsWithoutProgress(
        testUserId,
        testReviewableItemIds
      );

      expect(result).toHaveLength(2);
      expect(result).toContain(testReviewableItemIds[1]);
      expect(result).toContain(testReviewableItemIds[2]);
      expect(result).not.toContain(testReviewableItemIds[0]);
    });

    it("returns all IDs when no progress exists", async () => {
      const result = await progressRepo.findReviewableItemIdsWithoutProgress(
        testUserId,
        testReviewableItemIds
      );

      expect(result).toHaveLength(3);
    });

    it("returns empty array when all have progress", async () => {
      await progressRepo.createReviewProgressBatch(
        testReviewableItemIds.map((id) => ({
          userId: testUserId,
          reviewableItemId: id,
          boxLevel: 1,
          nextReviewDate: "2025-01-25",
          timesCorrect: 0,
          timesIncorrect: 0,
          lastReviewedAt: null,
        }))
      );

      const result = await progressRepo.findReviewableItemIdsWithoutProgress(
        testUserId,
        testReviewableItemIds
      );

      expect(result).toHaveLength(0);
    });
  });

  describe("updateReviewProgress", () => {
    it("updates existing progress", async () => {
      await progressRepo.createReviewProgressBatch([
        {
          userId: testUserId,
          reviewableItemId: testReviewableItemIds[0],
          boxLevel: 1,
          nextReviewDate: "2025-01-20",
          timesCorrect: 0,
          timesIncorrect: 0,
          lastReviewedAt: null,
        },
      ]);

      const now = new Date().toISOString();
      const result = await progressRepo.updateReviewProgress(
        testUserId,
        testReviewableItemIds[0],
        2,
        "2025-01-23",
        1,
        0,
        now
      );

      expect(result.boxLevel).toBe(2);
      expect(result.nextReviewDate).toBe("2025-01-23");
      expect(result.timesCorrect).toBe(1);
      // Compare timestamps by parsing - DB returns different format than ISO
      expect(new Date(result.lastReviewedAt!).getTime()).toBe(
        new Date(now).getTime()
      );
    });
  });

  describe("getReviewStats", () => {
    it("returns correct stats", async () => {
      const pastDate = "2020-01-01";
      const futureDate = "2099-12-31";

      await progressRepo.createReviewProgressBatch([
        {
          userId: testUserId,
          reviewableItemId: testReviewableItemIds[0],
          boxLevel: 1,
          nextReviewDate: pastDate, // due
          timesCorrect: 0,
          timesIncorrect: 0,
          lastReviewedAt: null,
        },
        {
          userId: testUserId,
          reviewableItemId: testReviewableItemIds[1],
          boxLevel: 3,
          nextReviewDate: pastDate, // due
          timesCorrect: 2,
          timesIncorrect: 1,
          lastReviewedAt: new Date().toISOString(),
        },
        {
          userId: testUserId,
          reviewableItemId: testReviewableItemIds[2],
          boxLevel: 5,
          nextReviewDate: futureDate, // not due
          timesCorrect: 5,
          timesIncorrect: 0,
          lastReviewedAt: new Date().toISOString(),
        },
      ]);

      const result = await progressRepo.getReviewStats(testUserId);

      expect(result.dueCount).toBe(2);
      expect(result.totalCount).toBe(3);
      expect(result.boxDistribution).toEqual([1, 0, 1, 0, 1]); // boxes 1-5
    });

    it("returns zeros for user with no progress", async () => {
      const result = await progressRepo.getReviewStats(testUserId);

      expect(result.dueCount).toBe(0);
      expect(result.totalCount).toBe(0);
      expect(result.boxDistribution).toEqual([0, 0, 0, 0, 0]);
    });
  });

  describe("findReviewProgressByUserId", () => {
    it("returns all progress for user", async () => {
      await progressRepo.createReviewProgressBatch(
        testReviewableItemIds.map((id, index) => ({
          userId: testUserId,
          reviewableItemId: id,
          boxLevel: index + 1,
          nextReviewDate: "2025-01-25",
          timesCorrect: 0,
          timesIncorrect: 0,
          lastReviewedAt: null,
        }))
      );

      const result = await progressRepo.findReviewProgressByUserId(testUserId);

      expect(result).toHaveLength(3);
    });
  });

  describe("findReviewProgressByReviewableItemIds", () => {
    it("finds progress for specific item IDs", async () => {
      await progressRepo.createReviewProgressBatch(
        testReviewableItemIds.map((id) => ({
          userId: testUserId,
          reviewableItemId: id,
          boxLevel: 1,
          nextReviewDate: "2025-01-25",
          timesCorrect: 0,
          timesIncorrect: 0,
          lastReviewedAt: null,
        }))
      );

      const result = await progressRepo.findReviewProgressByReviewableItemIds(
        testUserId,
        [testReviewableItemIds[0], testReviewableItemIds[1]]
      );

      expect(result).toHaveLength(2);
    });

    it("returns empty array for empty input", async () => {
      const result = await progressRepo.findReviewProgressByReviewableItemIds(
        testUserId,
        []
      );
      expect(result).toHaveLength(0);
    });
  });
});
