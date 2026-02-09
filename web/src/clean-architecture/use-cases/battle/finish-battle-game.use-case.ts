import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";

export interface FinishBattleGameInput {
  userId: string;
  roomPublicId: string;
}

export class FinishBattleGameUseCase {
  constructor(
    private readonly battleRoomRepository: IBattleRoomRepository,
    private readonly battleRoomSlotRepository: IBattleRoomSlotRepository
  ) {}

  async execute(input: FinishBattleGameInput): Promise<BattleRoomEntity> {
    const { userId, roomPublicId } = input;

    const room =
      await this.battleRoomRepository.findBattleRoomByPublicId(roomPublicId);
    if (!room) throw new Error("Battle room not found");
    if (!room.isInGame()) throw new Error("Battle room is not in game");

    // Any participant can finish the game (supports host-disconnect fallback)
    const slot = await this.battleRoomSlotRepository.findSlotByUserId(userId);
    if (!slot || slot.roomId !== room.id)
      throw new Error("User is not a participant in this battle");

    const updatedRoom = await this.battleRoomRepository.updateBattleRoom(
      room.id,
      {
        status: "finished",
        currentQuestionIndex: null,
        currentQuestionStartedAt: null,
      }
    );
    if (!updatedRoom) throw new Error("Failed to update battle room");

    // Delete room (CASCADE deletes slots) so users can create/join new rooms
    await this.battleRoomRepository.deleteBattleRoom(room.id);

    return updatedRoom;
  }
}
