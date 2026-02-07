import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { BattleRoomSlotEntity } from "@/clean-architecture/domain/entities/battle-room-slot.entity";
import { verifyPassword } from "@/lib/battle/password";

export interface JoinBattleRoomInput {
  userId: string;
  roomPublicId: string;
  password?: string;
}

export class JoinBattleRoomUseCase {
  constructor(
    private readonly battleRoomRepository: IBattleRoomRepository,
    private readonly battleRoomSlotRepository: IBattleRoomSlotRepository
  ) {}

  async execute(input: JoinBattleRoomInput): Promise<BattleRoomSlotEntity> {
    const { userId, roomPublicId, password } = input;

    // Find the room
    const room =
      await this.battleRoomRepository.findBattleRoomByPublicId(roomPublicId);
    if (!room) {
      throw new Error("Battle room not found");
    }

    // Check room is accepting players
    if (!room.isWaiting()) {
      throw new Error("Battle room is not accepting players");
    }

    // Check user is not already in a room
    const existingSlot =
      await this.battleRoomSlotRepository.findSlotByUserId(userId);
    if (existingSlot) {
      throw new Error("User is already in a battle room");
    }

    // Check password if private
    if (room.visibility === "private" && room.passwordHash) {
      if (!password) {
        throw new Error("Incorrect password");
      }
      const valid = await verifyPassword(password, room.passwordHash);
      if (!valid) {
        throw new Error("Incorrect password");
      }
    }

    // Find an empty slot
    const slots = await this.battleRoomSlotRepository.findSlotsByRoomId(
      room.id
    );
    const emptySlot = slots.find((s) => s.isEmpty());
    if (!emptySlot) {
      throw new Error("Battle room is full");
    }

    // Update the slot to player
    const updatedSlot = await this.battleRoomSlotRepository.updateSlot(
      emptySlot.id,
      { slotType: "player", userId, botName: null }
    );
    if (!updatedSlot) {
      throw new Error("Failed to update slot");
    }

    return updatedSlot;
  }
}
