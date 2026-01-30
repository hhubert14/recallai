import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { GetStreakUseCase } from "@/clean-architecture/use-cases/streak/get-streak.use-case";
import { DrizzleStreakRepository } from "@/clean-architecture/infrastructure/repositories/streak.repository.drizzle";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();

    if (error || !user) {
      return jsendFail({ error: "Unauthorized" }, 401);
    }

    const { userId } = await params;

    // Users can only fetch their own streak
    if (user.id !== userId) {
      return jsendFail({ error: "Forbidden" }, 403);
    }

    const streakRepo = new DrizzleStreakRepository();
    const getStreakUseCase = new GetStreakUseCase(streakRepo);
    const streak = await getStreakUseCase.execute(userId);

    return jsendSuccess(streak);
  } catch (error) {
    console.error("Error fetching streak:", error);
    return jsendError("Failed to fetch streak");
  }
}
