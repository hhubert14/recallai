import { describe, it, expect } from 'vitest';
import { extractVideoId, normalizeYouTubeUrl } from './youtube';

describe('extractVideoId', () => {
  describe('standard watch URLs', () => {
    it('extracts video ID from youtube.com/watch?v=ID', () => {
      expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID without www prefix', () => {
      expect(extractVideoId('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID with http protocol', () => {
      expect(extractVideoId('http://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID with additional query parameters', () => {
      expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120')).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID with timestamp parameter before v', () => {
      expect(extractVideoId('https://www.youtube.com/watch?t=120&v=dQw4w9WgXcQ')).toBe(null);
    });
  });

  describe('shortened URLs (youtu.be)', () => {
    it('extracts video ID from youtu.be/ID', () => {
      expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID from youtu.be with http', () => {
      expect(extractVideoId('http://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID from youtu.be with timestamp', () => {
      expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ?t=120')).toBe('dQw4w9WgXcQ');
    });
  });

  describe('shorts URLs', () => {
    it('extracts video ID from youtube.com/shorts/ID', () => {
      expect(extractVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID from shorts without www', () => {
      expect(extractVideoId('https://youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });
  });

  describe('embed URLs', () => {
    it('extracts video ID from youtube.com/embed/ID', () => {
      expect(extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID from embed without www', () => {
      expect(extractVideoId('https://youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID from youtube-nocookie.com/embed/ID (privacy mode)', () => {
      expect(extractVideoId('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });
  });

  describe('legacy embed URLs', () => {
    it('extracts video ID from youtube.com/v/ID (Flash era format)', () => {
      expect(extractVideoId('https://www.youtube.com/v/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID from youtube.com/e/ID (shorthand)', () => {
      expect(extractVideoId('https://www.youtube.com/e/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });
  });

  describe('live stream URLs', () => {
    it('extracts video ID from youtube.com/live/ID', () => {
      expect(extractVideoId('https://www.youtube.com/live/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });
  });

  describe('mobile and music URLs', () => {
    it('extracts video ID from m.youtube.com/watch?v=ID', () => {
      expect(extractVideoId('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID from music.youtube.com/watch?v=ID', () => {
      expect(extractVideoId('https://music.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });
  });

  describe('invalid and non-YouTube URLs', () => {
    it('returns null for non-YouTube URLs', () => {
      expect(extractVideoId('https://www.google.com')).toBe(null);
    });

    it('returns null for YouTube homepage', () => {
      expect(extractVideoId('https://www.youtube.com')).toBe(null);
    });

    it('returns null for YouTube channel page', () => {
      expect(extractVideoId('https://www.youtube.com/@SomeChannel')).toBe(null);
    });

    it('returns null for YouTube search page', () => {
      expect(extractVideoId('https://www.youtube.com/results?search_query=test')).toBe(null);
    });

    it('returns null for empty string', () => {
      expect(extractVideoId('')).toBe(null);
    });

    it('returns null for invalid URL format', () => {
      expect(extractVideoId('not-a-url')).toBe(null);
    });
  });

  describe('video ID character handling', () => {
    it('handles video IDs with hyphens', () => {
      expect(extractVideoId('https://www.youtube.com/watch?v=abc-123_def')).toBe('abc-123_def');
    });

    it('handles video IDs with underscores', () => {
      expect(extractVideoId('https://www.youtube.com/watch?v=abc_123_def')).toBe('abc_123_def');
    });
  });
});

describe('normalizeYouTubeUrl', () => {
  it('normalizes standard watch URL', () => {
    expect(normalizeYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    );
  });

  it('normalizes URL with timestamp to canonical format', () => {
    expect(normalizeYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120')).toBe(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    );
  });

  it('normalizes shortened URL to canonical format', () => {
    expect(normalizeYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    );
  });

  it('normalizes shorts URL to canonical format', () => {
    expect(normalizeYouTubeUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    );
  });

  it('normalizes embed URL to canonical format', () => {
    expect(normalizeYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    );
  });

  it('returns null for non-YouTube URLs', () => {
    expect(normalizeYouTubeUrl('https://www.google.com')).toBe(null);
  });

  it('returns null for YouTube homepage', () => {
    expect(normalizeYouTubeUrl('https://www.youtube.com')).toBe(null);
  });

  it('returns null for empty string', () => {
    expect(normalizeYouTubeUrl('')).toBe(null);
  });
});
