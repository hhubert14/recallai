# CORS Removal Notes

## Date: 2025-11-26

## Chrome Extension CORS Behavior

Chrome extensions have 3 contexts where fetch calls can be made, each with different CORS behavior:

### 1. Background Service Worker (`background.js`)
- **NOT subject to CORS**
- Uses extension privileges
- `host_permissions` allows it to bypass preflight (OPTIONS)
- Server does not need CORS headers

### 2. Popup / Options Pages (`popup.js`, `options.js`)
- **NOT subject to CORS**
- Gets special cross-origin privileges if listed in `host_permissions`
- Can bypass preflight and CORS headers

### 3. Content Scripts (`content.js`)
- **Fully subject to CORS**
- Runs inside the web page's sandbox
- Acts like the website's JavaScript
- Server must support preflight (OPTIONS) and `Access-Control-Allow-Origin`
- `host_permissions` does NOT give content scripts CORS bypass

### Our Extension's Architecture

All API calls in our extension are made from:
- `background.js` - calls `processVideo()`
- `popup.js` - calls `checkAuthStatus()`

Both are extension contexts (not content scripts), so they bypass CORS entirely with `host_permissions`.

---

## What was removed

The `OPTIONS` handler for CORS preflight requests was removed from:
- `src/app/api/v1/videos/[url]/process/route.ts`

### Removed code:

```typescript
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}
```

## Why it was removed

Chrome extensions with `host_permissions` in their manifest bypass CORS restrictions entirely. Since the `/api/v1/videos/[url]/process` endpoint is only called by the Chrome extension, and the extension has:

```json
"host_permissions": [
    "https://www.recallai.io/*",
    "http://localhost:3000/*"
]
```

...the browser does not send preflight `OPTIONS` requests, making the CORS handler dead code.

## If issues arise

If you encounter CORS errors in the future, it likely means:

1. **A content script is making fetch calls** - Content scripts don't get CORS bypass. Either:
   - Add CORS headers back to the server, OR
   - Use message passing to relay the request through the background script
2. **A new web client is calling this endpoint** (not the extension) - such as a web page making fetch requests
3. **The extension lost its `host_permissions`** - check `extension/manifest.json`

### To restore CORS support:

Add this `OPTIONS` handler back to the route file. Note: if using `credentials: "include"`, you cannot use `Access-Control-Allow-Origin: "*"`. You must specify the exact origin and add `Access-Control-Allow-Credentials: true`:

```typescript
export async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get("origin") || "";
    const allowedOrigins = [
        "https://www.recallai.io",
        "http://localhost:3000",
    ];

    const responseOrigin = allowedOrigins.includes(origin) ? origin : "";

    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": responseOrigin,
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
        },
    });
}
```
