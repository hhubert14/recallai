import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { users } from "@/drizzle/schema";
import { DrizzleStreakRepository } from "./streak.repository.drizzle";
import {
  createTestContext,
  IntegrationTestContext,
} from "@/test-utils/integration-test-context";

describe("DrizzleStreakRepository (integration)", () => {
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
  let streakRepo: DrizzleStreakRepository;

  let testUserId: string;

  beforeEach(async () => {
    ctx = await createTestContext();
    streakRepo = new DrizzleStreakRepository(ctx.db);

    // Create test user (must insert into auth.users first due to FK constraint)
    testUserId = crypto.randomUUID();
    await ctx.sql`INSERT INTO auth.users (id, email) VALUES (${testUserId}, 'test@example.com')`;
    await ctx.db.insert(users).values({
      id: testUserId,
      email: "test@example.com",
    });
  });

  afterEach(async () => {
    await ctx.cleanup();
  });

  describe("findStreakByUserId", () => {
    it("returns null when user has no streak record", async () => {
      const result = await streakRepo.findStreakByUserId(testUserId);
      expect(result).toBeNull();
    });

    it("returns streak entity when user has a streak record", async () => {
      // First create a streak
      await streakRepo.upsertStreak(testUserId, 5, 10, "2025-01-28");

      const result = await streakRepo.findStreakByUserId(testUserId);

      expect(result).not.toBeNull();
      expect(result!.userId).toBe(testUserId);
      expect(result!.currentStreak).toBe(5);
      expect(result!.longestStreak).toBe(10);
      expect(result!.lastActivityDate).toBe("2025-01-28");
    });
  });

  describe("upsertStreak", () => {
    it("creates a new streak record when none exists", async () => {
      const result = await streakRepo.upsertStreak(testUserId, 1, 1, "2025-01-28");

      expect(result.userId).toBe(testUserId);
      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(1);
      expect(result.lastActivityDate).toBe("2025-01-28");
    });

    it("updates existing streak record", async () => {
      // Create initial streak
      await streakRepo.upsertStreak(testUserId, 1, 1, "2025-01-27");

      // Update streak
      const result = await streakRepo.upsertStreak(testUserId, 2, 2, "2025-01-28");

      expect(result.userId).toBe(testUserId);
      expect(result.currentStreak).toBe(2);
      expect(result.longestStreak).toBe(2);
      expect(result.lastActivityDate).toBe("2025-01-28");
    });

    it("handles concurrent upserts gracefully (idempotent for same day)", async () => {
      // Simulate two concurrent requests on the same day
      const [result1, result2] = await Promise.all([
        streakRepo.upsertStreak(testUserId, 1, 1, "2025-01-28"),
        streakRepo.upsertStreak(testUserId, 1, 1, "2025-01-28"),
      ]);

      // Both should succeed and return consistent data
      expect(result1.currentStreak).toBe(1);
      expect(result2.currentStreak).toBe(1);

      // Verify only one record exists
      const final = await streakRepo.findStreakByUserId(testUserId);
      expect(final).not.toBeNull();
      expect(final!.currentStreak).toBe(1);
    });

    it("preserves longest streak when current resets", async () => {
      // Build up a streak
      await streakRepo.upsertStreak(testUserId, 5, 5, "2025-01-25");

      // Reset current but keep longest
      const result = await streakRepo.upsertStreak(testUserId, 1, 5, "2025-01-28");

      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(5);
    });
  });
});
