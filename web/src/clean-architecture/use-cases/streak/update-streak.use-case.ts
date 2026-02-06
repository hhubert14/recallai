import { IStreakRepository } from "@/clean-architecture/domain/repositories/streak.repository.interface";
import { StreakEntity } from "@/clean-architecture/domain/entities/streak.entity";
import { getLocalDateString } from "@/lib/date-utils";

export class UpdateStreakUseCase {
  constructor(private readonly streakRepository: IStreakRepository) {}

  async execute(userId: string, timezone?: string): Promise<StreakEntity> {
    const today = getLocalDateString(new Date(), timezone);
    const yesterday = getLocalDateString(
      new Date(Date.now() - 86400000),
      timezone
    );

    const existing = await this.streakRepository.findStreakByUserId(userId);

    // First activity ever
    if (!existing) {
      return this.streakRepository.upsertStreak(userId, 1, 1, today);
    }

    // Already active today - idempotent
    if (existing.lastActivityDate === today) {
      return existing;
    }

    // Continue streak (yesterday) or reset (older)
    const newCurrent =
      existing.lastActivityDate === yesterday ? existing.currentStreak + 1 : 1;
    const newLongest = Math.max(existing.longestStreak, newCurrent);

    return this.streakRepository.upsertStreak(
      userId,
      newCurrent,
      newLongest,
      today
    );
  }
}
