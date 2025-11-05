import { NextRequest, NextResponse } from "next/server";
import { createVideo } from "@/data-access/videos/create-video";
import { getVideoByUrl } from "@/data-access/videos/get-video-by-url";
import { authenticateRequest } from "@/use-cases/extension/authenticate-request";
import { logger } from "@/lib/logger";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ url: string }> }
) {
    const { url: videoUrl } = await params;
    const body = await request.json();
    // const { authToken } = await request.json();

    if (!videoUrl) {
        return NextResponse.json(
            { error: "Video URL is required" },
            { status: 400 }
        );
    }

    const tokenData = await authenticateRequest(body.authToken);
    if (tokenData.error) {
        return NextResponse.json(tokenData, { status: tokenData.status });
    }

    // Use the token's user_id as the authenticated user for this request
    const authenticatedUserId = tokenData.userId;

    if (!authenticatedUserId) {
        return NextResponse.json(
            { error: "User not authenticated" },
            { status: 401 }
        );
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
            return NextResponse.json(
                {
                    error: "Missing required video data",
                    missing: {
                        title: !title,
                        url: !url,
                    },
                },
                { status: 400 }
            );
        }
        const videoExists = await getVideoByUrl(videoUrl, authenticatedUserId);
        if (videoExists) {
            return NextResponse.json(
                {
                    error: "Video already exists for this user",
                    video: videoExists,
                },
                { status: 409 }
            );
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
        return NextResponse.json(createdVideo, { status: 201 });
    } catch (error) {
        logger.video.error("Error creating video", error, {
            videoUrl,
            platform: body?.platform,
        });
        return NextResponse.json(
            {
                error: "Failed to create video",
                details: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}
