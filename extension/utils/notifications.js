import { NOTIFICATION, API } from "../config/constants.js";
import { storePendingVideoData } from "../services/storage.js";

// Notification functionality
// Error handling utility example
export function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    // Could report to monitoring service
    // Could show user-friendly error message
}

export function createNotification(type, message, data) {
    // Extract the notification creation logic from content.js
    // Return the notification element
}

export function showSignInNotification(tabId, videoId, processedData) {
    chrome.tabs.sendMessage(tabId, {
        action: "showNotification",
        type: NOTIFICATION.TYPES.SIGNIN,
        message: "Sign in to save this video summary",
        data: {
            videoId: videoId,
            processedData: processedData,
        },
    });
}

export function showSuccessNotification(tabId, videoId) {
    chrome.tabs.sendMessage(tabId, {
        action: "showNotification",
        type: NOTIFICATION.TYPES.SUCCESS,
        message: "Video processed! View in RecallAI",
        data: {
            videoId: videoId,
            url: `${API.BASE_URL}/videos/${videoId}`,
        },
    });
}

export function showErrorNotification(tabId) {
    chrome.tabs.sendMessage(tabId, {
        action: "showNotification",
        type: NOTIFICATION.TYPES.ERROR,
        message: "Error processing video. Please try again.",
    });
}