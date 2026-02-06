export type SurveyAnswerValue = {
  selected: string | string[];
  other?: string;
};

export type SurveyAnswers = {
  primaryGoal?: SurveyAnswerValue;
  userRole?: SurveyAnswerValue;
  referralSource?: SurveyAnswerValue;
  topics?: SurveyAnswerValue;
  primaryDevice?: SurveyAnswerValue;
  videoFrequency?: SurveyAnswerValue;
  interestedFeatures?: SurveyAnswerValue;
  ageRange?: SurveyAnswerValue;
  educationLevel?: SurveyAnswerValue;
  willingToBeta?: SurveyAnswerValue;
};

export class OnboardingSurveyEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly answers: SurveyAnswers,
    public readonly createdAt: string
  ) {}
}
