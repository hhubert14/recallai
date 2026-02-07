import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  users,
  videos,
  studySets,
  battleRooms,
} from "@/drizzle/schema";
import { DrizzleBattleRoomSlotRepository } from "./battle-room-slot.repository.drizzle";
import {
  createTestContext,
  IntegrationTestContext,
} from "@/test-utils/integration-test-context";

/**
 * Integration tests for DrizzleBattleRoomSlotRepository
 *
 * Requires test database to be running:
 *   npm run db:migrate:test
 *
 * Run with:
 *   npm run test:integration
 */

describe("DrizzleBattleRoomSlotRepository (integration)", () => {
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
  let repository: DrizzleBattleRoomSlotRepository;

  let testUserId: string;
  let secondUserId: string;
  let testRoomId: number;

  beforeEach(async () => {
    ctx = await createTestContext();
    repository = new DrizzleBattleRoomSlotRepository(ctx.db);

    // Create first test user
    testUserId = crypto.randomUUID();
    await ctx.sql`INSERT INTO auth.users (id, email) VALUES (${testUserId}, 'test@example.com')`;
    await ctx.db.insert(users).values({
      id: testUserId,
      email: "test@example.com",
    });

    // Create second test user
    secondUserId = crypto.randomUUID();
    await ctx.sql`INSERT INTO auth.users (id, email) VALUES (${secondUserId}, 'test2@example.com')`;
    await ctx.db.insert(users).values({
      id: secondUserId,
      email: "test2@example.com",
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
  });

  afterEach(async () => {
    await ctx.cleanup();
  });

  describe("createBattleRoomSlotsBatch", () => {
    it("creates multiple slots and returns entities", async () => {
      const result = await repository.createBattleRoomSlotsBatch([
        {
          roomId: testRoomId,
          slotIndex: 0,
          slotType: "player",
          userId: testUserId,
          botName: null,
        },
        {
          roomId: testRoomId,
          slotIndex: 1,
          slotType: "empty",
          userId: null,
          botName: null,
        },
        {
          roomId: testRoomId,
          slotIndex: 2,
          slotType: "bot",
          userId: null,
          botName: "QuizBot",
        },
        {
          roomId: testRoomId,
          slotIndex: 3,
          slotType: "locked",
          userId: null,
          botName: null,
        },
      ]);

      expect(result).toHaveLength(4);
      expect(result[0].slotType).toBe("player");
      expect(result[0].userId).toBe(testUserId);
      expect(result[1].slotType).toBe("empty");
      expect(result[2].slotType).toBe("bot");
      expect(result[2].botName).toBe("QuizBot");
      expect(result[3].slotType).toBe("locked");
    });

    it("returns empty array for empty input", async () => {
      const result = await repository.createBattleRoomSlotsBatch([]);
      expect(result).toHaveLength(0);
    });
  });

  describe("findSlotsByRoomId", () => {
    it("returns slots ordered by slotIndex", async () => {
      await repository.createBattleRoomSlotsBatch([
        {
          roomId: testRoomId,
          slotIndex: 2,
          slotType: "empty",
          userId: null,
          botName: null,
        },
        {
          roomId: testRoomId,
          slotIndex: 0,
          slotType: "player",
          userId: testUserId,
          botName: null,
        },
        {
          roomId: testRoomId,
          slotIndex: 1,
          slotType: "empty",
          userId: null,
          botName: null,
        },
      ]);

      const result = await repository.findSlotsByRoomId(testRoomId);

      expect(result).toHaveLength(3);
      expect(result[0].slotIndex).toBe(0);
      expect(result[1].slotIndex).toBe(1);
      expect(result[2].slotIndex).toBe(2);
    });

    it("returns empty array for room with no slots", async () => {
      const result = await repository.findSlotsByRoomId(99999);
      expect(result).toHaveLength(0);
    });
  });

  describe("findSlotByUserId", () => {
    it("finds the slot a user is in", async () => {
      await repository.createBattleRoomSlotsBatch([
        {
          roomId: testRoomId,
          slotIndex: 0,
          slotType: "player",
          userId: testUserId,
          botName: null,
        },
      ]);

      const result = await repository.findSlotByUserId(testUserId);

      expect(result).not.toBeNull();
      expect(result!.userId).toBe(testUserId);
      expect(result!.roomId).toBe(testRoomId);
    });

    it("returns null for user not in any room", async () => {
      const result = await repository.findSlotByUserId(
        "00000000-0000-0000-0000-000000000000"
      );
      expect(result).toBeNull();
    });
  });

  describe("updateSlot", () => {
    it("updates slotType and userId", async () => {
      const [created] = await repository.createBattleRoomSlotsBatch([
        {
          roomId: testRoomId,
          slotIndex: 0,
          slotType: "empty",
          userId: null,
          botName: null,
        },
      ]);

      const result = await repository.updateSlot(created.id, {
        slotType: "player",
        userId: testUserId,
      });

      expect(result).not.toBeNull();
      expect(result!.slotType).toBe("player");
      expect(result!.userId).toBe(testUserId);
    });

    it("returns null for non-existent slot", async () => {
      const result = await repository.updateSlot(99999, {
        slotType: "locked",
      });
      expect(result).toBeNull();
    });
  });

  describe("deleteSlotsByRoomId", () => {
    it("deletes all slots for a room", async () => {
      await repository.createBattleRoomSlotsBatch([
        {
          roomId: testRoomId,
          slotIndex: 0,
          slotType: "player",
          userId: testUserId,
          botName: null,
        },
        {
          roomId: testRoomId,
          slotIndex: 1,
          slotType: "empty",
          userId: null,
          botName: null,
        },
      ]);

      await repository.deleteSlotsByRoomId(testRoomId);

      const result = await repository.findSlotsByRoomId(testRoomId);
      expect(result).toHaveLength(0);
    });

    it("no-ops for non-existent room", async () => {
      await expect(
        repository.deleteSlotsByRoomId(99999)
      ).resolves.toBeUndefined();
    });
  });

  describe("constraints", () => {
    it("enforces unique (roomId, slotIndex)", async () => {
      await repository.createBattleRoomSlotsBatch([
        {
          roomId: testRoomId,
          slotIndex: 0,
          slotType: "empty",
          userId: null,
          botName: null,
        },
      ]);

      await expect(
        repository.createBattleRoomSlotsBatch([
          {
            roomId: testRoomId,
            slotIndex: 0,
            slotType: "player",
            userId: testUserId,
            botName: null,
          },
        ])
      ).rejects.toThrow();
    });

    it("rejects invalid slotType value", async () => {
      await expect(
        ctx.sql`
          INSERT INTO battle_room_slots (room_id, slot_index, slot_type)
          VALUES (${testRoomId}, 0, 'invalid_type')
        `
      ).rejects.toThrow();
    });

    it("enforces partial unique on userId (one room per user)", async () => {
      // Create a second room
      const [room2] = await ctx.db
        .insert(battleRooms)
        .values({
          hostUserId: testUserId,
          studySetId: (
            await ctx.db.select().from(studySets).limit(1)
          )[0].id,
          name: "Room 2",
          visibility: "public",
          timeLimitSeconds: 30,
          questionCount: 10,
        })
        .returning();

      // Put user in first room
      await repository.createBattleRoomSlotsBatch([
        {
          roomId: testRoomId,
          slotIndex: 0,
          slotType: "player",
          userId: testUserId,
          botName: null,
        },
      ]);

      // Attempt to put same user in second room should fail
      await expect(
        repository.createBattleRoomSlotsBatch([
          {
            roomId: room2.id,
            slotIndex: 0,
            slotType: "player",
            userId: testUserId,
            botName: null,
          },
        ])
      ).rejects.toThrow();
    });

    it("allows multiple slots with null userId", async () => {
      const result = await repository.createBattleRoomSlotsBatch([
        {
          roomId: testRoomId,
          slotIndex: 0,
          slotType: "empty",
          userId: null,
          botName: null,
        },
        {
          roomId: testRoomId,
          slotIndex: 1,
          slotType: "empty",
          userId: null,
          botName: null,
        },
      ]);

      expect(result).toHaveLength(2);
    });
  });
});
