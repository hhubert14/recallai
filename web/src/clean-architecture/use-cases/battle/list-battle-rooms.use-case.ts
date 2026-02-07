import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";

export interface SlotSummary {
  playerCount: number;
  botCount: number;
  openSlots: number;
}

export interface BattleRoomListItem {
  room: BattleRoomEntity;
  slotSummary: SlotSummary;
}

export class ListBattleRoomsUseCase {
  constructor(
    private readonly battleRoomRepository: IBattleRoomRepository,
    private readonly battleRoomSlotRepository: IBattleRoomSlotRepository
  ) {}

  async execute(): Promise<BattleRoomListItem[]> {
    const rooms =
      await this.battleRoomRepository.findBattleRoomsByStatus("waiting");

    const results: BattleRoomListItem[] = [];

    for (const room of rooms) {
      const slots = await this.battleRoomSlotRepository.findSlotsByRoomId(
        room.id
      );

      const playerCount = slots.filter((s) => s.isPlayer()).length;
      const botCount = slots.filter((s) => s.isBot()).length;
      const openSlots = slots.filter((s) => s.isEmpty()).length;

      results.push({
        room,
        slotSummary: { playerCount, botCount, openSlots },
      });
    }

    return results;
  }
}
