"use server";

import { NextRequest } from "next/server";
import { generateVideoSummary } from "@/data-access/external-apis/generate-video-summary";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { logger } from "@/lib/logger";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { createSummaryRepository } from "@/clean-architecture/infrastructure/factories/repository.factory";
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

        const summaryData = await generateVideoSummary(
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

        const summaryRepo = createSummaryRepository();
        const createdSummary = await new CreateSummaryUseCase(summaryRepo).execute(
            video_id,
            summaryData.summary
        );

        return jsendSuccess({ summary: createdSummary });
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";
        return jsendError(errorMessage);
    }
}
