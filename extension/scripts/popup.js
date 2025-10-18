import { validateToken } from "/services/api.js";

const API_BASE_URL = "https://www.recallai.io";

document.addEventListener("DOMContentLoaded", function () {
    const contentElement = document.getElementById("content");
    console.log("Popup script loaded");
    
    let userEmail = '';
    
    // Check authentication - get both email and token
    chrome.storage.local.get(["email", "authToken"], result => {
        console.log("Storage result:", result);
        
        if (result.email) {
            console.log("Email found:", result.email);
            userEmail = result.email;
        } else {
            console.warn("No email found in storage");
        }
        
        if (result.authToken) {
            console.log("Auth token found:", result.authToken);
            // Verify token
            validateToken(result.authToken)
                .then(isValid => {
                    console.log("Token validation result:", isValid);
                    if (isValid) {
                        showAuthenticatedState();
                    } else {
                        console.log("Token is invalid, showing unauthenticated state");
                        showUnauthenticatedState();
                    }
                })
                .catch(error => {
                    console.error("Error validating token:", error);
                    showUnauthenticatedState();
                });
        } else {
            console.log("No auth token found, showing unauthenticated state");
            showUnauthenticatedState();
        }
    });

    function showAuthenticatedState() {
        console.log("Showing authenticated state for:", userEmail);
        contentElement.innerHTML = `
            <div class="message">
                You're connected to RecallAI under ${userEmail}. Educational videos you watch on YouTube will be automatically processed and added to your learning library.
            </div>
            <div class="button-container">
                <a href="${API_BASE_URL}/dashboard" target="_blank" class="button">Go to My Dashboard</a>
            </div>
            <div class="button-container">
                <button id="sign-out-btn" class="button secondary">Disconnect</button>
            </div>
        `;

        document
            .getElementById("sign-out-btn")
            .addEventListener("click", () => {
                console.log("Sign out clicked");
                chrome.storage.local.remove(["authToken", "email"], () => {
                    console.log("Storage cleared");
                    userEmail = '';
                    showUnauthenticatedState();
                });
            });
    }

    function showUnauthenticatedState() {
        console.log("Showing unauthenticated state");
        contentElement.innerHTML = `
            <div class="message">
                Sign in and connect to RecallAI to automatically process educational YouTube videos and create summaries and study materials.
            </div>
            <div class="button-container">
                <button id="sign-in-btn" class="button">Sign in to RecallAI</button>
            </div>
        `;

        document.getElementById("sign-in-btn").addEventListener("click", () => {
            console.log("Sign in clicked");
            chrome.runtime.sendMessage({ action: "authenticate" }, response => {
                console.log("Auth response:", response);
                if (response && response.success) {
                    showAuthenticatedState();
                }
            });

            // Open sign in page
            window.open(`${API_BASE_URL}/auth/login`, "_blank");
        });
    }

    // function showVideoProcessedState(videoId) {
    //     contentElement.innerHTML = `
    //         <div class="message">
    //             <strong>Current video is in your library!</strong>
    //             <p>This educational video has already been processed by RecallAI.</p>
    //         </div>
    //         <a href="${API_BASE_URL}/videos/${videoId}" target="_blank" class="button">View Summary & Notes</a>
    //         <a href="${API_BASE_URL}/dashboard" target="_blank" class="button secondary">Go to My Library</a>
    //     `;
    // }
});
