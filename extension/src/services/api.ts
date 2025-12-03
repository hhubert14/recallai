import { BASE_URL } from '@/lib/constants';

/**
 * Check if user is authenticated via session cookie
 */
export async function checkAuthStatus(): Promise<boolean> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/users/me`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );
    return response.ok;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

/**
 * Send video URL to backend for processing
 */
export async function processVideo(videoUrl: string): Promise<boolean> {
  try {
    const endpoint = "/api/v1/videos/[url]/process".replace(
      '[url]',
      encodeURIComponent(videoUrl)
    );
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    console.error('Video processing error:', error);
    return false;
  }
}
