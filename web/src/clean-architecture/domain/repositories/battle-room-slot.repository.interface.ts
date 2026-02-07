import {
  BattleRoomSlotEntity,
  BattleRoomSlotType,
} from "../entities/battle-room-slot.entity";

export interface IBattleRoomSlotRepository {
  /**
   * Create multiple slots for a battle room in a single batch.
   */
  createBattleRoomSlotsBatch(
    slots: {
      roomId: number;
      slotIndex: number;
      slotType: BattleRoomSlotType;
      userId: string | null;
      botName: string | null;
    }[]
  ): Promise<BattleRoomSlotEntity[]>;

  /**
   * Find all slots for a battle room, ordered by slotIndex.
   */
  findSlotsByRoomId(roomId: number): Promise<BattleRoomSlotEntity[]>;

  /**
   * Find the slot a user is currently in (across all rooms).
   * Returns null if the user is not in any room.
   */
  findSlotByUserId(userId: string): Promise<BattleRoomSlotEntity | null>;

  /**
   * Update a slot's type, userId, or botName.
   */
  updateSlot(
    id: number,
    params: {
      slotType?: BattleRoomSlotType;
      userId?: string | null;
      botName?: string | null;
    }
  ): Promise<BattleRoomSlotEntity | null>;

  /**
   * Delete all slots for a battle room.
   */
  deleteSlotsByRoomId(roomId: number): Promise<void>;
}
