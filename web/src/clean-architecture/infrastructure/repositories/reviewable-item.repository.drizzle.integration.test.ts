import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import postgres from "postgres";
import {
  users,
  videos,
  questions,
  flashcards,
  reviewableItems,
} from "@/drizzle/schema";
import { db } from "@/drizzle";
import { DrizzleReviewableItemRepository } from "./reviewable-item.repository.drizzle";

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

  // Raw client for auth.users operations (not in Drizzle schema)
  let rawClient: postgres.Sql;
  let repository: DrizzleReviewableItemRepository;

  // Test data IDs
  let testUserId: string;
  let testVideoId: number;
  let testQuestionIds: number[] = [];
  let testFlashcardIds: number[] = [];

  beforeAll(async () => {
    if (!TEST_DATABASE_URL) {
      throw new Error("DATABASE_URL is required for integration tests");
    }

    // Raw client only for auth.users operations
    rawClient = postgres(TEST_DATABASE_URL, { prepare: false });
    repository = new DrizzleReviewableItemRepository();
  });

  afterAll(async () => {
    await rawClient.end();
  });

  beforeEach(async () => {
    // Clean up test data in reverse dependency order
    await db.delete(reviewableItems);
    await db.delete(flashcards);
    await db.delete(questions);
    await db.delete(videos);
    await db.delete(users);
    // Clean up auth.users (mock table in test db)
    await rawClient`DELETE FROM auth.users`;

    // Create test user (must insert into auth.users first due to FK constraint)
    testUserId = crypto.randomUUID();
    await rawClient`INSERT INTO auth.users (id, email) VALUES (${testUserId}, 'test@example.com')`;
    await db.insert(users).values({
      id: testUserId,
      email: "test@example.com",
    });

    // Create test video
    const [video] = await db
      .insert(videos)
      .values({
        userId: testUserId,
        title: "Test Video",
        channelName: "Test Channel",
        url: "https://youtube.com/watch?v=test123",
      })
      .returning();
    testVideoId = video.id;

    // Create test questions
    const questionResults = await db
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
    const flashcardResults = await db
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

  describe("createReviewableItemsForQuestionsBatch", () => {
    it("creates reviewable items for questions", async () => {
      const items = testQuestionIds.map((questionId) => ({
        userId: testUserId,
        questionId,
        videoId: testVideoId,
      }));

      const result = await repository.createReviewableItemsForQuestionsBatch(items);

      expect(result).toHaveLength(2);
      expect(result[0].itemType).toBe("question");
      expect(result[0].userId).toBe(testUserId);
      expect(result[0].videoId).toBe(testVideoId);
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
      }));

      const result = await repository.createReviewableItemsForFlashcardsBatch(items);

      expect(result).toHaveLength(2);
      expect(result[0].itemType).toBe("flashcard");
      expect(result[0].userId).toBe(testUserId);
      expect(result[0].videoId).toBe(testVideoId);
      expect(result[0].flashcardId).toBe(testFlashcardIds[0]);
      expect(result[0].questionId).toBeNull();
    });
  });

  describe("findReviewableItemsByUserId", () => {
    it("returns all reviewable items for a user", async () => {
      // Create some reviewable items
      await repository.createReviewableItemsForQuestionsBatch([
        { userId: testUserId, questionId: testQuestionIds[0], videoId: testVideoId },
      ]);
      await repository.createReviewableItemsForFlashcardsBatch([
        { userId: testUserId, flashcardId: testFlashcardIds[0], videoId: testVideoId },
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
      const [video2] = await db
        .insert(videos)
        .values({
          userId: testUserId,
          title: "Video 2",
          channelName: "Channel",
          url: "https://youtube.com/watch?v=other",
        })
        .returning();

      // Create items for both videos
      await repository.createReviewableItemsForQuestionsBatch([
        { userId: testUserId, questionId: testQuestionIds[0], videoId: testVideoId },
      ]);

      const [q3] = await db
        .insert(questions)
        .values({
          videoId: video2.id,
          questionText: "Q3?",
          questionType: "multiple_choice",
        })
        .returning();

      await repository.createReviewableItemsForQuestionsBatch([
        { userId: testUserId, questionId: q3.id, videoId: video2.id },
      ]);

      const result = await repository.findReviewableItemsByUserIdAndVideoId(
        testUserId,
        testVideoId
      );

      expect(result).toHaveLength(1);
      expect(result[0].videoId).toBe(testVideoId);
    });
  });

  describe("findReviewableItemByQuestionId", () => {
    it("finds item by question ID", async () => {
      await repository.createReviewableItemsForQuestionsBatch([
        { userId: testUserId, questionId: testQuestionIds[0], videoId: testVideoId },
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
        { userId: testUserId, flashcardId: testFlashcardIds[0], videoId: testVideoId },
      ]);

      const result = await repository.findReviewableItemByFlashcardId(testFlashcardIds[0]);

      expect(result).not.toBeNull();
      expect(result!.flashcardId).toBe(testFlashcardIds[0]);
    });
  });

  describe("findReviewableItemById", () => {
    it("finds item by ID", async () => {
      const [created] = await repository.createReviewableItemsForQuestionsBatch([
        { userId: testUserId, questionId: testQuestionIds[0], videoId: testVideoId },
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
});
