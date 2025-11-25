import { processVideo } from "@/clean-architecture/use-cases/video/process-video.use-case";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendFail } from "@/lib/jsend";

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ url: string }> }
) {
    logger.extension.debug("Processing video request", {
        videoUrl: (await params).url,
    });
    const { videoId, processType } = await request.json();
    const { url: videoUrl } = await params;
    try {
        // Authenticate using session cookie
        const { user, error: authError } = await getAuthenticatedUser();
        if (authError || !user) {
            return jsendFail({ error: "Unauthorized" }, 401);
        }

        if (!videoUrl || !videoId || !processType) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        const result = await processVideo(
            videoUrl,
            videoId,
            user.id,
            processType,
            request
        );

        return NextResponse.json(
            {
                result,
            },
            { status: 200 }
        );
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
        logger.extension.error("Error processing video", error, {
            videoUrl,
            videoId,
        });
        return NextResponse.json(
            { error: `Failed to process video: ${errorMessage}` },
            { status: 500 }
        );
    }
}
