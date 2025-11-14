"use server";

import { NextRequest } from "next/server";
import { generateVideoSummary } from "@/data-access/external-apis/generate-video-summary";
import { createSummary } from "@/data-access/summaries/create-summary";
import { authenticateRequest } from "@/clean-architecture/use-cases/extension/authenticate-request";
import { logger } from "@/lib/logger";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";

export async function POST(request: NextRequest) {
    const { authToken, video_id, title, description, transcript } =
        await request.json();

    if (!authToken || !video_id || !title || !description || !transcript) {
        return jsendFail({ error: "Missing required parameters" });
    }

    try {
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
