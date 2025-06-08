"use server";

import { NextRequest, NextResponse } from "next/server";
import { getExtensionTokenByToken } from "@/data-access/extension-tokens/get-extension-token-by-token";
import { getVideoByUrl } from "@/data-access/videos/get-video-by-url";
import { getYoutubeVideoData } from "@/data-access/external-apis/get-youtube-video-data";
import { getYoutubeTranscript } from "@/data-access/external-apis/get-youtube-transcript";
import { checkVideoEducational } from "@/data-access/external-apis/check-video-educational";

export async function POST(request: NextRequest) {
    const { videoUrl, videoId, authToken, processType } = await request.json();
    if (!videoUrl || !videoId || !authToken || !processType) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    try {
        const tokenData = await getExtensionTokenByToken(authToken);
        if (!tokenData) {
            return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
        }

        const video = await getVideoByUrl(videoUrl);
        if (video) {
            return NextResponse.json({ error: "Video already exists" }, { status: 409 });
        }

        const youtubeData = await getYoutubeVideoData(videoId);
        if (!youtubeData || !youtubeData.items || youtubeData.items.length === 0) {
            return NextResponse.json({ error: "YouTube video not found" }, { status: 404 });
        }

        const transcript = await getYoutubeTranscript(videoId);
        if (!transcript) {
            return NextResponse.json({ error: "YouTube transcript not found" }, { status: 404 });
        }
        
        const isEducational = await checkVideoEducational(
            youtubeData.items[0].snippet.title,
            youtubeData.items[0].snippet.description,
            transcript
        );

        if (isEducational === undefined) {
            return NextResponse.json({ error: "Failed to determine if the video is educational" }, { status: 500 });
        }

        if (!isEducational) {
            return NextResponse.json({ error: "Video is not educational" }, { status: 400 });
        }


    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
