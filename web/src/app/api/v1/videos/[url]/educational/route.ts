"use server";

import { NextRequest } from "next/server";
import { getYoutubeVideoData } from "@/data-access/external-apis/get-youtube-video-data";
import { getYoutubeTranscript } from "@/data-access/external-apis/get-youtube-transcript";
import { checkVideoEducational } from "@/data-access/external-apis/check-video-educational";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { createVideoRepository } from "@/clean-architecture/infrastructure/factories/repository.factory";
import { FindVideoByUserIdAndUrlUseCase } from "@/clean-architecture/use-cases/video/find-video-by-user-id-and-url.use-case";

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

        const videoRepo = createVideoRepository();
        const video = await new FindVideoByUserIdAndUrlUseCase(videoRepo).execute(authenticatedUserId, videoUrl);
        if (video) {
            return jsendFail({ error: "Video already exists" }, 409);
        }

        const youtubeData = await getYoutubeVideoData(videoId);

        if (
            !youtubeData ||
            !youtubeData.items ||
            youtubeData.items.length === 0
        ) {
            return jsendFail({ error: "YouTube video not found" }, 404);
        }

        let transcript = await getYoutubeTranscript(videoId);
        if (!transcript) {
            console.warn(
                `Transcript not found for video ID: ${videoId}. Proceeding without transcript.`
            );
            transcript = "";
        }

        const isEducational = await checkVideoEducational(
            youtubeData.items[0].snippet.title,
            youtubeData.items[0].snippet.description,
            transcript
        );

        if (isEducational === undefined) {
            return jsendError("Failed to determine if the video is educational");
        }

        if (!isEducational) {
            return jsendFail({ error: "Video is not educational" });
        }
        return jsendSuccess({
            videoData: youtubeData.items[0],
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
