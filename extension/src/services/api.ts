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

export type ProcessVideoResult = {
  success: boolean;
  alreadyExists: boolean;
  studySetPublicId: string | null;
};

/**
 * Send video URL to backend for processing
 */
export async function processVideo(videoUrl: string): Promise<ProcessVideoResult> {
  try {
    const endpoint = "/api/v1/videos/[url]/process".replace(
      '[url]',
      encodeURIComponent(videoUrl)
    );
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      return { success: false, alreadyExists: false, studySetPublicId: null };
    }

    const data = await response.json();
    return {
      success: true,
      alreadyExists: data.data.alreadyExists,
      studySetPublicId: data.data.studySetPublicId,
    };
  } catch (error) {
    console.error('Video processing error:', error);
    return { success: false, alreadyExists: false, studySetPublicId: null };
  }
}

// Types for study set content API response
export type QuestionOption = {
  id: number;
  optionText: string;
  isCorrect: boolean;
  explanation: string | null;
};

export type Question = {
  id: number;
  questionText: string;
  options: QuestionOption[];
};

export type Flashcard = {
  id: number;
  front: string;
  back: string;
};

export type StudySetContent = {
  exists: boolean;
  studySet: {
    id: number;
    publicId: string;
    name: string;
  } | null;
  video: {
    id: number;
    title: string;
    channelName: string;
  } | null;
  summary: {
    id: number;
    content: string;
  } | null;
  questions: Question[];
  flashcards: Flashcard[];
};

/**
 * Fetch study set content for a video by URL
 */
export async function getStudySetByVideoUrl(videoUrl: string): Promise<StudySetContent | null> {
  try {
    const params = new URLSearchParams({ url: videoUrl });
    const response = await fetch(
      `${BASE_URL}/api/v1/study-sets/by-video-url?${params}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    return json.data as StudySetContent;
  } catch (error) {
    console.error('Error fetching study set:', error);
    return null;
  }
}
