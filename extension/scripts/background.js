import { processVideo } from "/services/api.js";
import { extractVideoId } from "/utils/youtube-background.js";

console.log("Background script loaded successfully");

// Track processed videos to avoid duplicates
const processedVideos = new Set();

chrome.storage.local.get("processType", function(result) {
    if (!result.processType) {
        chrome.storage.local.set({ processType: "automatic" }, function() {
            console.log("Process type set to automatic");
        });
    }
});

// Listen for tab updates to detect when user is on YouTube video
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        console.log(`Page loaded: ${tab.url}`);
        const currentVideoId = extractVideoId(tab.url);

        if (currentVideoId) {
            // Check if we've already processed this video recently
            if (processedVideos.has(currentVideoId)) {
                console.log(`Video ${currentVideoId} already processed, skipping`);
                return;
            }
            
            // Add to processed set
            processedVideos.add(currentVideoId);
            
            // Clear the processed video after 30 seconds to allow reprocessing if user revisits
            setTimeout(() => {
                processedVideos.delete(currentVideoId);
            }, 30000);

            chrome.storage.local.get(["authToken", "processType"], function (result) {
                const authToken = result.authToken;
                const processType = result.processType || "automatic";

                if (!authToken) {
                    console.warn("No auth token found, skipping video processing");
                    return;
                }
                if (processType !== "automatic") {
                    console.warn("Process type is not set to automatic, skipping video processing");
                    return;
                }
                console.log(`Processing video with ID: ${currentVideoId}`);
                processVideo(tab.url, currentVideoId, authToken, processType);
            });
        }
    }
});

chrome.runtime.onMessageExternal.addListener(
    function (request, sender, sendResponse) {
        if (!request.action) {
            console.error("No action specified in request");
            return;
        }
        console.log("Received external message:", request);
        switch (request.action) {
            case "authenticate":
                if (!request.data.email || !request.data.token) {
                    console.error("Email or token not provided in request");
                    return;
                }

                // Store email and auth token
                chrome.storage.local.set(
                    {
                        email: request.data.email,
                        authToken: request.data.token,
                    },
                    function () {
                        console.log("User authenticated successfully!");
                        sendResponse({ success: true });
                    }
                );
                return true; // Indicate that we will send a response asynchronously
            default:
                console.error(`Unknown action: ${request.action}`);
                sendResponse({ success: false, error: "Unknown action" });
                return false; // Indicate that we did not handle the request
        }
    }
);