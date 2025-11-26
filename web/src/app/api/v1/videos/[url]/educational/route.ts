"use server";

import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { FindVideoByUserIdAndUrlUseCase } from "@/clean-architecture/use-cases/video/find-video-by-user-id-and-url.use-case";
import { YouTubeVideoInfoService } from "@/clean-architecture/infrastructure/services/video-info.service.youtube";
import { StrapiVideoTranscriptService } from "@/clean-architecture/infrastructure/services/video-transcript.service.strapi";
import { OpenAIVideoClassifierService } from "@/clean-architecture/infrastructure/services/video-classifier.service.openai";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ url: string }> }
) {
    const searchParams = request.nextUrl.searchParams;
    const { url: videoUrl } = await params;
    const videoId = searchParams.get("videoId");
    const processType = searchParams.get("processType");

    if (!videoUrl || !videoId || !processType) {
        return jsendFail({ error: "Missing required parameters" });
    }

    if (processType !== "automatic") {
        return jsendFail({ error: "Invalid process type" });
    }

    try {
        // Authenticate using session cookie
        const { user, error: authError } = await getAuthenticatedUser();
        if (authError || !user) {
            return jsendFail({ error: "Unauthorized" }, 401);
        }

        const authenticatedUserId = user.id;

        const video = await new FindVideoByUserIdAndUrlUseCase(new DrizzleVideoRepository()).execute(authenticatedUserId, videoUrl);
        if (video) {
            return jsendFail({ error: "Video already exists" }, 409);
        }

        const videoInfoService = new YouTubeVideoInfoService();
        const videoInfo = await videoInfoService.get(videoId);

        if (!videoInfo) {
            return jsendFail({ error: "YouTube video not found" }, 404);
        }

        const videoTranscriptService = new StrapiVideoTranscriptService();
        let transcript = await videoTranscriptService.get(videoId);
        if (!transcript) {
            console.warn(
                `Transcript not found for video ID: ${videoId}. Proceeding without transcript.`
            );
            transcript = "";
        }

        const videoClassifierService = new OpenAIVideoClassifierService();
        const isEducational = await videoClassifierService.isEducational(
            videoInfo.title,
            videoInfo.description,
            transcript
        );

        if (isEducational === undefined) {
            return jsendError("Failed to determine if the video is educational");
        }

        if (!isEducational) {
            return jsendFail({ error: "Video is not educational" });
        }

        return jsendSuccess({
            videoData: {
                snippet: {
                    title: videoInfo.title,
                    description: videoInfo.description,
                    channelTitle: videoInfo.channelName,
                },
            },
            transcript: transcript,
            isEducational: true,
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";
        return jsendError(errorMessage);
    }
}
