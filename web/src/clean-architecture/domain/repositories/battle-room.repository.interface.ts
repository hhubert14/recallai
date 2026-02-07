import {
  BattleRoomEntity,
  BattleRoomStatus,
  BattleRoomVisibility,
} from "../entities/battle-room.entity";

export interface IBattleRoomRepository {
  /**
   * Create a new battle room.
   * Status defaults to 'waiting', publicId is auto-generated.
   */
  createBattleRoom(params: {
    hostUserId: string;
    studySetId: number;
    name: string;
    visibility: BattleRoomVisibility;
    passwordHash: string | null;
    timeLimitSeconds: number;
    questionCount: number;
  }): Promise<BattleRoomEntity>;

  /**
   * Find a battle room by its internal ID.
   */
  findBattleRoomById(id: number): Promise<BattleRoomEntity | null>;

  /**
   * Find a battle room by its public UUID.
   */
  findBattleRoomByPublicId(
    publicId: string
  ): Promise<BattleRoomEntity | null>;

  /**
   * Find all battle rooms with a given status.
   */
  findBattleRoomsByStatus(
    status: BattleRoomStatus
  ): Promise<BattleRoomEntity[]>;

  /**
   * Find all battle rooms hosted by a user.
   */
  findBattleRoomsByHostUserId(
    hostUserId: string
  ): Promise<BattleRoomEntity[]>;

  /**
   * Update gameplay-mutation fields on a battle room.
   * Room config (name, visibility, etc.) is immutable after creation.
   */
  updateBattleRoom(
    id: number,
    params: {
      status?: BattleRoomStatus;
      currentQuestionIndex?: number | null;
      currentQuestionStartedAt?: string | null;
      questionIds?: number[] | null;
    }
  ): Promise<BattleRoomEntity | null>;

  /**
   * Delete a battle room by its internal ID.
   */
  deleteBattleRoom(id: number): Promise<void>;
}
