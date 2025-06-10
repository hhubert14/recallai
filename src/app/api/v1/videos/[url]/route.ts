import { NextRequest, NextResponse } from "next/server";
import { createVideo } from "@/data-access/videos/create-video";
import { createClient } from "@/lib/supabase/server";
import { getVideoByUrl } from "@/data-access/videos/get-video-by-url";

export async function POST(
    request: NextRequest,
    { params }: { params: { url: string } }
) {
    const { url: videoUrl } = await params;

    if (!videoUrl) {
        return NextResponse.json(
            { error: "Video URL is required" },
            { status: 400 }
        );
    }

    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        console.error("Authentication error:", error);
        return NextResponse.json(
            { error: "User not authenticated" },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        console.log("Request body:", body);

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

        const videoExists = await getVideoByUrl(videoUrl, user.id);
        if (videoExists) {
            console.log("Video already exists for this user:", videoExists);
            return NextResponse.json(
                {
                    error: "Video already exists for this user",
                    video: videoExists,
                },
                { status: 409 }
            );
        }

        console.log("Creating video with data:", {
            user_id: user.id, // Use the authenticated user's ID
            platform,
            title,
            channel_name,
            duration,
            category,
            url,
            description,
            video_id,
        });

        // Create the video using the authenticated user's ID
        const createdVideo = await createVideo({
            user_id: user.id, // Always use the authenticated user's ID
            platform,
            title,
            channel_name,
            duration,
            category,
            url,
            description,
            video_id,
        });

        console.log("Video created successfully:", createdVideo);
        return NextResponse.json(createdVideo, { status: 201 });
    } catch (error) {
        console.error("Error creating video:", error);
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
