export type BattleRoomSlotType = "empty" | "player" | "bot" | "locked";

export class BattleRoomSlotEntity {
  constructor(
    public readonly id: number,
    public readonly roomId: number,
    public readonly slotIndex: number,
    public readonly slotType: BattleRoomSlotType,
    public readonly userId: string | null,
    public readonly botName: string | null,
    public readonly createdAt: string
  ) {}

  isEmpty(): boolean {
    return this.slotType === "empty";
  }

  isPlayer(): boolean {
    return this.slotType === "player";
  }

  isBot(): boolean {
    return this.slotType === "bot";
  }

  isLocked(): boolean {
    return this.slotType === "locked";
  }
}
