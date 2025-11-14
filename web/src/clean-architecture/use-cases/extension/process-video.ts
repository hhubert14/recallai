import { NextRequest } from "next/server";
import { authenticateRequest } from "./authenticate-request";
import { getVideoByUrl } from "@/data-access/videos/get-video-by-url";
import { logger } from "@/lib/logger";

export const processVideo = async (
    videoUrl: string,
    videoId: string,
    authToken: string,
    processType: "automatic" | "manual",
    request: NextRequest
) => {
    logger.extension.info("Processing video request", {
        videoUrl,
        videoId,
        processType,
    });
    const encodedVideoUrl = encodeURIComponent(videoUrl);

    // Implementation for processing the video
    if (!videoUrl || !videoId || !authToken || !processType) {
        throw new Error("Missing required parameters");
    }

    // EARLY CHECKS - Do these before any expensive API calls

    // 1. Authenticate the request first
    const tokenData = await authenticateRequest(authToken);
    if (tokenData.error) {
        throw new Error(`Authentication failed: ${tokenData.error}`);
    }
    const authenticatedUserId = tokenData.userId;

    if (!authenticatedUserId) {
        throw new Error("User not authenticated");
    } // 2. Check if video already exists for this user
    logger.extension.debug("Checking if video already exists");
    const existingVideo = await getVideoByUrl(videoUrl, authenticatedUserId);
    if (existingVideo) {
        logger.extension.info("Video already exists, returning existing data", {
            videoId: existingVideo.id,
        });
        return {
            video_id: existingVideo.id,
            summary: "Video already processed",
            questions: [],
            message: "Video already exists in your library",
            alreadyExists: true,
        };
    }

    if (processType === "automatic") {
        // Logic for automatic processing
        logger.extension.info("Starting automatic video processing", {
            videoId,
        });

        // Now proceed with the expensive API calls since checks passed
        const queryParams = new URLSearchParams();
        queryParams.append("videoId", videoId);
        queryParams.append("authToken", authToken);
        queryParams.append("processType", processType);

        let response = await fetch(
            `${request.nextUrl.origin}/api/v1/videos/${encodedVideoUrl}/educational?${queryParams.toString()}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: request.headers.get("cookie") || "",
                },
            }
        );

        const videoData = await response.json();
        if (!response.ok) {
            const errorMsg = videoData.data?.error || videoData.message || "Unknown error";
            throw new Error(`Error processing video: ${errorMsg}`);
        }
        // Extract data from JSend success response
        const educationalData = videoData.data;
        if (!educationalData || !educationalData.videoData) {
            throw new Error("Invalid response from educational endpoint");
        }

        logger.extension.debug("Video educational check completed", {
            videoId,
            isEducational: educationalData.isEducational,
        });

        response = await fetch(
            `${request.nextUrl.origin}/api/v1/videos/${encodedVideoUrl}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: request.headers.get("cookie") || "",
                },
                body: JSON.stringify({
                    authToken: authToken,
                    platform: "YouTube",
                    title: educationalData.videoData.snippet.title,
                    channel_name: educationalData.videoData.snippet.channelTitle,
                    url: videoUrl,
                    description: educationalData.videoData.snippet.description,
                    video_id: videoId,
                }),
            }
        ); // First, get the raw response and log it to see its structure
        const responseJson = await response.json();
        logger.extension.debug("Video creation API response received", {
            success: response.ok,
            status: response.status,
        });

        // Handle JSend response format
        if (!response.ok) {
            const errorMsg = responseJson.data?.error || responseJson.message || "Unknown error";
            throw new Error(`Error creating video: ${errorMsg}`);
        }

        // Extract video data from JSend success response
        const createdVideo = responseJson.data;

        logger.extension.info("Video created successfully", {
            videoId: createdVideo?.video_id,
        });

        // Check if createdVideo has video_id before using it
        if (!createdVideo || !createdVideo.video_id) {
            throw new Error(
                "Invalid response: Missing video_id in created video data"
            );
        }

        const video_id_num = createdVideo.id;

        const title = educationalData.videoData.snippet.title || "No Title";
        const description =
            educationalData.videoData.snippet.description || "No Description";
        const transcript = educationalData.transcript || "No Transcript";

        response = await fetch(
            `${request.nextUrl.origin}/api/v1/videos/${encodedVideoUrl}/summarize`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: request.headers.get("cookie") || "",
                },
                body: JSON.stringify({
                    authToken: authToken,
                    video_id: video_id_num,
                    title,
                    description,
                    transcript,
                }),
            }
        );

        const summaryData = await response.json();
        if (!response.ok) {
            throw new Error(
                `Error generating summary: ${summaryData.error || "Unknown error"}`
            );
        }
        const summary = summaryData.content || "No Summary";
        logger.extension.info("Summary generated successfully", {
            videoId: video_id_num,
            summaryLength: summary.length,
        });

        response = await fetch(
            `${request.nextUrl.origin}/api/v1/videos/${encodedVideoUrl}/questions`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: request.headers.get("cookie") || "",
                },
                body: JSON.stringify({
                    authToken: authToken,
                    video_id: video_id_num,
                    title,
                    description,
                    transcript,
                }),
            }
        );

        const questionsData = await response.json();
        if (!response.ok) {
            throw new Error(
                `Error generating questions: ${questionsData.error || "Unknown error"}`
            );
        }
        logger.extension.info("Questions generated successfully", {
            videoId: video_id_num,
            questionCount: questionsData.questions?.length || 0,
        });

        return {
            video_id: video_id_num,
            summary,
            questions: questionsData.questions || [],
            // educational: videoData.educational,
        };
    }
};
