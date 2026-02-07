import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";

export interface FinishBattleGameInput {
  userId: string;
  roomPublicId: string;
}

export class FinishBattleGameUseCase {
  constructor(
    private readonly battleRoomRepository: IBattleRoomRepository
  ) {}

  async execute(input: FinishBattleGameInput): Promise<BattleRoomEntity> {
    const { userId, roomPublicId } = input;

    const room =
      await this.battleRoomRepository.findBattleRoomByPublicId(roomPublicId);
    if (!room) throw new Error("Battle room not found");
    if (!room.isHost(userId))
      throw new Error("Only the host can finish the game");
    if (!room.isInGame()) throw new Error("Battle room is not in game");

    const updatedRoom = await this.battleRoomRepository.updateBattleRoom(
      room.id,
      {
        status: "finished",
        currentQuestionIndex: null,
        currentQuestionStartedAt: null,
      }
    );
    if (!updatedRoom) throw new Error("Failed to update battle room");

    return updatedRoom;
  }
}
