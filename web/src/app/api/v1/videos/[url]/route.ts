import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { logger } from "@/lib/logger";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
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

    // Authenticate using session cookie
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
        return jsendFail({ error: "Unauthorized" }, 401);
    }

    const authenticatedUserId = user.id;

    try {
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

        const repo = new DrizzleVideoRepository();
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
