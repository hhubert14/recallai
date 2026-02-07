import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";
import { BattleRoomSlotEntity } from "@/clean-architecture/domain/entities/battle-room-slot.entity";

export interface GetBattleRoomResult {
  room: BattleRoomEntity;
  slots: BattleRoomSlotEntity[];
}

export class GetBattleRoomUseCase {
  constructor(
    private readonly battleRoomRepository: IBattleRoomRepository,
    private readonly battleRoomSlotRepository: IBattleRoomSlotRepository
  ) {}

  async execute(publicId: string): Promise<GetBattleRoomResult> {
    const room =
      await this.battleRoomRepository.findBattleRoomByPublicId(publicId);
    if (!room) {
      throw new Error("Battle room not found");
    }

    const slots = await this.battleRoomSlotRepository.findSlotsByRoomId(
      room.id
    );

    return { room, slots };
  }
}
