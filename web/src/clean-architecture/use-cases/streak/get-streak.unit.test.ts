import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GetStreakUseCase } from "./get-streak.use-case";
import { IStreakRepository } from "@/clean-architecture/domain/repositories/streak.repository.interface";
import { StreakEntity } from "@/clean-architecture/domain/entities/streak.entity";

function createMockStreak(overrides: Partial<StreakEntity> = {}): StreakEntity {
  return new StreakEntity(
    overrides.id ?? 1,
    overrides.userId ?? "user-123",
    overrides.currentStreak ?? 0,
    overrides.longestStreak ?? 0,
    overrides.lastActivityDate ?? null,
    overrides.createdAt ?? "2025-01-01T08:00:00Z",
    overrides.updatedAt ?? "2025-01-01T08:00:00Z"
  );
}

describe("GetStreakUseCase", () => {
  let useCase: GetStreakUseCase;
  let mockStreakRepo: IStreakRepository;

  beforeEach(() => {
    mockStreakRepo = {
      findStreakByUserId: vi.fn(),
      upsertStreak: vi.fn(),
    };

    useCase = new GetStreakUseCase(mockStreakRepo);
  });

  describe("when user has a streak record", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2025, 0, 28, 14, 30, 0)); // Jan 28, 2025, 2:30 PM local
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns streak data", async () => {
      const existingStreak = createMockStreak({
        currentStreak: 5,
        longestStreak: 10,
        lastActivityDate: "2025-01-28",
      });
      vi.mocked(mockStreakRepo.findStreakByUserId).mockResolvedValue(
        existingStreak
      );

      const result = await useCase.execute("user-123");

      expect(result.currentStreak).toBe(5);
      expect(result.longestStreak).toBe(10);
      expect(result.lastActivityDate).toBe("2025-01-28");
    });
  });

  describe("when user has no streak record", () => {
    it("returns default values (zeros)", async () => {
      vi.mocked(mockStreakRepo.findStreakByUserId).mockResolvedValue(null);

      const result = await useCase.execute("user-123");

      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(0);
      expect(result.lastActivityDate).toBeNull();
    });
  });

  describe("when streak exists but is broken", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2025, 1, 1, 14, 30, 0)); // Feb 1, 2025, 2:30 PM local
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns streak data including current=0 scenario", async () => {
      const brokenStreak = createMockStreak({
        currentStreak: 0,
        longestStreak: 15,
        lastActivityDate: "2025-01-20",
      });
      vi.mocked(mockStreakRepo.findStreakByUserId).mockResolvedValue(
        brokenStreak
      );

      const result = await useCase.execute("user-123");

      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(15);
      expect(result.lastActivityDate).toBe("2025-01-20");
    });
  });

  describe("when streak is broken (older than yesterday)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2025, 1, 1, 14, 30, 0)); // Feb 1, 2025, 2:30 PM local
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns currentStreak: 0 when lastActivityDate is 2 days ago", async () => {
      const brokenStreak = createMockStreak({
        currentStreak: 5,
        longestStreak: 10,
        lastActivityDate: "2025-01-30", // 2 days ago
      });
      vi.mocked(mockStreakRepo.findStreakByUserId).mockResolvedValue(
        brokenStreak
      );

      const result = await useCase.execute("user-123");

      expect(result.currentStreak).toBe(0); // Should show 0, not 5!
      expect(result.longestStreak).toBe(10); // Longest streak preserved
      expect(result.lastActivityDate).toBe("2025-01-30");
    });

    it("returns currentStreak: 0 when lastActivityDate is many days ago", async () => {
      const veryOldStreak = createMockStreak({
        currentStreak: 100,
        longestStreak: 100,
        lastActivityDate: "2024-12-01", // 2 months ago
      });
      vi.mocked(mockStreakRepo.findStreakByUserId).mockResolvedValue(
        veryOldStreak
      );

      const result = await useCase.execute("user-123");

      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(100);
    });
  });

  describe("when streak is active", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2025, 1, 1, 14, 30, 0)); // Feb 1, 2025, 2:30 PM local
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns actual currentStreak when lastActivityDate is today", async () => {
      const activeStreak = createMockStreak({
        currentStreak: 7,
        longestStreak: 10,
        lastActivityDate: "2025-02-01", // today
      });
      vi.mocked(mockStreakRepo.findStreakByUserId).mockResolvedValue(
        activeStreak
      );

      const result = await useCase.execute("user-123");

      expect(result.currentStreak).toBe(7); // Show actual value
    });

    it("returns actual currentStreak when lastActivityDate is yesterday", async () => {
      const activeStreak = createMockStreak({
        currentStreak: 7,
        longestStreak: 10,
        lastActivityDate: "2025-01-31", // yesterday
      });
      vi.mocked(mockStreakRepo.findStreakByUserId).mockResolvedValue(
        activeStreak
      );

      const result = await useCase.execute("user-123");

      expect(result.currentStreak).toBe(7); // Show actual value
    });
  });
});
