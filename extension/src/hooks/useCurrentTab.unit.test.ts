import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCurrentTab } from './useCurrentTab';
import {
  mockBrowser,
  resetBrowserMocks,
  setupBrowserMock,
  simulateTabUpdate,
  simulateTabActivated,
} from '@/test/mocks/browser';

describe('useCurrentTab', () => {
  beforeEach(() => {
    setupBrowserMock();
    resetBrowserMocks();
  });

  describe('initial state and basic functionality', () => {
    it('starts with loading state', () => {
      mockBrowser.tabs.query.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useCurrentTab());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.url).toBe(null);
      expect(result.current.isYouTubeVideo).toBe(false);
    });

    it('loads current tab URL on mount', async () => {
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.google.com', active: true },
      ]);

      const { result } = renderHook(() => useCurrentTab());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.url).toBe('https://www.google.com');
      expect(result.current.isYouTubeVideo).toBe(false);
    });

    it('identifies YouTube video URLs', async () => {
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: true },
      ]);

      const { result } = renderHook(() => useCurrentTab());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.url).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result.current.isYouTubeVideo).toBe(true);
    });

    it('handles YouTube shorts URLs', async () => {
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://www.youtube.com/shorts/abc123', active: true },
      ]);

      const { result } = renderHook(() => useCurrentTab());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isYouTubeVideo).toBe(true);
    });

    it('handles youtu.be URLs', async () => {
      mockBrowser.tabs.query.mockResolvedValue([
        { id: 1, url: 'https://youtu.be/dQw4w9WgXcQ', active: true },
      ]);

      const { result } = renderHook(() => useCurrentTab());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isYouTubeVideo).toBe(true);
    });

    it('handles empty tabs array', async () => {
      mockBrowser.tabs.query.mockResolvedValue([]);

      const { result } = renderHook(() => useCurrentTab());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.url).toBe(null);
      expect(result.current.isYouTubeVideo).toBe(false);
    });

    it('handles tabs without URL', async () => {
      mockBrowser.tabs.query.mockResolvedValue([{ id: 1, active: true }]);

      const { result } = renderHook(() => useCurrentTab());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.url).toBe(null);
      expect(result.current.isYouTubeVideo).toBe(false);
    });

    it('handles query error gracefully', async () => {
      mockBrowser.tabs.query.mockRejectedValue(new Error('Permission denied'));

      const { result } = renderHook(() => useCurrentTab());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.url).toBe(null);
      expect(result.current.isYouTubeVideo).toBe(false);
    });
  });

  describe('listenForChanges option', () => {
    it('does not add listeners when listenForChanges is false', async () => {
      mockBrowser.tabs.query.mockResolvedValue([{ id: 1, url: 'https://google.com', active: true }]);

      renderHook(() => useCurrentTab({ listenForChanges: false }));

      await waitFor(() => {
        expect(mockBrowser.tabs.query).toHaveBeenCalled();
      });

      expect(mockBrowser.tabs.onUpdated.addListener).not.toHaveBeenCalled();
      expect(mockBrowser.tabs.onActivated.addListener).not.toHaveBeenCalled();
    });

    it('adds listeners when listenForChanges is true', async () => {
      mockBrowser.tabs.query.mockResolvedValue([{ id: 1, url: 'https://google.com', active: true }]);

      renderHook(() => useCurrentTab({ listenForChanges: true }));

      await waitFor(() => {
        expect(mockBrowser.tabs.query).toHaveBeenCalled();
      });

      expect(mockBrowser.tabs.onUpdated.addListener).toHaveBeenCalled();
      expect(mockBrowser.tabs.onActivated.addListener).toHaveBeenCalled();
    });

    it('removes listeners on unmount when listenForChanges is true', async () => {
      mockBrowser.tabs.query.mockResolvedValue([{ id: 1, url: 'https://google.com', active: true }]);

      const { unmount } = renderHook(() => useCurrentTab({ listenForChanges: true }));

      await waitFor(() => {
        expect(mockBrowser.tabs.query).toHaveBeenCalled();
      });

      unmount();

      expect(mockBrowser.tabs.onUpdated.removeListener).toHaveBeenCalled();
      expect(mockBrowser.tabs.onActivated.removeListener).toHaveBeenCalled();
    });

    it('updates state when tab URL changes', async () => {
      mockBrowser.tabs.query.mockResolvedValue([{ id: 1, url: 'https://google.com', active: true }]);

      const { result } = renderHook(() => useCurrentTab({ listenForChanges: true }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.url).toBe('https://google.com');
      expect(result.current.isYouTubeVideo).toBe(false);

      // Simulate navigation to YouTube
      act(() => {
        simulateTabUpdate(
          1,
          { url: 'https://www.youtube.com/watch?v=abc123' },
          { id: 1, url: 'https://www.youtube.com/watch?v=abc123', active: true }
        );
      });

      expect(result.current.url).toBe('https://www.youtube.com/watch?v=abc123');
      expect(result.current.isYouTubeVideo).toBe(true);
    });

    it('ignores tab updates without URL change', async () => {
      mockBrowser.tabs.query.mockResolvedValue([{ id: 1, url: 'https://google.com', active: true }]);

      const { result } = renderHook(() => useCurrentTab({ listenForChanges: true }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Simulate tab update without URL change (e.g., title change)
      act(() => {
        simulateTabUpdate(1, {}, { id: 1, url: 'https://google.com', active: true });
      });

      expect(result.current.url).toBe('https://google.com');
    });

    it('ignores tab updates for inactive tabs', async () => {
      mockBrowser.tabs.query.mockResolvedValue([{ id: 1, url: 'https://google.com', active: true }]);

      const { result } = renderHook(() => useCurrentTab({ listenForChanges: true }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Simulate update for inactive tab
      act(() => {
        simulateTabUpdate(
          2,
          { url: 'https://youtube.com/watch?v=xyz' },
          { id: 2, url: 'https://youtube.com/watch?v=xyz', active: false }
        );
      });

      // URL should not change
      expect(result.current.url).toBe('https://google.com');
    });

    it('updates state when switching to a different tab', async () => {
      mockBrowser.tabs.query.mockResolvedValue([{ id: 1, url: 'https://google.com', active: true }]);
      mockBrowser.tabs.get.mockResolvedValue({
        id: 2,
        url: 'https://www.youtube.com/watch?v=abc123',
      });

      const { result } = renderHook(() => useCurrentTab({ listenForChanges: true }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.url).toBe('https://google.com');

      // Simulate switching to another tab
      await act(async () => {
        simulateTabActivated({ tabId: 2 });
      });

      await waitFor(() => {
        expect(result.current.url).toBe('https://www.youtube.com/watch?v=abc123');
      });

      expect(result.current.isYouTubeVideo).toBe(true);
    });

    it('handles tab.get error gracefully on tab activation', async () => {
      mockBrowser.tabs.query.mockResolvedValue([{ id: 1, url: 'https://google.com', active: true }]);
      mockBrowser.tabs.get.mockRejectedValue(new Error('Tab not found'));

      const { result } = renderHook(() => useCurrentTab({ listenForChanges: true }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Simulate switching to a non-existent tab
      await act(async () => {
        simulateTabActivated({ tabId: 999 });
      });

      // State should remain unchanged (error is silently caught)
      expect(result.current.url).toBe('https://google.com');
    });
  });
});
