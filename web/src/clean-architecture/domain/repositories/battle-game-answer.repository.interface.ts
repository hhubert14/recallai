import { BattleGameAnswerEntity } from "../entities/battle-game-answer.entity";

export interface IBattleGameAnswerRepository {
  /**
   * Record a player's answer to a question during a battle.
   */
  createBattleGameAnswer(params: {
    roomId: number;
    slotId: number;
    questionId: number;
    questionIndex: number;
    selectedOptionId: number | null;
    isCorrect: boolean;
    answeredAt: string;
    score: number;
  }): Promise<BattleGameAnswerEntity>;

  /**
   * Find all answers for a battle room, ordered by questionIndex.
   */
  findAnswersByRoomId(roomId: number): Promise<BattleGameAnswerEntity[]>;

  /**
   * Find all answers by a specific slot in a specific room.
   */
  findAnswersBySlotIdAndRoomId(
    slotId: number,
    roomId: number
  ): Promise<BattleGameAnswerEntity[]>;

  /**
   * Count how many answers have been submitted for a specific question in a room.
   */
  countAnswersByRoomIdAndQuestionIndex(
    roomId: number,
    questionIndex: number
  ): Promise<number>;
}
