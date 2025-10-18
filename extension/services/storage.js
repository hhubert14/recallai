import { STORAGE_KEYS } from "../config/constants.js";

// Chrome storage operations
export async function getAuthToken() {
    const result = await chrome.storage.local.get(STORAGE_KEYS.AUTH_TOKEN);
    return result[STORAGE_KEYS.AUTH_TOKEN];
}

export async function setAuthToken(token) {
    await chrome.storage.local.set({ [STORAGE_KEYS.AUTH_TOKEN]: token });
}

export async function removeAuthToken() {
    await chrome.storage.local.remove(STORAGE_KEYS.AUTH_TOKEN);
}

export async function storePendingVideoData(videoId, processedData) {
    await chrome.storage.local.set({
        [STORAGE_KEYS.PENDING_VIDEO]: { videoId, processedData },
    });
}

export async function setEmailToken(email) {
    await chrome.storage.local.set({ [STORAGE_KEYS.USER_EMAIL]: email });
}
