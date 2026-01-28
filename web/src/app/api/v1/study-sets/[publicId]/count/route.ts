import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail } from "@/lib/jsend";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";

/**
 * GET /api/v1/study-sets/[publicId]/count
 * Get the current item count for a study set.
 * Used for pre-checking capacity before bulk operations.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ publicId: string }> }
) {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
        return jsendFail({ error: "Unauthorized" }, 401);
    }

    const { publicId } = await params;

    const studySetRepository = new DrizzleStudySetRepository();
    const reviewableItemRepository = new DrizzleReviewableItemRepository();

    // Find the study set
    const studySet = await studySetRepository.findStudySetByPublicId(publicId);
    if (!studySet) {
        return jsendFail({ error: "Study set not found" }, 404);
    }

    // Verify ownership
    if (studySet.userId !== user.id) {
        return jsendFail({ error: "Not authorized to access this study set" }, 403);
    }

    // Get the count
    const count = await reviewableItemRepository.countItemsByStudySetId(studySet.id);

    return jsendSuccess({ count });
}
