"use server";

import { NextRequest } from "next/server";
import { getVideoByUrl } from "@/data-access/videos/get-video-by-url";
import { getYoutubeVideoData } from "@/data-access/external-apis/get-youtube-video-data";
import { getYoutubeTranscript } from "@/data-access/external-apis/get-youtube-transcript";
import { checkVideoEducational } from "@/data-access/external-apis/check-video-educational";
import { authenticateRequest } from "@/clean-architecture/use-cases/extension/authenticate-request";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ url: string }> }
) {
    // const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const { url: videoUrl } = await params;
    const videoId = searchParams.get("videoId");
    const authToken = searchParams.get("authToken");
    const processType = searchParams.get("processType");

    if (!videoUrl || !videoId || !authToken || !processType) {
        return jsendFail({ error: "Missing required parameters" });
    }

    if (processType !== "automatic") {
        return jsendFail({ error: "Invalid process type" });
    }

    try {
        // const tokenData = authResult.tokenData;

        // // Check if token is expired
        // if (new Date(tokenData.expires_at) < new Date()) {
        //     return NextResponse.json(
        //         { error: "Authentication token expired" },
        //         { status: 401 }
        //     );
        // }

        // For extension requests, we can trust the token's user_id since it's validated
        // But we still want to verify the current session user matches (if session exists)
        // const {
        //     data: { user },
        //     error,
        // } = await supabase.auth.getUser();

        // // If there's a valid user session, ensure it matches the token's user
        // if (user && !error) {
        //     if (tokenData.user_id !== user.id) {
        //         return NextResponse.json(
        //             {
        //                 error: "Authentication token does not match current user session",
        //             },
        //             { status: 403 }
        //         );
        //     }
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
        const video = await getVideoByUrl(videoUrl, authenticatedUserId);
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
            // return NextResponse.json(
            //     { error: "YouTube transcript not found" },
            //     { status: 404 }
            // );
            console.warn(
                `Transcript not found for video ID: ${videoId}. Proceeding without transcript.`
            );
            // transcript = {
            //     transcript: [],
            // };
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
