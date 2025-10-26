"use server";

import { NextRequest, NextResponse } from "next/server";
// import { getExtensionTokenByToken } from "@/data-access/extension-tokens/get-extension-token-by-token";
// import { getVideoByUrl } from "@/data-access/videos/get-video-by-url";
// import { getYoutubeVideoData } from "@/data-access/external-apis/get-youtube-video-data";
// import { getYoutubeTranscript } from "@/data-access/external-apis/get-youtube-transcript";
// import { checkVideoEducational } from "@/data-access/external-apis/check-video-educational";
// import { createClient } from "@/lib/supabase/server";
import { generateVideoSummary } from "@/data-access/external-apis/generate-video-summary";
import { createSummary } from "@/data-access/summaries/create-summary";
import { authenticateRequest } from "@/use-cases/extension/authenticate-request";
import { logger } from "@/lib/logger";

export async function POST(
    request: NextRequest
    // { params }: { params: { url: string } }
) {
    // const supabase = await createClient();

    // const searchParams = request.nextUrl.searchParams;
    // // const { url: videoUrl } = await params;
    // const title = searchParams.get("title");
    // const description = searchParams.get("description");
    // const transcript = searchParams.get("transcript");
    const { authToken, video_id, title, description, transcript } =
        await request.json();

    // logger.video.debug("Processing video summary request", {
    //     video_id,
    //     hasTitle: !!title,
    //     hasDescription: !!description,
    //     hasTranscript: !!transcript,
    // });

    if (!authToken || !video_id || !title || !description || !transcript) {
        return NextResponse.json(
            { error: "Missing required parameters" },
            { status: 400 }
        );
    }

    try {
        // const {
        //     data: { user },
        //     error,
        // } = await supabase.auth.getUser();

        // // If there's a valid user session, ensure it matches the token's user
        // if (!user || error) {
        //     return NextResponse.json(
        //         {
        //             error: "Unauthorized: No valid user session found",
        //         },
        //         { status: 403 }
        //     );
        // }
        const tokenData = await authenticateRequest(authToken);
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

        const summary = await generateVideoSummary(
            title,
            description,
            transcript
        );
        if (!summary) {
            return NextResponse.json(
                { error: "Failed to generate video summary" },
                { status: 500 }
            );
        }

        logger.video.info("Summary generated successfully", {
            video_id,
            summaryLength: summary.summary?.length || 0,
        });

        const createdSummary = await createSummary({
            videoId: video_id,
            content: summary.summary,
        });

        return NextResponse.json(
            {
                summary: createdSummary,
            },
            { status: 200 }
        );
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
