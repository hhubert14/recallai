import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { FindStudySetsByUserIdUseCase } from "@/clean-architecture/use-cases/study-set/find-study-sets-by-user-id.use-case";
import { CreateStudySetUseCase } from "@/clean-architecture/use-cases/study-set/create-study-set.use-case";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";

export async function GET() {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error || !user) {
            return jsendFail({ error: "Unauthorized" }, 401);
        }

        const useCase = new FindStudySetsByUserIdUseCase(
            new DrizzleStudySetRepository()
        );

        const studySets = await useCase.execute(user.id);

        return jsendSuccess({
            studySets: studySets.map((studySet) => ({
                id: studySet.id,
                publicId: studySet.publicId,
                name: studySet.name,
                description: studySet.description,
                sourceType: studySet.sourceType,
                videoId: studySet.videoId,
                createdAt: studySet.createdAt,
                updatedAt: studySet.updatedAt,
            })),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return jsendError(message);
    }
}

/**
 * POST /api/v1/study-sets
 * Create a new manual study set
 */
export async function POST(request: NextRequest) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error || !user) {
            return jsendFail({ error: "Unauthorized" }, 401);
        }

        const body = await request.json();
        const { name, description } = body;

        if (!name || typeof name !== "string") {
            return jsendFail({ error: "Study set name is required" }, 400);
        }

        const useCase = new CreateStudySetUseCase(
            new DrizzleStudySetRepository()
        );

        const studySet = await useCase.execute({
            userId: user.id,
            name: name.trim(),
            description: description ?? null,
            sourceType: "manual",
            videoId: null,
        });

        return jsendSuccess(
            {
                studySet: {
                    id: studySet.id,
                    publicId: studySet.publicId,
                    name: studySet.name,
                    description: studySet.description,
                    sourceType: studySet.sourceType,
                    videoId: studySet.videoId,
                    createdAt: studySet.createdAt,
                    updatedAt: studySet.updatedAt,
                },
            },
            201
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return jsendError(message);
    }
}
