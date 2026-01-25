import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { FindStudySetByPublicIdUseCase } from "@/clean-architecture/use-cases/study-set/find-study-set-by-public-id.use-case";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ publicId: string }> }
) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error || !user) {
            return jsendFail({ error: "Unauthorized" }, 401);
        }

        const { publicId } = await params;

        if (!publicId) {
            return jsendFail({ error: "Missing publicId" }, 400);
        }

        const useCase = new FindStudySetByPublicIdUseCase(
            new DrizzleStudySetRepository()
        );

        const studySet = await useCase.execute(publicId, user.id);

        if (!studySet) {
            return jsendFail({ error: "Study set not found" }, 404);
        }

        return jsendSuccess({
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
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return jsendError(message);
    }
}
