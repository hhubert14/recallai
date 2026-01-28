const YOUTUBE_PATTERNS = [
  // Standard watch URL: youtube.com/watch?v=VIDEO_ID
  /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
  // Shortened URL: youtu.be/VIDEO_ID
  /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/,
  // Shorts URL: youtube.com/shorts/VIDEO_ID
  /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
  // Embed URL: youtube.com/embed/VIDEO_ID
  /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
];

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

/**
 * Normalize a YouTube URL by removing timestamp and other non-essential parameters.
 * Returns a canonical URL format: https://www.youtube.com/watch?v=VIDEO_ID
 * This ensures consistent URL matching regardless of timestamp or other params.
 */
export function normalizeYouTubeUrl(url: string): string | null {
  const videoId = extractVideoId(url);
  if (!videoId) {
    return null;
  }
  return `https://www.youtube.com/watch?v=${videoId}`;
}
