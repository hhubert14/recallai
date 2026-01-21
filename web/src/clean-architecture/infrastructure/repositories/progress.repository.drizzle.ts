import { db } from "@/drizzle";
import { userQuestionProgress } from "@/drizzle/schema";
import { IProgressRepository } from "@/clean-architecture/domain/repositories/progress.repository.interface";
import { ProgressEntity } from "@/clean-architecture/domain/entities/progress.entity";
import { eq, and, lte, isNotNull, count } from "drizzle-orm";

function toProgressEntity(
  record: typeof userQuestionProgress.$inferSelect
): ProgressEntity {
  return new ProgressEntity(
    record.id,
    record.userId,
    record.questionId,
    record.boxLevel ?? 1,
    record.nextReviewDate,
    record.timesCorrect ?? 0,
    record.timesIncorrect ?? 0,
    record.lastReviewedAt,
    record.createdAt,
  );
}

export class DrizzleProgressRepository implements IProgressRepository {
  async findProgressByUserId(userId: string): Promise<ProgressEntity[]> {
    const results = await db
      .select()
      .from(userQuestionProgress)
      .where(eq(userQuestionProgress.userId, userId));

    return results.map(toProgressEntity);
  }

  async createProgress(
    userId: string,
    questionId: number,
    boxLevel: number,
    nextReviewDate: string,
    timesCorrect: number,
    timesIncorrect: number,
    lastReviewedAt: string
  ): Promise<ProgressEntity> {
    const [result] = await db
      .insert(userQuestionProgress)
      .values({
        userId,
        questionId,
        boxLevel,
        nextReviewDate,
        timesCorrect,
        timesIncorrect,
        lastReviewedAt,
      })
      .returning();

    return toProgressEntity(result);
  }

  async createProgressBatch(
    items: Array<{
      userId: string;
      questionId: number;
      boxLevel: number;
      nextReviewDate: string;
      timesCorrect: number;
      timesIncorrect: number;
      lastReviewedAt: string;
    }>
  ): Promise<ProgressEntity[]> {
    const results = await db
      .insert(userQuestionProgress)
      .values(items)
      .returning();

    return results.map(toProgressEntity);
  }

  async findProgressByUserIdAndQuestionId(
    userId: string,
    questionId: number
  ): Promise<ProgressEntity | null> {
    const [result] = await db
      .select()
      .from(userQuestionProgress)
      .where(
        and(
          eq(userQuestionProgress.userId, userId),
          eq(userQuestionProgress.questionId, questionId)
        )
      )
      .limit(1);

    return result ? toProgressEntity(result) : null;
  }

  async updateProgress(
    userId: string,
    questionId: number,
    boxLevel: number,
    nextReviewDate: string,
    timesCorrect: number,
    timesIncorrect: number,
    lastReviewedAt: string
  ): Promise<ProgressEntity> {
    const [result] = await db
      .update(userQuestionProgress)
      .set({
        boxLevel,
        nextReviewDate,
        timesCorrect,
        timesIncorrect,
        lastReviewedAt,
      })
      .where(
        and(
          eq(userQuestionProgress.userId, userId),
          eq(userQuestionProgress.questionId, questionId)
        )
      )
      .returning();

    return toProgressEntity(result);
  }

  async findProgressDueForReview(userId: string): Promise<ProgressEntity[]> {
    const today = new Date().toISOString().split("T")[0];

    const results = await db
      .select()
      .from(userQuestionProgress)
      .where(
        and(
          eq(userQuestionProgress.userId, userId),
          lte(userQuestionProgress.nextReviewDate, today),
          isNotNull(userQuestionProgress.nextReviewDate)
        )
      );

    return results.map(toProgressEntity);
  }

  async getProgressStats(userId: string): Promise<{
    questionsDueToday: number;
    totalQuestionsInSystem: number;
    questionsInBox1: number;
    questionsInBox2: number;
    questionsInBox3: number;
    questionsInBox4: number;
    questionsInBox5: number;
  }> {
    const today = new Date().toISOString().split("T")[0];

    const dueTodayResult = await db
      .select({ count: count() })
      .from(userQuestionProgress)
      .where(
        and(
          eq(userQuestionProgress.userId, userId),
          lte(userQuestionProgress.nextReviewDate, today),
          isNotNull(userQuestionProgress.nextReviewDate)
        )
      );

    const totalResult = await db
      .select({ count: count() })
      .from(userQuestionProgress)
      .where(eq(userQuestionProgress.userId, userId));

    const boxData = await db
      .select({ boxLevel: userQuestionProgress.boxLevel })
      .from(userQuestionProgress)
      .where(eq(userQuestionProgress.userId, userId));

    const boxCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    boxData.forEach((row) => {
      const boxLevel = row.boxLevel;
      if (boxLevel && boxLevel >= 1 && boxLevel <= 5) {
        boxCounts[boxLevel as keyof typeof boxCounts]++;
      }
    });

    return {
      questionsDueToday: dueTodayResult[0]?.count || 0,
      totalQuestionsInSystem: totalResult[0]?.count || 0,
      questionsInBox1: boxCounts[1],
      questionsInBox2: boxCounts[2],
      questionsInBox3: boxCounts[3],
      questionsInBox4: boxCounts[4],
      questionsInBox5: boxCounts[5],
    };
  }
}
