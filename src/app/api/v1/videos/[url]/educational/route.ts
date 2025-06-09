"use server";

import { NextRequest, NextResponse } from "next/server";
import { getExtensionTokenByToken } from "@/data-access/extension-tokens/get-extension-token-by-token";
import { getVideoByUrl } from "@/data-access/videos/get-video-by-url";
import { getYoutubeVideoData } from "@/data-access/external-apis/get-youtube-video-data";
import { getYoutubeTranscript } from "@/data-access/external-apis/get-youtube-transcript";
import { checkVideoEducational } from "@/data-access/external-apis/check-video-educational";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { url: string } }
) {
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const videoUrl = params.url;
    const videoId = searchParams.get('videoId');
    const authToken = searchParams.get('authToken');
    const processType = searchParams.get('processType');

    if (!videoUrl || !videoId || !authToken || !processType) {
        return NextResponse.json(
            { error: "Missing required parameters" },
            { status: 400 }
        );
    }

    if (processType !== "educational") {
        return NextResponse.json(
            { error: "Invalid process type" },
            { status: 400 }
        );
    }

    try {
        const tokenData = await getExtensionTokenByToken(authToken);
        if (!tokenData) {
            return NextResponse.json(
                { error: "Invalid authentication token" },
                { status: 401 }
            );
        }

        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (!user || error) {
            console.error("Authentication error:", error);
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }

        if (tokenData.user_id !== user.id) {
            return NextResponse.json(
                { error: "Authentication token does not match user" },
                { status: 403 }
            );
        }

        const video = await getVideoByUrl(videoUrl, user.id);
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

        const transcript = await getYoutubeTranscript(videoId);
        if (!transcript) {
            return NextResponse.json(
                { error: "YouTube transcript not found" },
                { status: 404 }
            );
        }

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
                transcript: transcript.transcript,
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