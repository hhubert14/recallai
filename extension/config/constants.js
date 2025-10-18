export const API = {
    BASE_URL: "https://www.recallai.io",
    ENDPOINTS: {
        VALIDATE_TOKEN: "/api/v1/auth/extension/validate-token",
        PROCESS_VIDEO: "/api/v1/videos/[url]/extension/process",
        // Add other endpoints
    },
};

export const NOTIFICATION = {
    DISPLAY_TIME: 5000,
    TYPES: {
        SUCCESS: "success",
        ERROR: "error",
        SIGNIN: "signin",
    },
};

export const STORAGE_KEYS = {
    AUTH_TOKEN: "authToken",
    PENDING_VIDEO: "pendingVideoData",
    USER_EMAIL: "email",
};
