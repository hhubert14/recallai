import { IOnboardingSurveyRepository } from "@/clean-architecture/domain/repositories/onboarding-survey.repository.interface";
import {
  OnboardingSurveyEntity,
  SurveyAnswers,
} from "@/clean-architecture/domain/entities/onboarding-survey.entity";
import { db } from "@/drizzle";
import { dbRetry } from "@/lib/db";
import { onboardingSurveys } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export class DrizzleOnboardingSurveyRepository
  implements IOnboardingSurveyRepository
{
  async findSurveyByUserId(
    userId: string
  ): Promise<OnboardingSurveyEntity | null> {
    const [data] = await dbRetry(() =>
      db
        .select()
        .from(onboardingSurveys)
        .where(eq(onboardingSurveys.userId, userId))
        .limit(1)
    );

    if (!data) return null;
    return this.toEntity(data);
  }

  async createSurvey(
    userId: string,
    answers: SurveyAnswers
  ): Promise<OnboardingSurveyEntity> {
    const [data] = await dbRetry(() =>
      db
        .insert(onboardingSurveys)
        .values({
          userId,
          answers,
        })
        .returning()
    );

    return this.toEntity(data);
  }

  private toEntity(
    data: typeof onboardingSurveys.$inferSelect
  ): OnboardingSurveyEntity {
    return new OnboardingSurveyEntity(
      data.id,
      data.userId,
      data.answers as SurveyAnswers,
      data.createdAt
    );
  }
}
