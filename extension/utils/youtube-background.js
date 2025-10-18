// YouTube specific utilities

// export function detectEducationalContent(pageContent) {
//     // Implement proper educational content detection logic
//     // Consider using keywords, video metadata, and other signals
// }

export function extractVideoId(url) {
    const youtubeRegex =
        /^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
    const match = url.match(youtubeRegex);
    return match ? match[1] : null;
}