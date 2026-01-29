import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSidePanel } from './useSidePanel';
import {
  mockBrowser,
  resetBrowserMocks,
  setupBrowserMock,
} from '@/test/mocks/browser';
import {
  createMockStudySetContent,
  createEmptyStudySetContent,
} from '@/test/factories/study-set.factory';

vi.mock('@/services/api', () => ({
  checkAuthStatus: vi.fn(),
  getStudySetByVideoUrl: vi.fn(),
  processVideo: vi.fn(),
}));

import { checkAuthStatus, getStudySetByVideoUrl, processVideo } from '@/services/api';

const mockCheckAuthStatus = vi.mocked(checkAuthStatus);
const mockGetStudySetByVideoUrl = vi.mocked(getStudySetByVideoUrl);
const mockProcessVideo = vi.mocked(processVideo);

describe('useSidePanel', () => {
  beforeEach(() => {
    setupBrowserMock();
    resetBrowserMocks();
    vi.clearAllMocks();
  });

  describe('status: loading', () => {
    it('returns loading status when auth is loading', async () => {
      mockCheckAuthStatus.mockImplementation(() => new Promise(() => {})); // Never resolves
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: true },
      ]);

      const { result } = renderHook(() => useSidePanel());

      expect(result.current.status).toBe('loading');
    });

    it('returns loading status when tab is loading', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useSidePanel());

      expect(result.current.status).toBe('loading');
    });

    it('returns loading status when content is being fetched', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: true },
      ]);
      mockGetStudySetByVideoUrl.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(mockGetStudySetByVideoUrl).toHaveBeenCalled();
      });

      expect(result.current.status).toBe('loading');
    });
  });

  describe('status: unauthenticated', () => {
    it('returns unauthenticated status when user is not logged in', async () => {
      mockCheckAuthStatus.mockResolvedValue(false);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: true },
      ]);

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('unauthenticated');
      });
    });

    it('does not fetch content when unauthenticated', async () => {
      mockCheckAuthStatus.mockResolvedValue(false);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: true },
      ]);

      renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(mockCheckAuthStatus).toHaveBeenCalled();
      });

      expect(mockGetStudySetByVideoUrl).not.toHaveBeenCalled();
    });
  });

  describe('status: not_youtube', () => {
    it('returns not_youtube status when on non-YouTube page', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.google.com', active: true },
      ]);

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('not_youtube');
      });
    });

    it('returns not_youtube status for YouTube homepage', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com', active: true },
      ]);

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('not_youtube');
      });
    });

    it('does not fetch content when not on YouTube video', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.google.com', active: true },
      ]);

      renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(mockCheckAuthStatus).toHaveBeenCalled();
      });

      expect(mockGetStudySetByVideoUrl).not.toHaveBeenCalled();
    });
  });

  describe('status: not_processed', () => {
    it('returns not_processed status when video has not been processed', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: true },
      ]);
      mockGetStudySetByVideoUrl.mockResolvedValue(createEmptyStudySetContent());

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('not_processed');
      });

      expect(result.current.content?.exists).toBe(false);
    });
  });

  describe('status: processing', () => {
    it('returns processing status during video processing', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: true },
      ]);
      mockGetStudySetByVideoUrl.mockResolvedValue(createEmptyStudySetContent());
      mockProcessVideo.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('not_processed');
      });

      act(() => {
        result.current.processVideo();
      });

      expect(result.current.status).toBe('processing');
    });
  });

  describe('status: ready', () => {
    it('returns ready status when content is available', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: true },
      ]);
      mockGetStudySetByVideoUrl.mockResolvedValue(createMockStudySetContent());

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('ready');
      });

      expect(result.current.content?.exists).toBe(true);
      expect(result.current.content?.questions.length).toBeGreaterThan(0);
      expect(result.current.content?.flashcards.length).toBeGreaterThan(0);
    });

    it('provides videoTitle from content', async () => {
      const mockContent = createMockStudySetContent({
        video: { id: 1, title: 'My Test Video', channelName: 'Test Channel' },
      });
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: true },
      ]);
      mockGetStudySetByVideoUrl.mockResolvedValue(mockContent);

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('ready');
      });

      expect(result.current.videoTitle).toBe('My Test Video');
    });
  });

  describe('status: error', () => {
    it('returns error status when content fetch fails', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: true },
      ]);
      mockGetStudySetByVideoUrl.mockResolvedValue(null);

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.error).toBe('Failed to fetch content');
    });

    it('returns error status when video processing fails', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: true },
      ]);
      mockGetStudySetByVideoUrl.mockResolvedValue(createEmptyStudySetContent());
      mockProcessVideo.mockResolvedValue({ success: false, alreadyExists: false, studySetPublicId: null });

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('not_processed');
      });

      await act(async () => {
        await result.current.processVideo();
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toBe('Failed to process video');
    });

    it('returns error status with error message when processVideo throws', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: true },
      ]);
      mockGetStudySetByVideoUrl.mockResolvedValue(createEmptyStudySetContent());
      mockProcessVideo.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('not_processed');
      });

      await act(async () => {
        await result.current.processVideo();
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toBe('Network error');
    });
  });

  describe('handleProcessVideo', () => {
    it('processes video and fetches content on success', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: true },
      ]);
      mockGetStudySetByVideoUrl
        .mockResolvedValueOnce(createEmptyStudySetContent())
        .mockResolvedValueOnce(createMockStudySetContent());
      mockProcessVideo.mockResolvedValue({ success: true, alreadyExists: false, studySetPublicId: 'new-id' });

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('not_processed');
      });

      await act(async () => {
        await result.current.processVideo();
      });

      expect(result.current.status).toBe('ready');
      expect(mockProcessVideo).toHaveBeenCalledWith('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    });

    it('does nothing when videoUrl is null', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.google.com', active: true },
      ]);

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('not_youtube');
      });

      await act(async () => {
        await result.current.processVideo();
      });

      expect(mockProcessVideo).not.toHaveBeenCalled();
    });

    it('shows error when content fetch fails after processing', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: true },
      ]);
      mockGetStudySetByVideoUrl
        .mockResolvedValueOnce(createEmptyStudySetContent())
        .mockResolvedValueOnce(null); // Fail to fetch after processing
      mockProcessVideo.mockResolvedValue({ success: true, alreadyExists: false, studySetPublicId: 'new-id' });

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('not_processed');
      });

      await act(async () => {
        await result.current.processVideo();
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toBe('Failed to load study set');
    });
  });

  describe('refetch', () => {
    it('refetches content when called', async () => {
      const initialContent = createMockStudySetContent({ questions: [] });
      const updatedContent = createMockStudySetContent();

      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: true },
      ]);
      mockGetStudySetByVideoUrl
        .mockResolvedValueOnce(initialContent)
        .mockResolvedValueOnce(updatedContent);

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('ready');
      });

      expect(result.current.content?.questions.length).toBe(0);

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.content?.questions.length).toBeGreaterThan(0);
    });

    it('does nothing when videoUrl is null', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.google.com', active: true },
      ]);

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('not_youtube');
      });

      const callCount = mockGetStudySetByVideoUrl.mock.calls.length;

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockGetStudySetByVideoUrl.mock.calls.length).toBe(callCount);
    });

    it('shows error when refetch fails', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: true },
      ]);
      mockGetStudySetByVideoUrl
        .mockResolvedValueOnce(createMockStudySetContent())
        .mockResolvedValueOnce(null);

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('ready');
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toBe('Failed to fetch content');
    });
  });

  describe('videoUrl normalization', () => {
    it('normalizes YouTube URL with timestamp', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120', active: true },
      ]);
      mockGetStudySetByVideoUrl.mockResolvedValue(createMockStudySetContent());

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('ready');
      });

      expect(result.current.videoUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(mockGetStudySetByVideoUrl).toHaveBeenCalledWith('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    });

    it('normalizes youtu.be URL', async () => {
      mockCheckAuthStatus.mockResolvedValue(true);
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://youtu.be/dQw4w9WgXcQ', active: true },
      ]);
      mockGetStudySetByVideoUrl.mockResolvedValue(createMockStudySetContent());

      const { result } = renderHook(() => useSidePanel());

      await waitFor(() => {
        expect(result.current.status).toBe('ready');
      });

      expect(result.current.videoUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    });
  });
});
