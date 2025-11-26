export function extractVideoId(url) {
    const youtubeRegex =
        /^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
    const match = url.match(youtubeRegex);
    return match ? match[1] : null;
}