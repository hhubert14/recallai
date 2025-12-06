import { useState, useEffect } from 'react';
import { extractVideoId } from '@/lib/youtube';

type CurrentTabState = {
  isLoading: boolean;
  url: string | null;
  videoId: string | null;
  isYouTubeVideo: boolean;
};

export function useCurrentTab() {
  const [tabState, setTabState] = useState<CurrentTabState>({
    isLoading: true,
    url: null,
    videoId: null,
    isYouTubeVideo: false,
  });

  useEffect(() => {
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        const url = tabs[0]?.url || null;
        const videoId = url ? extractVideoId(url) : null;
        setTabState({
          isLoading: false,
          url,
          videoId,
          isYouTubeVideo: videoId !== null,
        });
      })
      .catch(() => {
        setTabState({ isLoading: false, url: null, videoId: null, isYouTubeVideo: false });
      });
  }, []);

  return tabState;
}
