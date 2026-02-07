import { IBattleGameAnswerRepository } from "@/clean-architecture/domain/repositories/battle-game-answer.repository.interface";
import { BattleGameAnswerEntity } from "@/clean-architecture/domain/entities/battle-game-answer.entity";
import { db as defaultDb } from "@/drizzle";
import { dbRetry } from "@/lib/db";
import { battleGameAnswers } from "@/drizzle/schema";
import { eq, and, asc, count } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export class DrizzleBattleGameAnswerRepository
  implements IBattleGameAnswerRepository
{
  constructor(private readonly db: PostgresJsDatabase = defaultDb) {}

  async createBattleGameAnswer(params: {
    roomId: number;
    slotId: number;
    questionId: number;
    questionIndex: number;
    selectedOptionId: number | null;
    isCorrect: boolean;
    answeredAt: string;
    score: number;
  }): Promise<BattleGameAnswerEntity> {
    const [data] = await dbRetry(() =>
      this.db
        .insert(battleGameAnswers)
        .values({
          roomId: params.roomId,
          slotId: params.slotId,
          questionId: params.questionId,
          questionIndex: params.questionIndex,
          selectedOptionId: params.selectedOptionId,
          isCorrect: params.isCorrect,
          answeredAt: params.answeredAt,
          score: params.score,
        })
        .returning()
    );

    return this.toEntity(data);
  }

  async findAnswersByRoomId(
    roomId: number
  ): Promise<BattleGameAnswerEntity[]> {
    const data = await dbRetry(() =>
      this.db
        .select()
        .from(battleGameAnswers)
        .where(eq(battleGameAnswers.roomId, roomId))
        .orderBy(asc(battleGameAnswers.questionIndex))
    );

    return data.map((answer) => this.toEntity(answer));
  }

  async findAnswersBySlotIdAndRoomId(
    slotId: number,
    roomId: number
  ): Promise<BattleGameAnswerEntity[]> {
    const data = await dbRetry(() =>
      this.db
        .select()
        .from(battleGameAnswers)
        .where(
          and(
            eq(battleGameAnswers.slotId, slotId),
            eq(battleGameAnswers.roomId, roomId)
          )
        )
    );

    return data.map((answer) => this.toEntity(answer));
  }

  async countAnswersByRoomIdAndQuestionIndex(
    roomId: number,
    questionIndex: number
  ): Promise<number> {
    const [result] = await dbRetry(() =>
      this.db
        .select({ count: count() })
        .from(battleGameAnswers)
        .where(
          and(
            eq(battleGameAnswers.roomId, roomId),
            eq(battleGameAnswers.questionIndex, questionIndex)
          )
        )
    );

    return result.count;
  }

  private toEntity(
    data: typeof battleGameAnswers.$inferSelect
  ): BattleGameAnswerEntity {
    return new BattleGameAnswerEntity(
      data.id,
      data.roomId,
      data.slotId,
      data.questionId,
      data.questionIndex,
      data.selectedOptionId,
      data.isCorrect,
      data.answeredAt,
      data.score
    );
  }
}
