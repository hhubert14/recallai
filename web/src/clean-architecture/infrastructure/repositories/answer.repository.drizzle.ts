import { db } from "@/drizzle";
import { dbRetry } from "@/lib/db";
import { userAnswers, questions } from "@/drizzle/schema";
import { IAnswerRepository } from "@/clean-architecture/domain/repositories/answer.repository.interface";
import { MultipleChoiceAnswerEntity } from "@/clean-architecture/domain/entities/answer.entity";
import { eq, and, desc } from "drizzle-orm";

function toMultipleChoiceAnswerEntity(
  record: typeof userAnswers.$inferSelect
): MultipleChoiceAnswerEntity {
  return new MultipleChoiceAnswerEntity(
    record.id,
    record.userId,
    record.questionId,
    record.selectedOptionId,
    record.isCorrect,
    record.createdAt
  );
}

export class DrizzleAnswerRepository implements IAnswerRepository {
  async createMultipleChoiceAnswer(
    userId: string,
    questionId: number,
    selectedOptionId: number,
    isCorrect: boolean
  ): Promise<MultipleChoiceAnswerEntity> {
    const [result] = await dbRetry(() =>
      db
        .insert(userAnswers)
        .values({
          userId,
          questionId,
          selectedOptionId,
          isCorrect,
        })
        .returning()
    );

    return toMultipleChoiceAnswerEntity(result);
  }

  async findAnswersByUserId(
    userId: string
  ): Promise<MultipleChoiceAnswerEntity[]> {
    const results = await dbRetry(() =>
      db
        .select()
        .from(userAnswers)
        .where(eq(userAnswers.userId, userId))
        .orderBy(desc(userAnswers.createdAt))
    );

    return results.map(toMultipleChoiceAnswerEntity);
  }

  async findAnsweredQuestionIdsByVideoId(
    userId: string,
    videoId: number
  ): Promise<number[]> {
    const rows = await dbRetry(() =>
      db
        .selectDistinct({ questionId: userAnswers.questionId })
        .from(userAnswers)
        .innerJoin(questions, eq(questions.id, userAnswers.questionId))
        .where(
          and(eq(userAnswers.userId, userId), eq(questions.videoId, videoId))
        )
    );

    return rows.map((row) => row.questionId);
  }
}
