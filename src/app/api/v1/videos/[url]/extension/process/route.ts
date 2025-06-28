import { processVideo } from "@/use-cases/extension/process-video";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

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
    logger.extension.debug("Processing video request", { videoUrl: (await params).url });
    const { videoId, authToken, processType } = await request.json();
    const { url: videoUrl } = await params;
    try {
        if (!videoUrl || !videoId || !authToken || !processType) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        const result = await processVideo(
            videoUrl,
            videoId,
            authToken,
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
        logger.extension.error("Error processing video", error, { videoUrl, videoId });
        return NextResponse.json(
            { error: `Failed to process video: ${errorMessage}` },
            { status: 500 }
        );
    }
}
