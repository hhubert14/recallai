import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import {
  BattleRoomSlotEntity,
  BattleRoomSlotType,
} from "@/clean-architecture/domain/entities/battle-room-slot.entity";
import { db as defaultDb } from "@/drizzle";
import { dbRetry } from "@/lib/db";
import { battleRoomSlots } from "@/drizzle/schema";
import { eq, asc } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export class DrizzleBattleRoomSlotRepository
  implements IBattleRoomSlotRepository
{
  constructor(private readonly db: PostgresJsDatabase = defaultDb) {}

  async createBattleRoomSlotsBatch(
    slots: {
      roomId: number;
      slotIndex: number;
      slotType: BattleRoomSlotType;
      userId: string | null;
      botName: string | null;
    }[]
  ): Promise<BattleRoomSlotEntity[]> {
    if (slots.length === 0) {
      return [];
    }

    const data = await dbRetry(() =>
      this.db.insert(battleRoomSlots).values(slots).returning()
    );

    return data.map((slot) => this.toEntity(slot));
  }

  async findSlotsByRoomId(
    roomId: number
  ): Promise<BattleRoomSlotEntity[]> {
    const data = await dbRetry(() =>
      this.db
        .select()
        .from(battleRoomSlots)
        .where(eq(battleRoomSlots.roomId, roomId))
        .orderBy(asc(battleRoomSlots.slotIndex))
    );

    return data.map((slot) => this.toEntity(slot));
  }

  async findSlotByUserId(
    userId: string
  ): Promise<BattleRoomSlotEntity | null> {
    const [data] = await dbRetry(() =>
      this.db
        .select()
        .from(battleRoomSlots)
        .where(eq(battleRoomSlots.userId, userId))
        .limit(1)
    );

    if (!data) return null;
    return this.toEntity(data);
  }

  async updateSlot(
    id: number,
    params: {
      slotType?: BattleRoomSlotType;
      userId?: string | null;
      botName?: string | null;
    }
  ): Promise<BattleRoomSlotEntity | null> {
    const updateData: Partial<typeof battleRoomSlots.$inferInsert> = {};

    if (params.slotType !== undefined) {
      updateData.slotType = params.slotType;
    }
    if (params.userId !== undefined) {
      updateData.userId = params.userId;
    }
    if (params.botName !== undefined) {
      updateData.botName = params.botName;
    }

    if (Object.keys(updateData).length === 0) {
      const [data] = await dbRetry(() =>
        this.db
          .select()
          .from(battleRoomSlots)
          .where(eq(battleRoomSlots.id, id))
          .limit(1)
      );
      if (!data) return null;
      return this.toEntity(data);
    }

    const [data] = await dbRetry(() =>
      this.db
        .update(battleRoomSlots)
        .set(updateData)
        .where(eq(battleRoomSlots.id, id))
        .returning()
    );

    if (!data) return null;
    return this.toEntity(data);
  }

  async deleteSlotsByRoomId(roomId: number): Promise<void> {
    await dbRetry(() =>
      this.db
        .delete(battleRoomSlots)
        .where(eq(battleRoomSlots.roomId, roomId))
    );
  }

  private toEntity(
    data: typeof battleRoomSlots.$inferSelect
  ): BattleRoomSlotEntity {
    return new BattleRoomSlotEntity(
      data.id,
      data.roomId,
      data.slotIndex,
      data.slotType as BattleRoomSlotType,
      data.userId,
      data.botName,
      data.createdAt
    );
  }
}
