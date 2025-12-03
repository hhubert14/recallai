import { IOnboardingSurveyRepository } from "@/clean-architecture/domain/repositories/onboarding-survey.repository.interface";
import {
    OnboardingSurveyEntity,
    SurveyAnswers,
} from "@/clean-architecture/domain/entities/onboarding-survey.entity";
import { db } from "@/drizzle";
import { onboardingSurveys } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

export class DrizzleOnboardingSurveyRepository
    implements IOnboardingSurveyRepository
{
    async findSurveyByUserId(
        userId: string
    ): Promise<OnboardingSurveyEntity | null> {
        try {
            const [data] = await db
                .select()
                .from(onboardingSurveys)
                .where(eq(onboardingSurveys.userId, userId))
                .limit(1);

            if (!data) return null;
            return this.toEntity(data);
        } catch (error) {
            logger.db.error("Error finding survey by user ID", error);
            throw error;
        }
    }

    async createSurvey(
        userId: string,
        answers: SurveyAnswers
    ): Promise<OnboardingSurveyEntity> {
        try {
            const [data] = await db
                .insert(onboardingSurveys)
                .values({
                    userId,
                    answers,
                })
                .returning();

            return this.toEntity(data);
        } catch (error) {
            logger.db.error("Error creating survey", error);
            throw error;
        }
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
