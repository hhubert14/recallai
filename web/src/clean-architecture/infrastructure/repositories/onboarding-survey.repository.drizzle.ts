import { IOnboardingSurveyRepository } from "@/clean-architecture/domain/repositories/onboarding-survey.repository.interface";
import {
    OnboardingSurveyEntity,
    SurveyAnswers,
} from "@/clean-architecture/domain/entities/onboarding-survey.entity";
import { db } from "@/drizzle";
import { onboardingSurveys } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { withRepositoryErrorHandling } from "./base-repository-error-handler";

export class DrizzleOnboardingSurveyRepository
    implements IOnboardingSurveyRepository
{
    async findSurveyByUserId(
        userId: string
    ): Promise<OnboardingSurveyEntity | null> {
        return withRepositoryErrorHandling(
            async () => {
                const [data] = await db
                    .select()
                    .from(onboardingSurveys)
                    .where(eq(onboardingSurveys.userId, userId))
                    .limit(1);

                if (!data) return null;
                return this.toEntity(data);
            },
            "finding survey by user ID"
        );
    }

    async createSurvey(
        userId: string,
        answers: SurveyAnswers
    ): Promise<OnboardingSurveyEntity> {
        return withRepositoryErrorHandling(
            async () => {
                const [data] = await db
                    .insert(onboardingSurveys)
                    .values({
                        userId,
                        answers,
                    })
                    .returning();

                return this.toEntity(data);
            },
            "creating survey"
        );
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
