import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { UpdateStreakUseCase } from "./update-streak.use-case";
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

describe("UpdateStreakUseCase", () => {
  let useCase: UpdateStreakUseCase;
  let mockStreakRepo: IStreakRepository;

  beforeEach(() => {
    vi.useFakeTimers();

    mockStreakRepo = {
      findStreakByUserId: vi.fn(),
      upsertStreak: vi.fn(),
    };

    useCase = new UpdateStreakUseCase(mockStreakRepo);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("first activity ever", () => {
    it("creates a new streak with currentStreak=1 and longestStreak=1", async () => {
      vi.setSystemTime(new Date(2025, 0, 28, 14, 30, 0)); // Jan 28, 2025, 2:30 PM local

      vi.mocked(mockStreakRepo.findStreakByUserId).mockResolvedValue(null);
      vi.mocked(mockStreakRepo.upsertStreak).mockResolvedValue(
        createMockStreak({
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: "2025-01-28",
        })
      );

      const result = await useCase.execute("user-123");

      expect(mockStreakRepo.upsertStreak).toHaveBeenCalledWith(
        "user-123",
        1,
        1,
        "2025-01-28"
      );
      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(1);
    });
  });

  describe("already active today", () => {
    it("returns existing streak without updating (idempotent)", async () => {
      vi.setSystemTime(new Date(2025, 0, 28, 14, 30, 0)); // Jan 28, 2025, 2:30 PM local

      const existingStreak = createMockStreak({
        currentStreak: 5,
        longestStreak: 10,
        lastActivityDate: "2025-01-28",
      });
      vi.mocked(mockStreakRepo.findStreakByUserId).mockResolvedValue(existingStreak);

      const result = await useCase.execute("user-123");

      expect(mockStreakRepo.upsertStreak).not.toHaveBeenCalled();
      expect(result.currentStreak).toBe(5);
      expect(result.longestStreak).toBe(10);
    });
  });

  describe("continue streak (yesterday)", () => {
    it("increments currentStreak by 1", async () => {
      vi.setSystemTime(new Date(2025, 0, 28, 14, 30, 0)); // Jan 28, 2025, 2:30 PM local

      const existingStreak = createMockStreak({
        currentStreak: 5,
        longestStreak: 5,
        lastActivityDate: "2025-01-27",
      });
      vi.mocked(mockStreakRepo.findStreakByUserId).mockResolvedValue(existingStreak);
      vi.mocked(mockStreakRepo.upsertStreak).mockResolvedValue(
        createMockStreak({
          currentStreak: 6,
          longestStreak: 6,
          lastActivityDate: "2025-01-28",
        })
      );

      const result = await useCase.execute("user-123");

      expect(mockStreakRepo.upsertStreak).toHaveBeenCalledWith(
        "user-123",
        6,
        6,
        "2025-01-28"
      );
      expect(result.currentStreak).toBe(6);
    });

    it("updates longestStreak when current exceeds it", async () => {
      vi.setSystemTime(new Date(2025, 0, 28, 14, 30, 0)); // Jan 28, 2025, 2:30 PM local

      const existingStreak = createMockStreak({
        currentStreak: 5,
        longestStreak: 5,
        lastActivityDate: "2025-01-27",
      });
      vi.mocked(mockStreakRepo.findStreakByUserId).mockResolvedValue(existingStreak);
      vi.mocked(mockStreakRepo.upsertStreak).mockResolvedValue(
        createMockStreak({
          currentStreak: 6,
          longestStreak: 6,
          lastActivityDate: "2025-01-28",
        })
      );

      await useCase.execute("user-123");

      expect(mockStreakRepo.upsertStreak).toHaveBeenCalledWith(
        "user-123",
        6,
        6,
        "2025-01-28"
      );
    });

    it("preserves longestStreak when current is below it", async () => {
      vi.setSystemTime(new Date(2025, 0, 28, 14, 30, 0)); // Jan 28, 2025, 2:30 PM local

      const existingStreak = createMockStreak({
        currentStreak: 3,
        longestStreak: 10,
        lastActivityDate: "2025-01-27",
      });
      vi.mocked(mockStreakRepo.findStreakByUserId).mockResolvedValue(existingStreak);
      vi.mocked(mockStreakRepo.upsertStreak).mockResolvedValue(
        createMockStreak({
          currentStreak: 4,
          longestStreak: 10,
          lastActivityDate: "2025-01-28",
        })
      );

      await useCase.execute("user-123");

      expect(mockStreakRepo.upsertStreak).toHaveBeenCalledWith(
        "user-123",
        4,
        10,
        "2025-01-28"
      );
    });
  });

  describe("break streak (more than one day)", () => {
    it("resets currentStreak to 1 when gap is 2 days", async () => {
      vi.setSystemTime(new Date(2025, 0, 28, 14, 30, 0)); // Jan 28, 2025, 2:30 PM local

      const existingStreak = createMockStreak({
        currentStreak: 10,
        longestStreak: 15,
        lastActivityDate: "2025-01-26",
      });
      vi.mocked(mockStreakRepo.findStreakByUserId).mockResolvedValue(existingStreak);
      vi.mocked(mockStreakRepo.upsertStreak).mockResolvedValue(
        createMockStreak({
          currentStreak: 1,
          longestStreak: 15,
          lastActivityDate: "2025-01-28",
        })
      );

      const result = await useCase.execute("user-123");

      expect(mockStreakRepo.upsertStreak).toHaveBeenCalledWith(
        "user-123",
        1,
        15,
        "2025-01-28"
      );
      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(15);
    });

    it("resets currentStreak to 1 when gap is many days", async () => {
      vi.setSystemTime(new Date(2025, 0, 28, 14, 30, 0)); // Jan 28, 2025, 2:30 PM local

      const existingStreak = createMockStreak({
        currentStreak: 100,
        longestStreak: 100,
        lastActivityDate: "2024-12-01",
      });
      vi.mocked(mockStreakRepo.findStreakByUserId).mockResolvedValue(existingStreak);
      vi.mocked(mockStreakRepo.upsertStreak).mockResolvedValue(
        createMockStreak({
          currentStreak: 1,
          longestStreak: 100,
          lastActivityDate: "2025-01-28",
        })
      );

      const result = await useCase.execute("user-123");

      expect(mockStreakRepo.upsertStreak).toHaveBeenCalledWith(
        "user-123",
        1,
        100,
        "2025-01-28"
      );
      expect(result.currentStreak).toBe(1);
    });
  });

  describe("edge cases", () => {
    it("handles null lastActivityDate (should reset to 1)", async () => {
      vi.setSystemTime(new Date(2025, 0, 28, 14, 30, 0)); // Jan 28, 2025, 2:30 PM local

      const existingStreak = createMockStreak({
        currentStreak: 0,
        longestStreak: 5,
        lastActivityDate: null,
      });
      vi.mocked(mockStreakRepo.findStreakByUserId).mockResolvedValue(existingStreak);
      vi.mocked(mockStreakRepo.upsertStreak).mockResolvedValue(
        createMockStreak({
          currentStreak: 1,
          longestStreak: 5,
          lastActivityDate: "2025-01-28",
        })
      );

      const result = await useCase.execute("user-123");

      expect(mockStreakRepo.upsertStreak).toHaveBeenCalledWith(
        "user-123",
        1,
        5,
        "2025-01-28"
      );
      expect(result.currentStreak).toBe(1);
    });
  });
});
