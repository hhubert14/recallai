import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";

export interface LeaveBattleRoomInput {
  userId: string;
  roomPublicId: string;
}

export class LeaveBattleRoomUseCase {
  constructor(
    private readonly battleRoomRepository: IBattleRoomRepository,
    private readonly battleRoomSlotRepository: IBattleRoomSlotRepository
  ) {}

  async execute(input: LeaveBattleRoomInput): Promise<void> {
    const { userId, roomPublicId } = input;

    // Find the room
    const room =
      await this.battleRoomRepository.findBattleRoomByPublicId(roomPublicId);
    if (!room) {
      throw new Error("Battle room not found");
    }

    // Find user's slot in this room
    const slots = await this.battleRoomSlotRepository.findSlotsByRoomId(
      room.id
    );
    const userSlot = slots.find((s) => s.userId === userId && s.isPlayer());
    if (!userSlot) {
      throw new Error("User is not in this battle room");
    }

    // Host leaves → delete entire room (cascade deletes slots)
    if (room.isHost(userId)) {
      await this.battleRoomRepository.deleteBattleRoom(room.id);
      return;
    }

    // Non-host leaves → clear their slot
    await this.battleRoomSlotRepository.updateSlot(userSlot.id, {
      slotType: "empty",
      userId: null,
      botName: null,
    });
  }
}
