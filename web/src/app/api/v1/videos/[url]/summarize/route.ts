"use server";

import { NextRequest } from "next/server";
import { generateVideoSummary } from "@/data-access/external-apis/generate-video-summary";
import { createSummary } from "@/data-access/summaries/create-summary";
import { authenticateRequest } from "@/clean-architecture/use-cases/extension/authenticate-request";
import { logger } from "@/lib/logger";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";

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
        return jsendFail({ error: "Missing required parameters" });
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
            return jsendFail({ error: tokenData.error }, tokenData.status || 401);
        }

        // Use the token's user_id as the authenticated user for this request
        const authenticatedUserId = tokenData.userId;

        if (!authenticatedUserId) {
            return jsendFail({ error: "User not authenticated" }, 401);
        }

        const summary = await generateVideoSummary(
            title,
            description,
            transcript
        );
        if (!summary) {
            return jsendError("Failed to generate video summary");
        }

        logger.video.info("Summary generated successfully", {
            video_id,
            summaryLength: summary.summary?.length || 0,
        });

        const createdSummary = await createSummary({
            videoId: video_id,
            content: summary.summary,
        });

        return jsendSuccess({ summary: createdSummary });
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";
        return jsendError(errorMessage);
    }
}
