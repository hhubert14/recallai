import { useState, useEffect } from 'react';
import { extractVideoId } from '@/lib/youtube';

export interface CurrentTabInfo {
  url: string | null;
  videoId: string | null;
  isYouTube: boolean;
}

/**
 * Hook to get current tab information
 * Returns the current tab's URL and YouTube video ID if applicable
 */
export function useCurrentTab() {
  const [tabInfo, setTabInfo] = useState<CurrentTabInfo>({
    url: null,
    videoId: null,
    isYouTube: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCurrentTab = async () => {
      try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        
        if (tab?.url) {
          const videoId = extractVideoId(tab.url);
          setTabInfo({
            url: tab.url,
            videoId,
            isYouTube: videoId !== null,
          });
        }
      } catch (error) {
        console.error('Error getting current tab:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentTab();

    // Listen for tab updates
    const handleTabUpdate = (tabId: number, changeInfo: any, tab: any) => {
      if (changeInfo.url && tab.active) {
        const videoId = extractVideoId(changeInfo.url);
        setTabInfo({
          url: changeInfo.url,
          videoId,
          isYouTube: videoId !== null,
        });
      }
    };

    browser.tabs.onUpdated.addListener(handleTabUpdate);

    return () => {
      browser.tabs.onUpdated.removeListener(handleTabUpdate);
    };
  }, []);

  return { tabInfo, isLoading };
}
