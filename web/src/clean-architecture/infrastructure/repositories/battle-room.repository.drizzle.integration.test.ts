import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { users, videos, studySets } from "@/drizzle/schema";
import { DrizzleBattleRoomRepository } from "./battle-room.repository.drizzle";
import {
  createTestContext,
  IntegrationTestContext,
} from "@/test-utils/integration-test-context";

/**
 * Integration tests for DrizzleBattleRoomRepository
 *
 * Requires test database to be running:
 *   npm run db:migrate:test
 *
 * Run with:
 *   npm run test:integration
 */

describe("DrizzleBattleRoomRepository (integration)", () => {
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
  let repository: DrizzleBattleRoomRepository;

  let testUserId: string;
  let testStudySetId: number;

  beforeEach(async () => {
    ctx = await createTestContext();
    repository = new DrizzleBattleRoomRepository(ctx.db);

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
    testStudySetId = studySet.id;
  });

  afterEach(async () => {
    await ctx.cleanup();
  });

  describe("createBattleRoom", () => {
    it("creates a public battle room and returns entity", async () => {
      const result = await repository.createBattleRoom({
        hostUserId: testUserId,
        studySetId: testStudySetId,
        name: "My Battle Room",
        visibility: "public",
        passwordHash: null,
        timeLimitSeconds: 30,
        questionCount: 10,
      });

      expect(result.id).toBeDefined();
      expect(result.publicId).toBeDefined();
      expect(result.hostUserId).toBe(testUserId);
      expect(result.studySetId).toBe(testStudySetId);
      expect(result.name).toBe("My Battle Room");
      expect(result.visibility).toBe("public");
      expect(result.passwordHash).toBeNull();
      expect(result.status).toBe("waiting");
      expect(result.timeLimitSeconds).toBe(30);
      expect(result.questionCount).toBe(10);
      expect(result.currentQuestionIndex).toBeNull();
      expect(result.currentQuestionStartedAt).toBeNull();
      expect(result.questionIds).toBeNull();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it("creates a private battle room with passwordHash", async () => {
      const result = await repository.createBattleRoom({
        hostUserId: testUserId,
        studySetId: testStudySetId,
        name: "Private Room",
        visibility: "private",
        passwordHash: "hashed_pw_123",
        timeLimitSeconds: 20,
        questionCount: 5,
      });

      expect(result.visibility).toBe("private");
      expect(result.passwordHash).toBe("hashed_pw_123");
    });
  });

  describe("findBattleRoomById", () => {
    it("finds a battle room by internal ID", async () => {
      const created = await repository.createBattleRoom({
        hostUserId: testUserId,
        studySetId: testStudySetId,
        name: "Test Room",
        visibility: "public",
        passwordHash: null,
        timeLimitSeconds: 30,
        questionCount: 10,
      });

      const result = await repository.findBattleRoomById(created.id);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(created.id);
      expect(result!.name).toBe("Test Room");
    });

    it("returns null for non-existent ID", async () => {
      const result = await repository.findBattleRoomById(99999);
      expect(result).toBeNull();
    });
  });

  describe("findBattleRoomByPublicId", () => {
    it("finds a battle room by public UUID", async () => {
      const created = await repository.createBattleRoom({
        hostUserId: testUserId,
        studySetId: testStudySetId,
        name: "Test Room",
        visibility: "public",
        passwordHash: null,
        timeLimitSeconds: 30,
        questionCount: 10,
      });

      const result = await repository.findBattleRoomByPublicId(
        created.publicId
      );

      expect(result).not.toBeNull();
      expect(result!.publicId).toBe(created.publicId);
      expect(result!.name).toBe("Test Room");
    });

    it("returns null for non-existent public ID", async () => {
      const result = await repository.findBattleRoomByPublicId(
        "00000000-0000-0000-0000-000000000000"
      );
      expect(result).toBeNull();
    });
  });

  describe("findBattleRoomsByStatus", () => {
    it("finds rooms matching the given status", async () => {
      await repository.createBattleRoom({
        hostUserId: testUserId,
        studySetId: testStudySetId,
        name: "Waiting Room",
        visibility: "public",
        passwordHash: null,
        timeLimitSeconds: 30,
        questionCount: 10,
      });

      const result = await repository.findBattleRoomsByStatus("waiting");

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every((r) => r.status === "waiting")).toBe(true);
    });

    it("returns empty array when no rooms match", async () => {
      const result = await repository.findBattleRoomsByStatus("in_game");
      expect(result).toHaveLength(0);
    });
  });

  describe("findBattleRoomsByHostUserId", () => {
    it("finds rooms hosted by a user", async () => {
      await repository.createBattleRoom({
        hostUserId: testUserId,
        studySetId: testStudySetId,
        name: "Host Room",
        visibility: "public",
        passwordHash: null,
        timeLimitSeconds: 30,
        questionCount: 10,
      });

      const result =
        await repository.findBattleRoomsByHostUserId(testUserId);

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every((r) => r.hostUserId === testUserId)).toBe(true);
    });

    it("returns empty array for user with no rooms", async () => {
      const result = await repository.findBattleRoomsByHostUserId(
        "00000000-0000-0000-0000-000000000000"
      );
      expect(result).toHaveLength(0);
    });
  });

  describe("updateBattleRoom", () => {
    it("updates status", async () => {
      const created = await repository.createBattleRoom({
        hostUserId: testUserId,
        studySetId: testStudySetId,
        name: "Test Room",
        visibility: "public",
        passwordHash: null,
        timeLimitSeconds: 30,
        questionCount: 10,
      });

      const result = await repository.updateBattleRoom(created.id, {
        status: "in_game",
      });

      expect(result).not.toBeNull();
      expect(result!.status).toBe("in_game");
    });

    it("updates currentQuestionIndex and currentQuestionStartedAt", async () => {
      const created = await repository.createBattleRoom({
        hostUserId: testUserId,
        studySetId: testStudySetId,
        name: "Test Room",
        visibility: "public",
        passwordHash: null,
        timeLimitSeconds: 30,
        questionCount: 10,
      });

      const startedAt = "2025-01-20T10:05:00+00:00";
      const result = await repository.updateBattleRoom(created.id, {
        currentQuestionIndex: 2,
        currentQuestionStartedAt: startedAt,
      });

      expect(result).not.toBeNull();
      expect(result!.currentQuestionIndex).toBe(2);
      expect(result!.currentQuestionStartedAt).toBeDefined();
    });

    it("updates questionIds (bigint array round-trip)", async () => {
      const created = await repository.createBattleRoom({
        hostUserId: testUserId,
        studySetId: testStudySetId,
        name: "Test Room",
        visibility: "public",
        passwordHash: null,
        timeLimitSeconds: 30,
        questionCount: 3,
      });

      const questionIds = [101, 102, 103];
      const result = await repository.updateBattleRoom(created.id, {
        questionIds,
      });

      expect(result).not.toBeNull();
      expect(result!.questionIds).toEqual(questionIds);
    });

    it("returns null for non-existent ID", async () => {
      const result = await repository.updateBattleRoom(99999, {
        status: "finished",
      });
      expect(result).toBeNull();
    });
  });

  describe("deleteBattleRoom", () => {
    it("deletes an existing battle room", async () => {
      const created = await repository.createBattleRoom({
        hostUserId: testUserId,
        studySetId: testStudySetId,
        name: "Delete Me",
        visibility: "public",
        passwordHash: null,
        timeLimitSeconds: 30,
        questionCount: 10,
      });

      await repository.deleteBattleRoom(created.id);

      const result = await repository.findBattleRoomById(created.id);
      expect(result).toBeNull();
    });

    it("no-ops for non-existent ID", async () => {
      await expect(
        repository.deleteBattleRoom(99999)
      ).resolves.toBeUndefined();
    });
  });

  describe("constraints", () => {
    it("rejects invalid visibility value", async () => {
      await expect(
        ctx.sql`
          INSERT INTO battle_rooms (host_user_id, study_set_id, name, visibility, time_limit_seconds, question_count)
          VALUES (${testUserId}, ${testStudySetId}, 'Room', 'invalid_vis', 30, 10)
        `
      ).rejects.toThrow();
    });

    it("rejects invalid status value", async () => {
      await expect(
        ctx.sql`
          INSERT INTO battle_rooms (host_user_id, study_set_id, name, visibility, status, time_limit_seconds, question_count)
          VALUES (${testUserId}, ${testStudySetId}, 'Room', 'public', 'invalid_status', 30, 10)
        `
      ).rejects.toThrow();
    });

    it("enforces unique publicId", async () => {
      const room = await repository.createBattleRoom({
        hostUserId: testUserId,
        studySetId: testStudySetId,
        name: "Room 1",
        visibility: "public",
        passwordHash: null,
        timeLimitSeconds: 30,
        questionCount: 10,
      });

      await expect(
        ctx.sql`
          INSERT INTO battle_rooms (public_id, host_user_id, study_set_id, name, visibility, time_limit_seconds, question_count)
          VALUES (${room.publicId}, ${testUserId}, ${testStudySetId}, 'Room 2', 'public', 30, 10)
        `
      ).rejects.toThrow();
    });
  });
});
