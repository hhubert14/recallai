export type BattleRoomVisibility = "public" | "private";
export type BattleRoomStatus = "waiting" | "in_game" | "finished";

export class BattleRoomEntity {
  constructor(
    public readonly id: number,
    public readonly publicId: string,
    public readonly hostUserId: string,
    public readonly studySetId: number,
    public readonly name: string,
    public readonly visibility: BattleRoomVisibility,
    public readonly passwordHash: string | null,
    public readonly status: BattleRoomStatus,
    public readonly timeLimitSeconds: number,
    public readonly questionCount: number,
    public readonly currentQuestionIndex: number | null,
    public readonly currentQuestionStartedAt: string | null,
    public readonly questionIds: number[] | null,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  isWaiting(): boolean {
    return this.status === "waiting";
  }

  isInGame(): boolean {
    return this.status === "in_game";
  }

  isFinished(): boolean {
    return this.status === "finished";
  }

  isHost(userId: string): boolean {
    return this.hostUserId === userId;
  }
}
