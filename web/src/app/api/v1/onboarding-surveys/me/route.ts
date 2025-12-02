import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail } from "@/lib/jsend";
import { DrizzleOnboardingSurveyRepository } from "@/clean-architecture/infrastructure/repositories/onboarding-survey.repository.drizzle";

export async function GET() {
    const { user, error } = await getAuthenticatedUser();

    if (error || !user) {
        return jsendFail({ error: "Not authenticated" }, 401);
    }

    const repository = new DrizzleOnboardingSurveyRepository();
    const survey = await repository.findSurveyByUserId(user.id);

    if (!survey) {
        return jsendFail({ error: "Survey not found" }, 404);
    }

    return jsendSuccess({ survey });
}
