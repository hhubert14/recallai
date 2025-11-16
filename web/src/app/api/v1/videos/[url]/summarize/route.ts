"use server";

import { NextRequest } from "next/server";
import { generateVideoSummary } from "@/data-access/external-apis/generate-video-summary";
import { authenticateRequest } from "@/clean-architecture/use-cases/authentication/authenticate-request";
import { logger } from "@/lib/logger";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { createSummaryRepository } from "@/clean-architecture/infrastructure/factories/repository.factory";
import { CreateSummaryUseCase } from "@/clean-architecture/use-cases/summary/create-summary.use-case";

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

        const authenticatedUserId = tokenData.userId;

        if (!authenticatedUserId) {
            return jsendFail({ error: "User not authenticated" }, 401);
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
