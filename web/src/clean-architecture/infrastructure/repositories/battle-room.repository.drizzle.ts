import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import {
  BattleRoomEntity,
  BattleRoomStatus,
  BattleRoomVisibility,
} from "@/clean-architecture/domain/entities/battle-room.entity";
import { db as defaultDb } from "@/drizzle";
import { dbRetry } from "@/lib/db";
import { battleRooms } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export class DrizzleBattleRoomRepository implements IBattleRoomRepository {
  constructor(private readonly db: PostgresJsDatabase = defaultDb) {}

  async createBattleRoom(params: {
    hostUserId: string;
    studySetId: number;
    name: string;
    visibility: BattleRoomVisibility;
    passwordHash: string | null;
    timeLimitSeconds: number;
    questionCount: number;
  }): Promise<BattleRoomEntity> {
    const [data] = await dbRetry(() =>
      this.db
        .insert(battleRooms)
        .values({
          hostUserId: params.hostUserId,
          studySetId: params.studySetId,
          name: params.name,
          visibility: params.visibility,
          passwordHash: params.passwordHash,
          timeLimitSeconds: params.timeLimitSeconds,
          questionCount: params.questionCount,
        })
        .returning()
    );

    return this.toEntity(data);
  }

  async findBattleRoomById(id: number): Promise<BattleRoomEntity | null> {
    const [data] = await dbRetry(() =>
      this.db
        .select()
        .from(battleRooms)
        .where(eq(battleRooms.id, id))
        .limit(1)
    );

    if (!data) return null;
    return this.toEntity(data);
  }

  async findBattleRoomByPublicId(
    publicId: string
  ): Promise<BattleRoomEntity | null> {
    const [data] = await dbRetry(() =>
      this.db
        .select()
        .from(battleRooms)
        .where(eq(battleRooms.publicId, publicId))
        .limit(1)
    );

    if (!data) return null;
    return this.toEntity(data);
  }

  async findBattleRoomsByStatus(
    status: BattleRoomStatus
  ): Promise<BattleRoomEntity[]> {
    const data = await dbRetry(() =>
      this.db
        .select()
        .from(battleRooms)
        .where(eq(battleRooms.status, status))
    );

    return data.map((room) => this.toEntity(room));
  }

  async findBattleRoomsByHostUserId(
    hostUserId: string
  ): Promise<BattleRoomEntity[]> {
    const data = await dbRetry(() =>
      this.db
        .select()
        .from(battleRooms)
        .where(eq(battleRooms.hostUserId, hostUserId))
    );

    return data.map((room) => this.toEntity(room));
  }

  async updateBattleRoom(
    id: number,
    params: {
      status?: BattleRoomStatus;
      currentQuestionIndex?: number | null;
      currentQuestionStartedAt?: string | null;
      questionIds?: number[] | null;
    }
  ): Promise<BattleRoomEntity | null> {
    const updateData: Partial<typeof battleRooms.$inferInsert> = {};

    if (params.status !== undefined) {
      updateData.status = params.status;
    }
    if (params.currentQuestionIndex !== undefined) {
      updateData.currentQuestionIndex = params.currentQuestionIndex;
    }
    if (params.currentQuestionStartedAt !== undefined) {
      updateData.currentQuestionStartedAt = params.currentQuestionStartedAt;
    }
    if (params.questionIds !== undefined) {
      updateData.questionIds = params.questionIds;
    }

    if (Object.keys(updateData).length === 0) {
      return this.findBattleRoomById(id);
    }

    updateData.updatedAt = new Date().toISOString();

    const [data] = await dbRetry(() =>
      this.db
        .update(battleRooms)
        .set(updateData)
        .where(eq(battleRooms.id, id))
        .returning()
    );

    if (!data) return null;
    return this.toEntity(data);
  }

  async deleteBattleRoom(id: number): Promise<void> {
    await dbRetry(() =>
      this.db.delete(battleRooms).where(eq(battleRooms.id, id))
    );
  }

  private toEntity(
    data: typeof battleRooms.$inferSelect
  ): BattleRoomEntity {
    return new BattleRoomEntity(
      data.id,
      data.publicId,
      data.hostUserId,
      data.studySetId,
      data.name,
      data.visibility as BattleRoomVisibility,
      data.passwordHash,
      data.status as BattleRoomStatus,
      data.timeLimitSeconds,
      data.questionCount,
      data.currentQuestionIndex,
      data.currentQuestionStartedAt,
      data.questionIds,
      data.createdAt,
      data.updatedAt
    );
  }
}
