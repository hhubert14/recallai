console.log("Content script loaded successfully");

// // Listen for messages from background script
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     console.log("Received message from background script:", message);
//     if (!message || !message.action) {
//         console.error("No action specified in message");
//         sendResponse({ success: false, error: "No action specified" });
//         return false; // Indicate that we did not handle the request
//     }

//     switch (message.action) {
//         case "checkVideoType":
//             console.log("Checking if video is educational:", message.videoId);

//             const { text, html } = getVideoDescription();
//             console.log("Video Description:", text, html);
//             sendResponse({
//                 isEducational: true,
//             });
//             break;
//         // case "getVideoDetails":
//         //     const videoDetails = {
//         //         title: document.title.replace(" - YouTube", ""),
//         //         url: window.location.href,
//         //         description: getVideoDescription(),
//         //         transcript: getVideoTranscript(),
//         //     };

//         //     sendResponse(videoDetails);
//         //     return true;
//         // case "showNotification":
//         //     showNotification(message.type, message.message, message.data);
//         //     return true;
//         default:
//             console.error(`Unknown action: ${message.action}`);
//             sendResponse({ success: false, error: "Unknown action" });
//             return false; // Indicate that we did not handle the request
//     }
// });

// // Show notification
// function showNotification(type, message, data) {
//     // Create notification element
//     const notificationId = "recallai-notification";
//     const existingNotification = document.getElementById(notificationId);
//     if (existingNotification) {
//         existingNotification.remove();
//     }

//     const notification = document.createElement("div");
//     notification.id = notificationId;
//     notification.style.cssText = `
//         position: fixed;
//         top: 20px;
//         right: 20px;
//         background-color: #4285f4;
//         color: white;
//         padding: 15px 20px;
//         border-radius: 8px;
//         font-size: 14px;
//         z-index: 9999;
//         box-shadow: 0 4px 8px rgba(0,0,0,0.2);
//         display: flex;
//         flex-direction: column;
//     `;

//     let buttonHtml = "";

//     if (type === "signin") {
//         buttonHtml = `<button id="recallai-signin-btn" style="
//             margin-top: 10px;
//             padding: 8px 12px;
//             background-color: white;
//             color: #4285f4;
//             border: none;
//             border-radius: 4px;
//             font-weight: bold;
//             cursor: pointer;
//         ">Sign in to RecallAI</button>`;
//     } else if (type === "success") {
//         buttonHtml = `<button id="recallai-view-btn" style="
//             margin-top: 10px;
//             padding: 8px 12px;
//             background-color: white;
//             color: #4285f4;
//             border: none;
//             border-radius: 4px;
//             font-weight: bold;
//             cursor: pointer;
//         ">View in RecallAI</button>`;
//     }

//     notification.innerHTML = `
//         <div style="display: flex; align-items: center;">
//             <div style="margin-right: 10px;">
//                 ${type === "error" ? "❌" : "✓"}
//             </div>
//             <div>
//                 <div style="font-weight: bold; margin-bottom: 5px;">RecallAI</div>
//                 <div>${message}</div>
//             </div>
//         </div>
//         ${buttonHtml}
//     `;

//     document.body.appendChild(notification);

//     // Add event listeners
//     if (type === "signin") {
//         document
//             .getElementById("recallai-signin-btn")
//             .addEventListener("click", () => {
//                 // Store the processed data temporarily
//                 chrome.storage.local.set({
//                     pendingVideoData: {
//                         videoId: data.videoId,
//                         processedData: data.processedData,
//                     },
//                 });

//                 // Open sign in page
//                 window.open("https://recallai.app/auth/extension", "_blank");
//                 notification.remove();
//             });
//     } else if (type === "success") {
//         document
//             .getElementById("recallai-view-btn")
//             .addEventListener("click", () => {
//                 window.open(data.url, "_blank");
//                 notification.remove();
//             });
//     }

//     // Remove after 10 seconds
//     setTimeout(() => {
//         if (document.getElementById(notificationId)) {
//             notification.remove();
//         }
//     }, 10000);
// }
