# Chrome Extension Local Testing

## Testing Locally

When testing the Chrome extension locally with your dev server, update the API base URL:

**File:** `extension/config/constants.js`

```javascript
export const API = {
    BASE_URL: "http://localhost:3000",  // Change to localhost for local testing
    ENDPOINTS: {
        VALIDATE_TOKEN: "/api/v1/auth/extension/validate-token",
        PROCESS_VIDEO: "/api/v1/videos/[url]/extension/process",
    },
};
```

Then reload the extension in Chrome (`chrome://extensions/`).

## ⚠️ Important

**Remember to change it back to `https://www.recallai.io` before deploying to production!**
