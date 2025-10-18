import { API } from "../config/constants.js";

export async function validateToken(token) {
    try {
        const response = await fetch(
            `${API.BASE_URL}${API.ENDPOINTS.VALIDATE_TOKEN}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.ok;
    } catch (error) {
        console.error("Token validation error:", error);
        return false;
    }
}

export async function processVideo(videoUrl, videoId, authToken, processType) {
    try {
        const endpoint = API.ENDPOINTS.PROCESS_VIDEO.replace('[url]', encodeURIComponent(videoUrl));
        const response = await fetch(
            `${API.BASE_URL}${endpoint}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    videoId,
                    authToken,
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