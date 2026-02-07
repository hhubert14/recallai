import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  users,
  videos,
  studySets,
  battleRooms,
  battleRoomSlots,
  questions,
  questionOptions,
} from "@/drizzle/schema";
import { DrizzleBattleGameAnswerRepository } from "./battle-game-answer.repository.drizzle";
import {
  createTestContext,
  IntegrationTestContext,
} from "@/test-utils/integration-test-context";

/**
 * Integration tests for DrizzleBattleGameAnswerRepository
 *
 * Requires test database to be running:
 *   npm run db:migrate:test
 *
 * Run with:
 *   npm run test:integration
 */

describe("DrizzleBattleGameAnswerRepository (integration)", () => {
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
  let repository: DrizzleBattleGameAnswerRepository;

  let testUserId: string;
  let testRoomId: number;
  let testSlotId: number;
  let testQuestionId: number;
  let testOptionId: number;

  beforeEach(async () => {
    ctx = await createTestContext();
    repository = new DrizzleBattleGameAnswerRepository(ctx.db);

    // Create test user
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

    // Create test study set
    const [studySet] = await ctx.db
      .insert(studySets)
      .values({
        userId: testUserId,
        name: "Test Study Set",
        sourceType: "video",
        videoId: video.id,
      })
      .returning();

    // Create test battle room
    const [room] = await ctx.db
      .insert(battleRooms)
      .values({
        hostUserId: testUserId,
        studySetId: studySet.id,
        name: "Test Room",
        visibility: "public",
        timeLimitSeconds: 30,
        questionCount: 10,
      })
      .returning();
    testRoomId = room.id;

    // Create test slot
    const [slot] = await ctx.db
      .insert(battleRoomSlots)
      .values({
        roomId: testRoomId,
        slotIndex: 0,
        slotType: "player",
        userId: testUserId,
      })
      .returning();
    testSlotId = slot.id;

    // Create test question
    const [question] = await ctx.db
      .insert(questions)
      .values({
        videoId: video.id,
        questionText: "What is 2+2?",
        questionType: "multiple_choice",
      })
      .returning();
    testQuestionId = question.id;

    // Create test option
    const [option] = await ctx.db
      .insert(questionOptions)
      .values({
        questionId: testQuestionId,
        optionText: "4",
        isCorrect: true,
      })
      .returning();
    testOptionId = option.id;
  });

  afterEach(async () => {
    await ctx.cleanup();
  });

  describe("createBattleGameAnswer", () => {
    it("creates an answer with a selected option", async () => {
      const result = await repository.createBattleGameAnswer({
        roomId: testRoomId,
        slotId: testSlotId,
        questionId: testQuestionId,
        questionIndex: 0,
        selectedOptionId: testOptionId,
        isCorrect: true,
        answeredAt: "2025-01-20T10:00:05+00:00",
        score: 950,
      });

      expect(result.id).toBeDefined();
      expect(result.roomId).toBe(testRoomId);
      expect(result.slotId).toBe(testSlotId);
      expect(result.questionId).toBe(testQuestionId);
      expect(result.questionIndex).toBe(0);
      expect(result.selectedOptionId).toBe(testOptionId);
      expect(result.isCorrect).toBe(true);
      expect(result.answeredAt).toBeDefined();
      expect(result.score).toBe(950);
    });

    it("creates an answer with null selectedOptionId (timeout)", async () => {
      const result = await repository.createBattleGameAnswer({
        roomId: testRoomId,
        slotId: testSlotId,
        questionId: testQuestionId,
        questionIndex: 0,
        selectedOptionId: null,
        isCorrect: false,
        answeredAt: "2025-01-20T10:00:35+00:00",
        score: 0,
      });

      expect(result.selectedOptionId).toBeNull();
      expect(result.isCorrect).toBe(false);
      expect(result.score).toBe(0);
    });
  });

  describe("findAnswersByRoomId", () => {
    it("returns answers ordered by questionIndex", async () => {
      // Create a second question
      const [video] = await ctx.db.select().from(videos).limit(1);
      const [question2] = await ctx.db
        .insert(questions)
        .values({
          videoId: video.id,
          questionText: "What is 3+3?",
          questionType: "multiple_choice",
        })
        .returning();

      await repository.createBattleGameAnswer({
        roomId: testRoomId,
        slotId: testSlotId,
        questionId: question2.id,
        questionIndex: 1,
        selectedOptionId: null,
        isCorrect: false,
        answeredAt: "2025-01-20T10:00:35+00:00",
        score: 0,
      });

      await repository.createBattleGameAnswer({
        roomId: testRoomId,
        slotId: testSlotId,
        questionId: testQuestionId,
        questionIndex: 0,
        selectedOptionId: testOptionId,
        isCorrect: true,
        answeredAt: "2025-01-20T10:00:05+00:00",
        score: 950,
      });

      const result = await repository.findAnswersByRoomId(testRoomId);

      expect(result).toHaveLength(2);
      expect(result[0].questionIndex).toBe(0);
      expect(result[1].questionIndex).toBe(1);
    });

    it("returns empty array for room with no answers", async () => {
      const result = await repository.findAnswersByRoomId(99999);
      expect(result).toHaveLength(0);
    });
  });

  describe("findAnswersBySlotIdAndRoomId", () => {
    it("finds answers for a specific slot in a room", async () => {
      await repository.createBattleGameAnswer({
        roomId: testRoomId,
        slotId: testSlotId,
        questionId: testQuestionId,
        questionIndex: 0,
        selectedOptionId: testOptionId,
        isCorrect: true,
        answeredAt: "2025-01-20T10:00:05+00:00",
        score: 950,
      });

      const result = await repository.findAnswersBySlotIdAndRoomId(
        testSlotId,
        testRoomId
      );

      expect(result).toHaveLength(1);
      expect(result[0].slotId).toBe(testSlotId);
      expect(result[0].roomId).toBe(testRoomId);
    });

    it("returns empty array for no matching answers", async () => {
      const result = await repository.findAnswersBySlotIdAndRoomId(
        99999,
        99999
      );
      expect(result).toHaveLength(0);
    });
  });

  describe("countAnswersByRoomIdAndQuestionIndex", () => {
    it("counts answers for a specific question in a room", async () => {
      await repository.createBattleGameAnswer({
        roomId: testRoomId,
        slotId: testSlotId,
        questionId: testQuestionId,
        questionIndex: 0,
        selectedOptionId: testOptionId,
        isCorrect: true,
        answeredAt: "2025-01-20T10:00:05+00:00",
        score: 950,
      });

      const count =
        await repository.countAnswersByRoomIdAndQuestionIndex(
          testRoomId,
          0
        );

      expect(count).toBe(1);
    });

    it("returns 0 when no answers exist", async () => {
      const count =
        await repository.countAnswersByRoomIdAndQuestionIndex(
          testRoomId,
          0
        );

      expect(count).toBe(0);
    });
  });

  describe("constraints", () => {
    it("prevents duplicate answers (same slot, room, questionIndex)", async () => {
      await repository.createBattleGameAnswer({
        roomId: testRoomId,
        slotId: testSlotId,
        questionId: testQuestionId,
        questionIndex: 0,
        selectedOptionId: testOptionId,
        isCorrect: true,
        answeredAt: "2025-01-20T10:00:05+00:00",
        score: 950,
      });

      await expect(
        repository.createBattleGameAnswer({
          roomId: testRoomId,
          slotId: testSlotId,
          questionId: testQuestionId,
          questionIndex: 0,
          selectedOptionId: null,
          isCorrect: false,
          answeredAt: "2025-01-20T10:00:10+00:00",
          score: 0,
        })
      ).rejects.toThrow();
    });
  });
});
