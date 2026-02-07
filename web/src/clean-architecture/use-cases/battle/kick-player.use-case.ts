import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { BattleRoomSlotEntity } from "@/clean-architecture/domain/entities/battle-room-slot.entity";

export interface KickPlayerInput {
  userId: string;
  roomPublicId: string;
  slotIndex: number;
}

export class KickPlayerUseCase {
  constructor(
    private readonly battleRoomRepository: IBattleRoomRepository,
    private readonly battleRoomSlotRepository: IBattleRoomSlotRepository
  ) {}

  async execute(input: KickPlayerInput): Promise<BattleRoomSlotEntity> {
    const { userId, roomPublicId, slotIndex } = input;

    // Find the room
    const room =
      await this.battleRoomRepository.findBattleRoomByPublicId(roomPublicId);
    if (!room) {
      throw new Error("Battle room not found");
    }

    // Only host can kick players
    if (!room.isHost(userId)) {
      throw new Error("Only the host can kick players");
    }

    // Room must be in waiting status
    if (!room.isWaiting()) {
      throw new Error("Battle room is not in waiting status");
    }

    // Validate slot index (0-3)
    if (slotIndex < 0 || slotIndex > 3) {
      throw new Error("Invalid slot index");
    }

    // Cannot kick yourself (host is always slot 0)
    if (slotIndex === 0) {
      throw new Error("Cannot kick yourself");
    }

    // Find the target slot
    const slots = await this.battleRoomSlotRepository.findSlotsByRoomId(
      room.id
    );
    const targetSlot = slots.find((s) => s.slotIndex === slotIndex);
    if (!targetSlot) {
      throw new Error("Invalid slot index");
    }

    // Target must be a player slot
    if (!targetSlot.isPlayer()) {
      throw new Error("Slot does not contain a player");
    }

    // Clear the slot
    const updatedSlot = await this.battleRoomSlotRepository.updateSlot(
      targetSlot.id,
      { slotType: "empty", userId: null, botName: null }
    );
    if (!updatedSlot) {
      throw new Error("Failed to update slot");
    }

    return updatedSlot;
  }
}
