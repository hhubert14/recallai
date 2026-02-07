import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { BattleRoomSlotEntity, BattleRoomSlotType } from "@/clean-architecture/domain/entities/battle-room-slot.entity";
import { generateBotName } from "@/lib/battle/bot-names";

export interface UpdateBattleRoomSlotInput {
  userId: string;
  roomPublicId: string;
  slotIndex: number;
  slotType: "empty" | "bot" | "locked";
}

export class UpdateBattleRoomSlotUseCase {
  constructor(
    private readonly battleRoomRepository: IBattleRoomRepository,
    private readonly battleRoomSlotRepository: IBattleRoomSlotRepository
  ) {}

  async execute(
    input: UpdateBattleRoomSlotInput
  ): Promise<BattleRoomSlotEntity> {
    const { userId, roomPublicId, slotIndex, slotType } = input;

    // Find the room
    const room =
      await this.battleRoomRepository.findBattleRoomByPublicId(roomPublicId);
    if (!room) {
      throw new Error("Battle room not found");
    }

    // Only host can modify slots
    if (!room.isHost(userId)) {
      throw new Error("Only the host can modify slots");
    }

    // Room must be in waiting status
    if (!room.isWaiting()) {
      throw new Error("Battle room is not in waiting status");
    }

    // Validate slot index (0-3)
    if (slotIndex < 0 || slotIndex > 3) {
      throw new Error("Invalid slot index");
    }

    // Cannot modify the host slot (slot 0)
    if (slotIndex === 0) {
      throw new Error("Cannot modify the host slot");
    }

    // Find the target slot
    const slots = await this.battleRoomSlotRepository.findSlotsByRoomId(
      room.id
    );
    const targetSlot = slots.find((s) => s.slotIndex === slotIndex);
    if (!targetSlot) {
      throw new Error("Invalid slot index");
    }

    // Cannot modify a slot occupied by a player
    if (targetSlot.isPlayer()) {
      throw new Error("Cannot modify a slot occupied by a player");
    }

    // Build update params
    const updateParams: {
      slotType: BattleRoomSlotType;
      userId: string | null;
      botName: string | null;
    } = {
      slotType,
      userId: null,
      botName: slotType === "bot" ? generateBotName() : null,
    };

    const updatedSlot = await this.battleRoomSlotRepository.updateSlot(
      targetSlot.id,
      updateParams
    );

    return updatedSlot!;
  }
}
