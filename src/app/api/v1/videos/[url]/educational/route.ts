"use server";

import { NextRequest, NextResponse } from "next/server";
import { getExtensionTokenByToken } from "@/data-access/extension/get-extension-token-by-token";
import { getVideoByUrl } from "@/data-access/videos/get-video-by-url";
import { getYoutubeVideoData } from "@/data-access/external-apis/get-youtube-video-data";
import { getYoutubeTranscript } from "@/data-access/external-apis/get-youtube-transcript";
import { checkVideoEducational } from "@/data-access/external-apis/check-video-educational";
import { createClient } from "@/lib/supabase/server";
import { authenticateRequest } from "@/use-cases/extension/authenticate-request";

export async function GET(
    request: NextRequest,
    { params }: { params: { url: string } }
) {
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const { url: videoUrl } = await params;
    const videoId = searchParams.get("videoId");
    const authToken = searchParams.get("authToken");
    const processType = searchParams.get("processType");

    if (!videoUrl || !videoId || !authToken || !processType) {
        return NextResponse.json(
            { error: "Missing required parameters" },
            { status: 400 }
        );
    }

    if (processType !== "automatic") {
        return NextResponse.json(
            { error: "Invalid process type" },
            { status: 400 }
        );
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

        const video = await getVideoByUrl(videoUrl, authenticatedUserId);
        console.log("Video data:", video);
        if (video) {
            return NextResponse.json(
                { error: "Video already exists" },
                { status: 409 }
            );
        }

        const youtubeData = await getYoutubeVideoData(videoId);
        if (
            !youtubeData ||
            !youtubeData.items ||
            youtubeData.items.length === 0
        ) {
            return NextResponse.json(
                { error: "YouTube video not found" },
                { status: 404 }
            );
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
        console.log("Transcript data:", transcript);

        const isEducational = await checkVideoEducational(
            youtubeData.items[0].snippet.title,
            youtubeData.items[0].snippet.description,
            transcript
        );

        if (isEducational === undefined) {
            return NextResponse.json(
                { error: "Failed to determine if the video is educational" },
                { status: 500 }
            );
        }

        if (!isEducational) {
            return NextResponse.json(
                { error: "Video is not educational" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            {
                videoData: youtubeData.items[0],
                // transcript: transcript.transcript,
                transcript: transcript,
                isEducational: true,
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
