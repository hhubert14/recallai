import { NextRequest } from "next/server";

export const processVideo = async (
    videoUrl: string,
    videoId: string,
    authToken: string,
    processType: "automatic" | "manual",
    request: NextRequest
) => {
    console.log("PROCESS VIDEO CALLED", { videoUrl, videoId });
    const encodedVideoUrl = encodeURIComponent(videoUrl);

    // Implementation for processing the video
    if (!videoUrl || !videoId || !authToken || !processType) {
        throw new Error("Missing required parameters");
    }

    if (processType === "automatic") {
        // Logic for automatic processing
        console.log(
            `Processing video ${videoId} from ${videoUrl} automatically...`
        );
        // Call to a function that handles automatic processing
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
            throw new Error(
                `Error processing video: ${videoData.error || "Unknown error"}`
            );
        }
        if (!videoData || !videoData.videoData) {
            throw new Error("Invalid response from educational endpoint");
        }

        console.log("videoData:", videoData);

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
                    title: videoData.videoData.snippet.title,
                    channel_name: videoData.videoData.snippet.channelTitle,
                    url: videoUrl,
                    description: videoData.videoData.snippet.description,
                    video_id: videoId,
                }),
            }
        );

        // First, get the raw response and log it to see its structure
        const responseJson = await response.json();
        console.log("Create video response:", responseJson);

        // Then extract createdVideo based on the actual structure
        const createdVideo =
            responseJson.videoData || responseJson.data || responseJson;

        if (!response.ok) {
            throw new Error(
                `Error creating video: ${JSON.stringify(responseJson.error || "Unknown error")}`
            );
        }

        console.log("Video created successfully:", createdVideo);
        // // After getting the createdVideo response
        // console.log("Video created successfully. Raw ID value:", createdVideo.video_id, "Type:", typeof createdVideo.video_id);

        // Check if createdVideo has video_id before using it
        if (!createdVideo || !createdVideo.video_id) {
            throw new Error(
                "Invalid response: Missing video_id in created video data"
            );
        }

        const video_id_num = createdVideo.id;

        const title = videoData.videoData.snippet.title || "No Title";
        const description =
            videoData.videoData.snippet.description || "No Description";
        const transcript = videoData.transcript || "No Transcript";
        console.log("Video processed successfully:", {
            title,
            description,
            transcript,
        });

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
        console.log("Summary generated successfully:", summary);

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

        console.log("Questions generated successfully:", questionsData);

        return {
            video_id: video_id_num,
            summary,
            questions: questionsData.questions || [],
            // educational: videoData.educational,
        };
    }
};
