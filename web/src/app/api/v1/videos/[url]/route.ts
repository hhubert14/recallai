import { NextRequest } from "next/server";
import { createVideo } from "@/data-access/videos/create-video";
import { getVideoByUrl } from "@/data-access/videos/get-video-by-url";
import { authenticateRequest } from "@/clean-architecture/use-cases/extension/authenticate-request";
import { logger } from "@/lib/logger";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";

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
            channel_name,
            duration,
            category,
            url,
            description,
            video_id,
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
        const videoExists = await getVideoByUrl(videoUrl, authenticatedUserId);
        if (videoExists) {
            return jsendFail({
                error: "Video already exists for this user",
                video: videoExists,
            }, 409);
        }

        const videoData = {
            userId: authenticatedUserId, // Use the authenticated user's ID
            platform,
            title,
            channelName: channel_name,
            duration,
            category,
            url,
            description,
            videoId: video_id,
        }; // Create the video using the authenticated user's ID
        const createdVideo = await createVideo(videoData);
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
