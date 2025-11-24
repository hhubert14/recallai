import { API } from "../config/constants.js";

export async function checkAuthStatus() {
    try {
        const response = await fetch(
            `${API.BASE_URL}${API.ENDPOINTS.CHECK_AUTH}`,
            {
                method: "GET",
                credentials: "include",
            }
        );
        return response.ok;
    } catch (error) {
        console.error("Auth check error:", error);
        return false;
    }
}

export async function processVideo(videoUrl, videoId, processType) {
    try {
        const endpoint = API.ENDPOINTS.PROCESS_VIDEO.replace('[url]', encodeURIComponent(videoUrl));
        const response = await fetch(
            `${API.BASE_URL}${endpoint}`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    videoId,
                    processType,
                }),
            }
        );
        return response.ok;
    } catch (error) {
        console.error("Video processing error:", error);
        return false;
    }
}