import { checkAuthStatus } from "/services/api.js";

// NOTE: Change to "https://www.recallai.io" for production
// For local development, use "http://localhost:3000"
const API_BASE_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", function () {
    const contentElement = document.getElementById("content");
    console.log("Popup script loaded");

    // Check authentication via session cookie
    checkAuthStatus()
        .then(isAuthenticated => {
            console.log("Auth status:", isAuthenticated);
            if (isAuthenticated) {
                showAuthenticatedState();
            } else {
                showUnauthenticatedState();
            }
        })
        .catch(error => {
            console.error("Error checking auth:", error);
            showUnauthenticatedState();
        });

    function showAuthenticatedState() {
        console.log("Showing authenticated state");
        contentElement.innerHTML = `
            <div class="message">
                You're connected to RecallAI. Educational videos you watch on YouTube will be automatically processed and added to your learning library.
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
                // Open logout page which automatically signs the user out
                window.open(`${API_BASE_URL}/auth/logout`, "_blank");
            });
    }

    function showUnauthenticatedState() {
        console.log("Showing unauthenticated state");
        contentElement.innerHTML = `
            <div class="message">
                Sign in to RecallAI to automatically process educational YouTube videos and create summaries and study materials.
            </div>
            <div class="button-container">
                <button id="sign-in-btn" class="button">Sign in to RecallAI</button>
            </div>
        `;

        document.getElementById("sign-in-btn").addEventListener("click", () => {
            console.log("Sign in clicked");
            // Open sign in page
            window.open(`${API_BASE_URL}/auth/login`, "_blank");
        });
    }
});
