import { IOnboardingSurveyRepository } from "@/clean-architecture/domain/repositories/onboarding-survey.repository.interface";
import {
  OnboardingSurveyEntity,
  SurveyAnswers,
} from "@/clean-architecture/domain/entities/onboarding-survey.entity";

export class SubmitSurveyUseCase {
  constructor(private readonly surveyRepository: IOnboardingSurveyRepository) {}

  async execute(
    userId: string,
    answers: SurveyAnswers
  ): Promise<OnboardingSurveyEntity> {
    return await this.surveyRepository.createSurvey(userId, answers);
  }
}
