import { IStreakRepository } from "@/clean-architecture/domain/repositories/streak.repository.interface";

export type StreakDto = {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
};

export class GetStreakUseCase {
  constructor(private readonly streakRepository: IStreakRepository) {}

  async execute(userId: string, timezone?: string): Promise<StreakDto> {
    const streak = await this.streakRepository.findStreakByUserId(userId);

    if (!streak) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
      };
    }

    // Use entity method to check if streak is still active (pass timezone)
    const isActive = streak.isActive(timezone);

    return {
      currentStreak: isActive ? streak.currentStreak : 0,
      longestStreak: streak.longestStreak,
      lastActivityDate: streak.lastActivityDate,
    };
  }
}
