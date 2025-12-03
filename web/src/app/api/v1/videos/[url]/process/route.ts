import { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendFail, jsendSuccess, jsendError } from "@/lib/jsend";
import { useCases } from "@/lib/dependency-injection";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ url: string }> }
) {
    const { url: encodedVideoUrl } = await params;
    const videoUrl = decodeURIComponent(encodedVideoUrl);

    logger.extension.debug("Processing video request", { videoUrl });

    try {
        // Authenticate using session cookie
        const { user, error: authError } = await getAuthenticatedUser();
        if (authError || !user) {
            return jsendFail({ error: "Unauthorized" }, 401);
        }

        if (!videoUrl) {
            return jsendFail({ error: "Missing video URL" }, 400);
        }

        const result = await useCases.processVideo().execute(user.id, videoUrl);

        return jsendSuccess({
            video_id: result.video.id,
            summary: result.summary.content,
            questions: result.questions.map(q => ({
                id: q.id,
                question: q.questionText,
                options: q.options.map(o => o.optionText),
            })),
            alreadyExists: result.alreadyExists || false,
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
        logger.extension.error("Error processing video", error, { videoUrl });
        return jsendError(`Failed to process video: ${errorMessage}`);
    }
}
