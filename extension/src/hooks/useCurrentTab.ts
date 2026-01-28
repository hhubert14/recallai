import { useState, useEffect, useCallback } from 'react';
import { type Browser } from 'wxt/browser';
import { extractVideoId } from '@/lib/youtube';

type CurrentTabState = {
  isLoading: boolean;
  url: string | null;
  isYouTubeVideo: boolean;
};

type UseCurrentTabOptions = {
  /** Enable listening for tab changes (useful for side panel) */
  listenForChanges?: boolean;
};

export function useCurrentTab(options: UseCurrentTabOptions = {}) {
  const { listenForChanges = false } = options;

  const [tabState, setTabState] = useState<CurrentTabState>({
    isLoading: true,
    url: null,
    isYouTubeVideo: false,
  });

  const updateTabState = useCallback((url: string | null) => {
    const isYouTubeVideo = url ? extractVideoId(url) !== null : false;
    setTabState({
      isLoading: false,
      url,
      isYouTubeVideo,
    });
  }, []);

  const fetchCurrentTab = useCallback(async () => {
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      updateTabState(tabs[0]?.url || null);
    } catch {
      setTabState({ isLoading: false, url: null, isYouTubeVideo: false });
    }
  }, [updateTabState]);

  useEffect(() => {
    // Initial fetch
    fetchCurrentTab();

    if (!listenForChanges) return;

    // Listen for tab URL changes (navigation within the same tab)
    const handleTabUpdated = (
      tabId: number,
      changeInfo: Browser.tabs.OnUpdatedInfo,
      tab: Browser.tabs.Tab
    ) => {
      // Only update if URL changed and tab is active
      if (changeInfo.url && tab.active) {
        updateTabState(changeInfo.url);
      }
    };

    // Listen for tab activation changes (switching tabs)
    const handleTabActivated = async (activeInfo: Browser.tabs.OnActivatedInfo) => {
      try {
        const tab = await browser.tabs.get(activeInfo.tabId);
        updateTabState(tab.url || null);
      } catch {
        // Tab might not exist
      }
    };

    browser.tabs.onUpdated.addListener(handleTabUpdated);
    browser.tabs.onActivated.addListener(handleTabActivated);

    return () => {
      browser.tabs.onUpdated.removeListener(handleTabUpdated);
      browser.tabs.onActivated.removeListener(handleTabActivated);
    };
  }, [fetchCurrentTab, listenForChanges, updateTabState]);

  return tabState;
}
