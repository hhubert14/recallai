import { NextRequest } from "next/server";
import { authenticateRequest } from "@/clean-architecture/use-cases/authentication/authenticate-request";
import { logger } from "@/lib/logger";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { createVideoRepository } from "@/clean-architecture/infrastructure/factories/repository.factory";
import { FindVideoByUserIdAndUrlUseCase } from "@/clean-architecture/use-cases/video/find-video-by-user-id-and-url.use-case";
import { CreateVideoUseCase } from "@/clean-architecture/use-cases/video/create-video.use-case";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ url: string }> }
) {
    const { url: videoUrl } = await params;
    const body = await request.json();

    if (!videoUrl) {
        return jsendFail({ error: "Video URL is required" });
    }

    const tokenData = await authenticateRequest(body.authToken);
    if (tokenData.error) {
        return jsendFail({ error: tokenData.error }, tokenData.status || 401);
    }

    // Use the token's user_id as the authenticated user for this request
    const authenticatedUserId = tokenData.userId;

    if (!authenticatedUserId) {
        return jsendFail({ error: "User not authenticated" }, 401);
    }
    try {
        // Remove user_id from the request body since we'll use the authenticated user's ID
        const {
            platform,
            title,
            channelName,
            url,
        } = body;

        // Validate the incoming video data (user_id no longer required in body)
        if (!title || !url) {
            return jsendFail({
                error: "Missing required video data",
                missing: {
                    title: !title,
                    url: !url,
                },
            });
        }

        const repo = createVideoRepository()
        const video = await new FindVideoByUserIdAndUrlUseCase(repo).execute(authenticatedUserId, videoUrl);
        if (video) {
            return jsendFail({
                error: "Video already exists for this user",
                video: video,
            }, 409);
        }

        const createdVideo = await new CreateVideoUseCase(repo).execute(
            authenticatedUserId,
            platform,
            title,
            url,
            channelName,
            null,
        )
        return jsendSuccess(createdVideo, 201);
    } catch (error) {
        logger.video.error("Error creating video", error, {
            videoUrl,
            platform: body?.platform,
        });
        return jsendError(
            "Failed to create video",
            undefined,
            {
                details: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            }
        );
    }
}
