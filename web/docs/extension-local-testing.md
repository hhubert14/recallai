# Chrome Extension Local Testing

## Testing Locally

When testing the Chrome extension locally with your dev server, update the API base URL in **TWO** files:

### 1. Update `extension/config/constants.js`

```javascript
export const API = {
    // NOTE: Change to "https://www.recallai.io" for production
    // For local development, use "http://localhost:3000"
    BASE_URL: "http://localhost:3000",
    ENDPOINTS: {
        CHECK_AUTH: "/api/v1/users/me",
        PROCESS_VIDEO: "/api/v1/videos/[url]/extension/process",
    },
};
```

### 2. Update `extension/scripts/popup.js`

```javascript
// NOTE: Change to "https://www.recallai.io" for production
// For local development, use "http://localhost:3000"
const API_BASE_URL = "http://localhost:3000";
```

Then reload the extension in Chrome (`chrome://extensions/`).

## ⚠️ Important

**Remember to change BOTH files back to `https://www.recallai.io` before deploying to production!**

The comments in the code will remind you which value to use for each environment.
