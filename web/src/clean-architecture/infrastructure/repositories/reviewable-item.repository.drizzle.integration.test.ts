import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { users, videos, questions, flashcards, studySets } from "@/drizzle/schema";
import { DrizzleReviewableItemRepository } from "./reviewable-item.repository.drizzle";
import {
  createTestContext,
  IntegrationTestContext,
} from "@/test-utils/integration-test-context";

/**
 * Integration tests for DrizzleReviewableItemRepository
 *
 * Requires test database to be running:
 *   npm run db:migrate:test
 *
 * Run with:
 *   npm run test:integration
 */

describe("DrizzleReviewableItemRepository (integration)", () => {
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
  let repository: DrizzleReviewableItemRepository;

  // Test data IDs
  let testUserId: string;
  let testVideoId: number;
  let testStudySetId: number;
  let testQuestionIds: number[] = [];
  let testFlashcardIds: number[] = [];

  beforeEach(async () => {
    ctx = await createTestContext();
    repository = new DrizzleReviewableItemRepository(ctx.db);

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
          questionText: "Question 1?",
          questionType: "multiple_choice",
        },
        {
          videoId: testVideoId,
          questionText: "Question 2?",
          questionType: "multiple_choice",
        },
      ])
      .returning();
    testQuestionIds = questionResults.map((q) => q.id);

    // Create test flashcards
    const flashcardResults = await ctx.db
      .insert(flashcards)
      .values([
        {
          videoId: testVideoId,
          userId: testUserId,
          front: "Front 1",
          back: "Back 1",
        },
        {
          videoId: testVideoId,
          userId: testUserId,
          front: "Front 2",
          back: "Back 2",
        },
      ])
      .returning();
    testFlashcardIds = flashcardResults.map((f) => f.id);
  });

  afterEach(async () => {
    await ctx.cleanup();
  });

  describe("createReviewableItemsForQuestionsBatch", () => {
    it("creates reviewable items for questions", async () => {
      const items = testQuestionIds.map((questionId) => ({
        userId: testUserId,
        questionId,
        videoId: testVideoId,
        studySetId: testStudySetId,
      }));

      const result = await repository.createReviewableItemsForQuestionsBatch(items);

      expect(result).toHaveLength(2);
      expect(result[0].itemType).toBe("question");
      expect(result[0].userId).toBe(testUserId);
      expect(result[0].videoId).toBe(testVideoId);
      expect(result[0].studySetId).toBe(testStudySetId);
      expect(result[0].questionId).toBe(testQuestionIds[0]);
      expect(result[0].flashcardId).toBeNull();
    });

    it("returns empty array for empty input", async () => {
      const result = await repository.createReviewableItemsForQuestionsBatch([]);
      expect(result).toHaveLength(0);
    });
  });

  describe("createReviewableItemsForFlashcardsBatch", () => {
    it("creates reviewable items for flashcards", async () => {
      const items = testFlashcardIds.map((flashcardId) => ({
        userId: testUserId,
        flashcardId,
        videoId: testVideoId,
        studySetId: testStudySetId,
      }));

      const result = await repository.createReviewableItemsForFlashcardsBatch(items);

      expect(result).toHaveLength(2);
      expect(result[0].itemType).toBe("flashcard");
      expect(result[0].userId).toBe(testUserId);
      expect(result[0].videoId).toBe(testVideoId);
      expect(result[0].studySetId).toBe(testStudySetId);
      expect(result[0].flashcardId).toBe(testFlashcardIds[0]);
      expect(result[0].questionId).toBeNull();
    });
  });

  describe("findReviewableItemsByUserId", () => {
    it("returns all reviewable items for a user", async () => {
      // Create some reviewable items
      await repository.createReviewableItemsForQuestionsBatch([
        { userId: testUserId, questionId: testQuestionIds[0], videoId: testVideoId, studySetId: testStudySetId },
      ]);
      await repository.createReviewableItemsForFlashcardsBatch([
        { userId: testUserId, flashcardId: testFlashcardIds[0], videoId: testVideoId, studySetId: testStudySetId },
      ]);

      const result = await repository.findReviewableItemsByUserId(testUserId);

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.itemType).sort()).toEqual(["flashcard", "question"]);
    });

    it("returns empty array for user with no items", async () => {
      // Use a valid UUID that doesn't exist in the database
      const nonExistentUserId = "00000000-0000-0000-0000-000000000000";
      const result = await repository.findReviewableItemsByUserId(nonExistentUserId);
      expect(result).toHaveLength(0);
    });
  });

  describe("findReviewableItemsByUserIdAndVideoId", () => {
    it("filters by video", async () => {
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

      // Create another study set for video2
      const [studySet2] = await ctx.db
        .insert(studySets)
        .values({
          userId: testUserId,
          name: "Study Set 2",
          sourceType: "video",
          videoId: video2.id,
        })
        .returning();

      // Create items for both videos
      await repository.createReviewableItemsForQuestionsBatch([
        { userId: testUserId, questionId: testQuestionIds[0], videoId: testVideoId, studySetId: testStudySetId },
      ]);

      const [q3] = await ctx.db
        .insert(questions)
        .values({
          videoId: video2.id,
          questionText: "Q3?",
          questionType: "multiple_choice",
        })
        .returning();

      await repository.createReviewableItemsForQuestionsBatch([
        { userId: testUserId, questionId: q3.id, videoId: video2.id, studySetId: studySet2.id },
      ]);

      const result = await repository.findReviewableItemsByUserIdAndVideoId(
        testUserId,
        testVideoId
      );

      expect(result).toHaveLength(1);
      expect(result[0].videoId).toBe(testVideoId);
    });
  });

  describe("findReviewableItemsByStudySetId", () => {
    it("finds all reviewable items for a study set", async () => {
      await repository.createReviewableItemsForQuestionsBatch([
        { userId: testUserId, questionId: testQuestionIds[0], videoId: testVideoId, studySetId: testStudySetId },
        { userId: testUserId, questionId: testQuestionIds[1], videoId: testVideoId, studySetId: testStudySetId },
      ]);

      const result = await repository.findReviewableItemsByStudySetId(testStudySetId);

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.studySetId === testStudySetId)).toBe(true);
    });

    it("returns empty array for study set with no items", async () => {
      const result = await repository.findReviewableItemsByStudySetId(99999);
      expect(result).toHaveLength(0);
    });
  });

  describe("findReviewableItemByQuestionId", () => {
    it("finds item by question ID", async () => {
      await repository.createReviewableItemsForQuestionsBatch([
        { userId: testUserId, questionId: testQuestionIds[0], videoId: testVideoId, studySetId: testStudySetId },
      ]);

      const result = await repository.findReviewableItemByQuestionId(testQuestionIds[0]);

      expect(result).not.toBeNull();
      expect(result!.questionId).toBe(testQuestionIds[0]);
    });

    it("returns null for non-existent question", async () => {
      const result = await repository.findReviewableItemByQuestionId(99999);
      expect(result).toBeNull();
    });
  });

  describe("findReviewableItemByFlashcardId", () => {
    it("finds item by flashcard ID", async () => {
      await repository.createReviewableItemsForFlashcardsBatch([
        { userId: testUserId, flashcardId: testFlashcardIds[0], videoId: testVideoId, studySetId: testStudySetId },
      ]);

      const result = await repository.findReviewableItemByFlashcardId(testFlashcardIds[0]);

      expect(result).not.toBeNull();
      expect(result!.flashcardId).toBe(testFlashcardIds[0]);
    });
  });

  describe("findReviewableItemById", () => {
    it("finds item by ID", async () => {
      const [created] = await repository.createReviewableItemsForQuestionsBatch([
        { userId: testUserId, questionId: testQuestionIds[0], videoId: testVideoId, studySetId: testStudySetId },
      ]);

      const result = await repository.findReviewableItemById(created.id);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(created.id);
    });
  });

  describe("findReviewableItemsByIds", () => {
    it("finds multiple items by IDs", async () => {
      const created = await repository.createReviewableItemsForQuestionsBatch(
        testQuestionIds.map((questionId) => ({
          userId: testUserId,
          questionId,
          videoId: testVideoId,
          studySetId: testStudySetId,
        }))
      );

      const ids = created.map((c) => c.id);
      const result = await repository.findReviewableItemsByIds(ids);

      expect(result).toHaveLength(2);
    });

    it("returns empty array for empty input", async () => {
      const result = await repository.findReviewableItemsByIds([]);
      expect(result).toHaveLength(0);
    });
  });

  describe("studySetId constraint", () => {
    it("all created reviewable items have non-null studySetId", async () => {
      // Create items for both questions and flashcards
      const questionItems = await repository.createReviewableItemsForQuestionsBatch([
        { userId: testUserId, questionId: testQuestionIds[0], videoId: testVideoId, studySetId: testStudySetId },
        { userId: testUserId, questionId: testQuestionIds[1], videoId: testVideoId, studySetId: testStudySetId },
      ]);
      const flashcardItems = await repository.createReviewableItemsForFlashcardsBatch([
        { userId: testUserId, flashcardId: testFlashcardIds[0], videoId: testVideoId, studySetId: testStudySetId },
      ]);

      // Verify all items have non-null studySetId
      const allItems = [...questionItems, ...flashcardItems];
      for (const item of allItems) {
        expect(item.studySetId).not.toBeNull();
        expect(typeof item.studySetId).toBe("number");
      }
    });

    it("items retrieved by userId have non-null studySetId", async () => {
      await repository.createReviewableItemsForQuestionsBatch([
        { userId: testUserId, questionId: testQuestionIds[0], videoId: testVideoId, studySetId: testStudySetId },
      ]);

      const items = await repository.findReviewableItemsByUserId(testUserId);

      expect(items).toHaveLength(1);
      expect(items[0].studySetId).toBe(testStudySetId);
    });

    it("items retrieved by studySetId have correct studySetId", async () => {
      await repository.createReviewableItemsForQuestionsBatch([
        { userId: testUserId, questionId: testQuestionIds[0], videoId: testVideoId, studySetId: testStudySetId },
      ]);

      const items = await repository.findReviewableItemsByStudySetId(testStudySetId);

      expect(items).toHaveLength(1);
      expect(items[0].studySetId).toBe(testStudySetId);
    });
  });
});
