import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { DrizzleOnboardingSurveyRepository } from "@/clean-architecture/infrastructure/repositories/onboarding-survey.repository.drizzle";
import { SubmitSurveyUseCase } from "@/clean-architecture/use-cases/onboarding-survey/submit-survey.use-case";
import { SurveyAnswers } from "@/clean-architecture/domain/entities/onboarding-survey.entity";

export async function POST(request: Request) {
  try {
    const { user, error } = await getAuthenticatedUser();

    if (error || !user) {
      return jsendFail({ error: "Not authenticated" }, 401);
    }

    const body = await request.json();

    if (JSON.stringify(body).length > 10000) {
      return jsendFail({ error: "Payload too large" }, 400);
    }

    const answers: SurveyAnswers = body.answers || {};

    const useCase = new SubmitSurveyUseCase(
      new DrizzleOnboardingSurveyRepository()
    );
    const survey = await useCase.execute(user.id, answers);

    return jsendSuccess({ survey }, 201);
  } catch (error) {
    console.error("Error creating survey:", error);
    return jsendError("Failed to create survey");
  }
}
