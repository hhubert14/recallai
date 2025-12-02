import {
    OnboardingSurveyEntity,
    SurveyAnswers,
} from "@/clean-architecture/domain/entities/onboarding-survey.entity";

export interface IOnboardingSurveyRepository {
    findSurveyByUserId(userId: string): Promise<OnboardingSurveyEntity | null>;

    createSurvey(
        userId: string,
        answers: SurveyAnswers,
    ): Promise<OnboardingSurveyEntity>;
}
