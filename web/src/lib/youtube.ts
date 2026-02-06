// YouTube video IDs are exactly 11 characters (base64: A-Za-z0-9_-)
// Using {11} enforces this length for security (prevents injection of overly long strings)
const VIDEO_ID_PATTERN = "[a-zA-Z0-9_-]{11}";

const YOUTUBE_PATTERNS = [
  // Standard watch URL: youtube.com/watch?v=VIDEO_ID (includes www, m, music subdomains)
  new RegExp(
    `^https?:\\/\\/(?:www\\.|m\\.|music\\.)?youtube\\.com\\/watch\\?v=(${VIDEO_ID_PATTERN})(?:&|$)`
  ),
  // Shortened URL: youtu.be/VIDEO_ID
  new RegExp(`^https?:\\/\\/youtu\\.be\\/(${VIDEO_ID_PATTERN})(?:\\?|$)`),
  // Shorts URL: youtube.com/shorts/VIDEO_ID
  new RegExp(
    `^https?:\\/\\/(?:www\\.)?youtube\\.com\\/shorts\\/(${VIDEO_ID_PATTERN})(?:\\?|$)`
  ),
  // Live stream URL: youtube.com/live/VIDEO_ID
  new RegExp(
    `^https?:\\/\\/(?:www\\.)?youtube\\.com\\/live\\/(${VIDEO_ID_PATTERN})(?:\\?|$)`
  ),
  // Embed URL: youtube.com/embed/VIDEO_ID
  new RegExp(
    `^https?:\\/\\/(?:www\\.)?youtube\\.com\\/embed\\/(${VIDEO_ID_PATTERN})(?:\\?|$)`
  ),
  // Privacy-enhanced embed: youtube-nocookie.com/embed/VIDEO_ID
  new RegExp(
    `^https?:\\/\\/(?:www\\.)?youtube-nocookie\\.com\\/embed\\/(${VIDEO_ID_PATTERN})(?:\\?|$)`
  ),
  // Legacy embed URL (Flash era): youtube.com/v/VIDEO_ID
  new RegExp(
    `^https?:\\/\\/(?:www\\.)?youtube\\.com\\/v\\/(${VIDEO_ID_PATTERN})(?:\\?|$)`
  ),
  // Legacy embed shorthand: youtube.com/e/VIDEO_ID
  new RegExp(
    `^https?:\\/\\/(?:www\\.)?youtube\\.com\\/e\\/(${VIDEO_ID_PATTERN})(?:\\?|$)`
  ),
];

/**
 * Extracts the YouTube video ID from various YouTube URL formats.
 *
 * Supported formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 *
 * @param url - The YouTube URL to extract the video ID from
 * @returns The video ID if found, null otherwise
 */
export function extractYouTubeVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

/**
 * Normalizes a YouTube URL to canonical format.
 * Returns: https://www.youtube.com/watch?v=VIDEO_ID
 * This ensures consistent URL matching regardless of format or query params.
 *
 * @param url - The YouTube URL to normalize
 * @returns The canonical URL if valid, null otherwise
 */
export function normalizeYouTubeUrl(url: string): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return null;
  }
  return `https://www.youtube.com/watch?v=${videoId}`;
}
