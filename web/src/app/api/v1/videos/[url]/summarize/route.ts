"use server";

import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { logger } from "@/lib/logger";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { repositories, services } from "@/lib/dependency-injection";
import { CreateSummaryUseCase } from "@/clean-architecture/use-cases/summary/create-summary.use-case";

export async function POST(request: NextRequest) {
    const { video_id, title, description, transcript } =
        await request.json();

    if (!video_id || !title || !description || !transcript) {
        return jsendFail({ error: "Missing required parameters" });
    }

    try {
        // Authenticate using session cookie
        const { user, error: authError } = await getAuthenticatedUser();
        if (authError || !user) {
            return jsendFail({ error: "Unauthorized" }, 401);
        }

        const summaryData = await services.videoSummarizer().generate(
            title,
            description,
            transcript
        );
        if (!summaryData) {
            return jsendError("Failed to generate video summary");
        }

        logger.video.info("Summary generated successfully", {
            video_id,
            summaryLength: summaryData.summary?.length || 0,
        });

        const createdSummary = await new CreateSummaryUseCase(
            repositories.summary()
        ).execute(video_id, summaryData.summary);

        return jsendSuccess({ summary: createdSummary });
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";
        return jsendError(errorMessage);
    }
}
