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

  hasActivityToday(timezone?: string): boolean {
    if (!this.lastActivityDate) {
      return false;
    }
    const today = getLocalDateString(new Date(), timezone);
    return this.lastActivityDate === today;
  }

  isActive(timezone?: string): boolean {
    if (!this.lastActivityDate) {
      return false;
    }
    const today = getLocalDateString(new Date(), timezone);
    const yesterday = getLocalDateString(new Date(Date.now() - 86400000), timezone);
    return this.lastActivityDate === today || this.lastActivityDate === yesterday;
  }
}
