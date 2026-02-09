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
      const existingRoom =
        await this.battleRoomRepository.findBattleRoomById(existingSlot.roomId);
      if (!existingRoom || existingRoom.isFinished()) {
        // Stale slot from a finished/deleted game — clean up
        if (existingRoom) {
          await this.battleRoomRepository.deleteBattleRoom(existingRoom.id);
        } else {
          await this.battleRoomSlotRepository.deleteSlotsByRoomId(
            existingSlot.roomId
          );
        }
      } else {
        throw new Error("User is already in a battle room");
      }
    }

    // Check password if private
    if (room.visibility === "private") {
      if (!password || !room.passwordHash) {
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

    // Update the slot to player (optimistic concurrency: only if still empty)
    const updatedSlot = await this.battleRoomSlotRepository.updateSlot(
      emptySlot.id,
      { slotType: "player", userId, botName: null },
      "empty"
    );
    if (!updatedSlot) {
      throw new Error("Failed to update slot");
    }

    return updatedSlot;
  }
}
