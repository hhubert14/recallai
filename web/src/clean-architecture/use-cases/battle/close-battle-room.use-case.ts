import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";

export interface CloseBattleRoomInput {
  userId: string;
  roomPublicId: string;
}

export class CloseBattleRoomUseCase {
  constructor(
    private readonly battleRoomRepository: IBattleRoomRepository,
    private readonly battleRoomSlotRepository: IBattleRoomSlotRepository
  ) {}

  async execute(input: CloseBattleRoomInput): Promise<void> {
    const { userId, roomPublicId } = input;

    const room =
      await this.battleRoomRepository.findBattleRoomByPublicId(roomPublicId);
    if (!room) {
      throw new Error("Battle room not found");
    }

    if (!room.isWaiting()) {
      throw new Error("Room can only be closed while in waiting status");
    }

    const slots = await this.battleRoomSlotRepository.findSlotsByRoomId(
      room.id
    );
    const userSlot = slots.find((s) => s.userId === userId && s.isPlayer());
    if (!userSlot) {
      throw new Error("User is not in this battle room");
    }

    await this.battleRoomRepository.deleteBattleRoom(room.id);
  }
}
