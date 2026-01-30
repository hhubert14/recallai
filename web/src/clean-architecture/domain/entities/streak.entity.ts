import { getLocalDateString } from "@/lib/date-utils";

export class StreakEntity {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly currentStreak: number,
    public readonly longestStreak: number,
    public readonly lastActivityDate: string | null,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  hasActivityToday(): boolean {
    if (!this.lastActivityDate) {
      return false;
    }
    const today = getLocalDateString();
    return this.lastActivityDate === today;
  }

  isActive(): boolean {
    if (!this.lastActivityDate) {
      return false;
    }
    const today = getLocalDateString();
    const yesterday = getLocalDateString(new Date(Date.now() - 86400000));
    return this.lastActivityDate === today || this.lastActivityDate === yesterday;
  }
}
