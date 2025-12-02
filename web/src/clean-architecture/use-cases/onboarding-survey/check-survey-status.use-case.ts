import { IOnboardingSurveyRepository } from "@/clean-architecture/domain/repositories/onboarding-survey.repository.interface";

export class CheckSurveyStatusUseCase {
    constructor(
        private readonly surveyRepository: IOnboardingSurveyRepository
    ) {}

    async execute(userId: string): Promise<{ shouldShowSurvey: boolean }> {
        const survey = await this.surveyRepository.findSurveyByUserId(userId);
        return { shouldShowSurvey: survey === null };
    }
}
