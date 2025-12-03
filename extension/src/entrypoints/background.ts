import { processVideo } from '@/services/api';
import { extractVideoId } from '@/lib/youtube';

export default defineBackground(() => {
  console.log('RecallAI background script loaded');

  const processedVideos = new Map<string, number>(); // videoId -> timestamp

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      const videoId = extractVideoId(tab.url);

      if (videoId) {
        const lastProcessed = processedVideos.get(videoId);
        const now = Date.now();

        // Skip if processed in last 5 minutes
        if (lastProcessed && now - lastProcessed < 5 * 60 * 1000) {
          console.log(`Video ${videoId} already processed recently, skipping`);
          return;
        }

        processedVideos.set(videoId, now);
        console.log(`Processing video with ID: ${videoId}`);
        processVideo(tab.url);

        // Cleanup old entries every 100 requests
        if (processedVideos.size > 100) {
          const fiveMinutesAgo = now - 5 * 60 * 1000;
          for (const [id, timestamp] of processedVideos) {
            if (timestamp < fiveMinutesAgo) {
              processedVideos.delete(id);
            }
          }
        }
      }
    }
  });

  // TODO: Add handlers for backend notifications (success/failure) from video processing
  // External message listener (for future use)
  browser.runtime.onMessageExternal.addListener(
    (request, sender, sendResponse) => {
      if (!request.action) {
        console.error('No action specified in request');
        return;
      }
      console.log('Received external message:', request);
      sendResponse({ success: true });
      return true;
    }
  );
});
