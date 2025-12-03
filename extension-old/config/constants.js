export const API = {
    // NOTE: Change to "https://www.recallai.io" for production
    // For local development, use "http://localhost:3000"
    // Remember to reload extension after switching
    BASE_URL: "https://www.recallai.io",
    ENDPOINTS: {
        CHECK_AUTH: "/api/v1/users/me",
        PROCESS_VIDEO: "/api/v1/videos/[url]/process",
    },
};
