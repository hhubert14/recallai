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
