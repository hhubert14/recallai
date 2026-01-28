import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentTab } from '@/hooks/useCurrentTab';
import { getStudySetByVideoUrl, processVideo, type StudySetContent } from '@/services/api';
import { normalizeYouTubeUrl } from '@/lib/youtube';

/**
 * Side panel status states:
 * - loading:         Auth, tab, or content is loading
 * - unauthenticated: User not logged in
 * - not_youtube:     Not on a YouTube video page
 * - not_processed:   Video exists but hasn't been processed yet
 * - processing:      Actively processing video
 * - ready:           Content available
 * - error:           Something failed
 */
export type SidePanelStatus =
  | 'loading'
  | 'unauthenticated'
  | 'not_youtube'
  | 'not_processed'
  | 'processing'
  | 'ready'
  | 'error';

export function useSidePanel() {
  const [content, setContent] = useState<StudySetContent | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { authState } = useAuth();
  const { isLoading: isTabLoading, url: tabUrl, isYouTubeVideo } = useCurrentTab({ listenForChanges: true });

  const videoUrl = useMemo(
    () => (tabUrl ? normalizeYouTubeUrl(tabUrl) : null),
    [tabUrl]
  );
  const status = useMemo((): SidePanelStatus => {
    if (authState === 'loading' || isTabLoading || isLoadingContent) return 'loading';
    if (authState === 'unauthenticated') return 'unauthenticated';
    if (!isYouTubeVideo) return 'not_youtube';
    if (isProcessing) return 'processing';
    if (error) return 'error';
    if (content && !content.exists) return 'not_processed';
    if (content?.exists) return 'ready';
    return 'loading';
  }, [authState, isTabLoading, isLoadingContent, isYouTubeVideo, isProcessing, error, content]);

  const handleProcessVideo = useCallback(async () => {
    if (!videoUrl) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await processVideo(videoUrl);
      if (result.success) {
        const newContent = await getStudySetByVideoUrl(videoUrl);
        setContent(newContent);
      } else {
        setError('Failed to process video');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, [videoUrl]);

  const refetch = useCallback(async () => {
    if (!videoUrl) return;
    setIsLoadingContent(true);
    setError(null);
    const result = await getStudySetByVideoUrl(videoUrl);
    setContent(result);
    setIsLoadingContent(false);
  }, [videoUrl]);

  // useEffect - fetch content when URL changes
  useEffect(() => {
    if (!videoUrl || !isYouTubeVideo || authState !== 'authenticated') {
      setContent(null);
      return;
    }

    let cancelled = false;
    const urlToFetch = videoUrl; // Capture for closure

    async function fetchContent() {
      setIsLoadingContent(true);
      setError(null);

      const result = await getStudySetByVideoUrl(urlToFetch);
      if (cancelled) return;

      if (result === null) {
        setError('Failed to fetch content');
      } else {
        setContent(result);
      }
      setIsLoadingContent(false);
    }

    fetchContent();
    return () => { cancelled = true; };
  }, [videoUrl, isYouTubeVideo, authState]);

  return {
    status,
    content,
    videoUrl,
    videoTitle: content?.video?.title ?? null,
    error,
    processVideo: handleProcessVideo,
    refetch,
  };
}
